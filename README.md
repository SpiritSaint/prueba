# Prueba

El repositorio contiene el código fuente de la solución a la prueba técnica de la empresa MAS Analytics. 

## Estructura del repositorio

Contiene dos carpetas:

- **/server** que contiene el código fuente de un servidor HTTP's escrito Node. La aplicación realiza una conexión con Redis para consultar o insertar coordenadas en memoria de un listado de ciudades. También cuenta con un servidor de WebSockets que permite refrescar la temperatura y hora de las ciudades. También posee la característica de guardar en Redis los errores producidos por la condicional de probabilidad de fallo.
- **/client** que contiene el código fuente de una aplicación construida con Angular. La aplicación realiza inicialmente una petición HTTP para consultar las temperaturas, con la característica de reintentar en caso de que el servidor retorne un error. También realiza una conexión WebSocket con el servidor para ir solicitando en intervalos de 10 segundos la nueva información para desplegar en pantalla.


## Requerimientos

1. Para desplegar en un entorno de producción se requiere un certificado SSL compuesto por el certificado y su clave privada. El cual será generado al ejecutar las instalaciones.

2. Se require un servidor Linux con mínimo 2 núcleos y 2 GB de RAM para realizar las tareas de construcción.

3. Se require un nombre de dominio válido apuntando al servidor de producción. 

## Instrucciones

Para usos prácticos el tutorial fue escrito para ser llevado a cabo utilizando una máquina con sistema operativo Ubuntu 18.04, utilizando los servicios de Google Cloud Platform.

### 1. Instalación de dependencias

#### Certbot

Para instalar certbot debes ejecutar los siguientes comandos:

```
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
```

#### Nginx y Redis

Para instalar redis debes ejecutar el siguiente comando:

```
apt-get install redis nginx -y
```

#### Node

Para instalar node debes incluir el repositorio de NodeSource e instalar el paquete:

```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Angular y PM2

Para instalar la linea de comandos de angular y el monitor de procesos debes ejecutar el siguiente comando:

```
sudo npm install -g @angular/cli
sudo npm install -g pm2
```

### 2. Configuración de entorno

Para construir el servidor debemos configurar ciertos parámetros tales como `WEATHER_API_TOKEN`, `HTTP_PORT`, `WS_PORT`. Estas configuraciones están disponibles en el archivo `/server/.env`

- Para el `WEATHER_API_TOKEN` debes darte de alta de la plataforma de Darksky.net y copiar el código de acceso  a la plataforma.
- El `HTTP_PORT` es el puerto configurado para ofrecer la API en Node con los datos iniciales.
- El `WS_PORT` es el puerto para ofrecer el servidor de WebSockets.

Para construir el cliente debemos configurar ciertos parámetros tales como `app_url`, `websocket_port`, `backend_port`. Estas configuraciones se encuentran disponible en el archivo `/client/src/environment.prod.ts`.
  
- El `app_url` corresponde al nombre del dominio del servicio.
- El `websocket_port` corresponde al `WS_PORT` de la configuración del servidor.
- El `backend_port` corresponde al `HTTP_PORT` de la configuración del servidor.

### 3. Construcción de los artefactos

Para construir las aplicaciones primero debes instalar sus dependencias, en ambas carpetas debes ejecutar el siguiente comando:

```
sudo npm install
```

Una vez instalado las dependencias debes construir el cliente ejecutando en la carpeta `client` el siguiente comando:

```
sudo ng build
```

### 4. Generación del certificado SSL

Primero debemos modificar una linea de la configuración de nginx en el archivo `/etc/nginx/sites-enabled/default`:

```
server_name www.dominio.cl;
```

Luego debemos refrescar la configuración ejecutando:

```
service nginx reload
```

Para generar el certificado debemos ejecutar y seguir las instrucciones del comando:

```
certbot --nginx
```

En la ejecución se nos preguntará por el nombre del dominio y se realizará una prueba para su verificación.

### 4. Despliegue de los artefactos

Una vez obtenido el directorio `/dist ` de la carpeta `client`, debes mover su contenido a la carpeta `/var/www/html` para su distribución. Para ello puedes ejecutar el siguiente comando:

```
# Eliminar archivos ejemplo de nginx
sudo rm /var/www/html

# Mover la carpeta client del directorio dist a /var/www/html
mv /client/dist/client /var/www/html
```

Para desplegar el servidor solo debes iniciar un demonio utilizando PM2.

```
pm2 start /server/app.js
```

### 4. Probar aplicación

Luego de todos los pasos podrás acceder directamente en:

```
https://dominio.cl
```

## Aclaraciones

1. La Api de Forecast.io ahora se llama Darksky.net.

## Demo

Disponible temporalmente.

https://iantorres.cl
