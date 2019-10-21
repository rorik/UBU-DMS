# Práctica DMS curso 2019-2020

Práctica obligatoria de la asignatura **Diseño y Mantenimiento del Software** de 4º del **Grado de Ingeniería en Informática de la Universidad de Burgos** para el curso 2019-2020.

## Construcción y control de los servicios

### docker-compose

Para construir las imágenes de los servicios utilizando `docker-compose`, ejecutar el siguiente comando:

```bash
docker-compose -f docker/config/base.yml build
```

La configuración también permite levantar los servicios de un modo similar:

```bash
docker-compose -f docker/config/base.yml up -d
```

Para detener y borrar los servicios, podemos usar el siguiente comando:

```bash
docker-compose -f docker/config/base.yml rm -sfv
```

La configuración por defecto creará los siguientes servicios:

- `dms1920-auth-server`: El servidor de autenticación y usuarios, escuchando en el puerto 1234 con un API REST (ver más abajo)
- `dms1920-hub`: El punto de acceso a los servidores de juego registrados, escuchando en el puerto 4567 con un API REST (ver más abajo)

## Servicios

### dms1920-auth-server

Es el servidor de autenticación y gestión de usuarios.

Se trata de un servicio sencillo de solo dos capas (presentación a través de un API REST y acceso a datos a través de un ORM con una base de datos SQLite)

#### API REST

La comunicación con el servicio se realiza a través de un API REST:

- `/`: Verificación del estado del servidor. No realiza ninguna operación, pero permite conocer si el servidor está funcionando sin miedo a alterar su estado en modo alguno.
  - **Método**: `GET`
  - **Respuesta**:
    - `200`: El servidor está funcionando correctamente.
- `/user/create`: Endpoint de creación de usuarios.
  - **Método**: `POST`
  - **Parámetros**:
    - `username`: El nombre de usuario (debe ser único en el servidor). 32 caracteres máximo.
    - `password`: La clave del nuevo usuario.
  - **Respuesta**:
    - `200`: El usuario fue creado con éxito.
    - `500`: El usuario no pudo ser creado (probablemente por existir uno con un mismo nombre)
- `/user/login`: Endpoint de login de usuarios.
  - **Método**: `POST`
  - **Parámetros**:
    - `username`: El nombre de usuario.
    - `password`: La clave del usuario.
  - **Respuesta**:
    - `200`: El usuario se autenticó con éxito. El contenido de la respuesta es el token de autenticación.
    - `401`: Las credenciales eran incorrectas.
- `/user/info`: Endpoint de información de usuario.
  - **Método**: `GET`
  - **Parámetros**:
    - `username`: (Opcional) El nombre de usuario del cual obtener información, no es necesario pasar el token.
    - `token`: (Opcional) El token que identifica al usuario, username debe estar vacío.
  - **Respuesta**:
    - `200`: La sesión o el usuario existen. El contenido de la respuesta es un objeto JSON con información sobre el usuario.
    - `401`: El token es incorrecto.
    - `404`: El username no se corresponde con ningún usuario existente.
- `/token/check`: Endpoint de validación de tokens.
  - **Método**: `GET`
  - **Parámetros**:
    - `token`: El token a validar.
  - **Respuesta**:
    - `200`: El token es correcto y pertenece a un usuario autenticado.
    - `401`: El token dado es incorrecto.
- `/score`: Endpoint de listado de puntuaciones ordenadas descendentemente.
  - **Método**: `GET`
  - **Respuesta**:
    - `200`: El listado de puntuaciones codificado en JSON en el contenido de la respuesta.
- `/score/add`: Endpoint de incremento de puntiuaciones de un usuario autenticado.
  - **Método**: `POST`
  - **Parámetros**:
    - `token`: El token de autenticación del usuario cuya puntuación se va a actualizar.
    - `games_won`: (Opcional) El incremento (o decremento si es negativo) en el número de partidas ganadas por el usuario.
    - `games_lost`: (Opcional) El incremento (o decremento si es negativo) en el número de partidas perdidas por el usuario.
    - `score`: (Opcional) El incremento (o decremento si es negativo) en la puntuación del usuario.
  - **Respuesta**:
    - `200`: La puntuación fue actualizada con éxito.
    - `401`: El token dado es incorrecto.

#### Configuración

El servidor usa las siguientes variables de entorno para su configuración:

- `AUTH_SERVER_PORT`: El puerto en el que publicará su API REST.
- `AUTH_SERVER_DATABASE_PATH`: La ruta del fichero de base de datos para el servidor de autenticación.

### dms1920-hub

Es el servidor de acceso centralizado a los servidores de juego registrados.

Se trata de un servicio sencillo de solo dos capas (presentación a través de un API REST y acceso a datos a través de una capa de comunicaciones REST hacia el servidor de autenticación y un modelo interno)

#### API REST

La comunicación con el servicio se realiza a través de un API REST:

- `/`: Verificación del estado del servidor. No realiza ninguna operación, pero permite conocer si el servidor está funcionando sin miedo a alterar su estado en modo alguno.
  - **Método**: `GET`
  - **Respuesta**:
    - `200`: El servidor está funcionando correctamente.
- `/server`: Obtener el listado de servidores actualmente registrados.
  - **Método**: `GET`
  - **Parámetros**:
    - `token`: El token de autenticación del usuario que solicita el listado.
  - **Respuesta**:
    - `200`: El listado de servidores registrados serializado en JSON en el contenido de la respuesta.
    - `401`: El token no se corresponde con un usuario autenticado.
- `/server/register`: Registra un nuevo servidor de juego.
  - **Método**: `POST`
  - **Parámetros**:
    - `name`: El nombre del servidor.
    - `host`: El host donde se encuentra el servidor de juego.
    - `port`: El puerto por el que comunicarse con el API REST del servidor de juego.
    - `token`: El token de autenticación del usuario que solicita registrar el servidor.
  - **Respuesta**:
    - `200`: El servidor se registró correctamente.
    - `401`: El token no se corresponde con un usuario autenticado.
    - `403`: Un servidor ya existe con este nombre y el usuario autenticado no es el dueño de este.
    - `500`: Algún error sucedió al intentar registrar el servidor.
- `/server/unregister`: Da de baja un servidor de juego.
  - **Método**: `POST`
  - **Parámetros**:
    - `name`: El nombre del servidor.
    - `token`: El token de autenticación del usuario que solicita dar de baja el servidor.
  - **Respuesta**:
    - `200`: El servidor se dió de baja correctamente.
    - `401`: El token no se corresponde con un usuario autenticado.
    - `403`: El usuario autenticado no es el dueño del servidor.

#### Configuración

El servidor usa las siguientes variables de entorno para su configuración:

- `HUB_SERVER_PORT`: El puerto en el que publicará su API REST.
- `AUTH_SERVER_HOST`: El host en el que se encuentra el servidor de autenticación.
- `AUTH_SERVER_PORT`: El puerto en el que está publicado el API REST del servidor de autenticación.
