const axios = require('axios').default;

/**
 * Default collection of key, latitude and longitude.
 * @type {*[]}
 */
let defaultCoordinates = [
    {
        'key':'Santiago, CL',
        'latitude':-33.4372,
        'longitude':-70.6506
    },
    {
        'key':'Zurich, CH',
        'latitude': 47.36667,
        'longitude': 8.55
    },
    {
        'key':'Auckland, NZ',
        'latitude': -36.848461,
        'longitude': 174.763336
    },
    {
        'key':'Londres, UK',
        'latitude': 51.509865,
        'longitude': -0.118092
    },
    {
        'key':'Georgia, USA',
        'latitude': 33.247875,
        'longitude': -83.441162
    },
];

/**
 * Method to fetch coordinates stored on redis
 *
 * @param client
 * @returns {Promise<any>}
 */
let fetchCoordinates = async (client) => {
    // By default coordinates doesn't exist
    let exists = false;

    // Check if coordinates exists
    await client.exists('coordinates').then((data, error) => {
        exists = data;
    });

    // By default coordinates must be empty
    let coordinates = [];

    // If checking exists
    if (exists) {

        // Fetch from redis the coordinates
        await client.get('coordinates').then((data, error) => {
            coordinates = data;
        });
    } else {
        // Coordinates doesn't exists on redis

        // Generate default coordinates list
        coordinates = JSON.stringify(defaultCoordinates);

        await client.set([
            'coordinates', coordinates
        ]);
    }

    // Return pretty JSON
    return JSON.parse(coordinates);
};

/**
 * Method to fetch temperature by coordinate using darksky API
 *
 * @param coordinate
 * @returns {Promise<{temperature: *, time: {zone: *, time: *}}>}
 */
let fetchTemperature = async (coordinate) => {
    // Fetch temperature by coordinate
    let res = await axios.get(`https://api.darksky.net/forecast/${process.env.WEATHER_API_TOKEN}/${coordinate.latitude},${coordinate.longitude}`);

    // Return currently temperature
    return {
        time: {
            zone: res.data.timezone,
            time: res.data.currently.time
        },
        temperature: res.data.currently.temperature
    };
};

module.exports = { fetchCoordinates, fetchTemperature };
