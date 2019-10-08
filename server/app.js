const express = require('express');
const app = express();
const asyncRedis = require("async-redis");
const redisClient = asyncRedis.createClient();
const fetcher = require('./repositories/fetcher');
const logger = require('./repositories/logger');
const WebSocketServer = require('websocket').server;
const https = require('https');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

let cert = fs.readFileSync(`/etc/letsencrypt/live/${process.env.SITE_URL}/cert.pem`);
let key = fs.readFileSync(`/etc/letsencrypt/live/${process.env.SITE_URL}/privkey.pem`);

// Create HTTP server for WebSockets
const server = https.createServer({
    cert: cert,
    key: key
});

console.log(cert)

// Boot HTTP server for listening
server.listen(process.env.WS_PORT, function() {
    console.log(`Websocket server serving on port ${process.env.WS_PORT}`)
});

// Create WebSockets server
wsServer = new WebSocketServer({
    server: server,
    httpServer: server
});

// Add listeners to WebSockets server
wsServer.on('request', function(request) {

    // Retrieve the connection
    let connection = request.accept(null, request.origin);

    // On connection
    connection.on('connection', function(message) {
        console.log('Client connected');
    });

    // On message
    connection.on('message', async function(message) {
        if (message.type === 'utf8') {
            // Parse WebSocket message
            let data = JSON.parse(message.utf8Data);

            // If type message is action and the action name is "refreshLocations"
            if (data.type === 'action' && data.name === 'refreshLocations') {

                // Fetch coordinates
                let coordinates = await fetcher.fetchCoordinates(redisClient);

                // Fetch temperature by coordinate
                let fetchTemperatures = await coordinates.map((x) => {
                    return fetcher.fetchTemperature(x);
                });

                // Resolve temperature fetching promises
                const temperatures = await Promise.all(fetchTemperatures);

                // Send response to client
                connection.send(JSON.stringify({
                    type: 'response',
                    name: 'coordinates',
                    coordinates: coordinates.map((coordinate, index) => {
                        return {
                            key: coordinate.key,
                            latitude: coordinate.latitude,
                            longitude: coordinate.longitude,
                            temperature: (temperatures[index].temperature-32) / 1.8, // To celsius
                            time: temperatures[index].time // To celsius
                        }
                    })
                }))
            }
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

redisClient.on('connect', function() {
    console.log('Redis client connected');
});

redisClient.on('error', function (error) {
    console.log('Something went wrong ' + error);
});

app.get('/', async function (request, response) {
    try {
        if (Math.random(0, 1) < 0.1) {
            throw new Error('How unfortunate! The API Request Failed')
        } else {
            let coordinates = await fetcher.fetchCoordinates(redisClient);

            let fetchTemperatures = await coordinates.map((x) => {
                return fetcher.fetchTemperature(x);
            });

            const temperatures = await Promise.all(fetchTemperatures);

            await response.json({
                coordinates: coordinates.map((coordinate, index) => {
                    return {
                        key: coordinate.key,
                        latitude: coordinate.latitude,
                        longitude: coordinate.longitude,
                        temperature: (temperatures[index].temperature-32) / 1.8, // To celsius
                        time: temperatures[index].time // To celsius
                    }
                })
            });
        }
    } catch (error) {
        console.log('Errors must be stored on redis using hash "errors"');
        await logger.saveError(redisClient, error);
        await response.json({
            status: 'error'
        })
    }
});

https.createServer({
    cert: cert,
    key: key
},app).listen(process.env.HTTP_PORT, function () {
    console.log(`Temperature app serving on port ${process.env.HTTP_PORT}`);
});
