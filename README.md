
# API de Usuarios con Node.js y MySQL

API REST para la gestión de usuarios, incluyendo registro, inicio de sesión y actualización de tokens, utilizando Express, JWT y MySQL.

## Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Configuración

Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables de entorno. Estas son necesarias para la conexión a la base de datos y la generación de tokens JWT.

```
# Credenciales de la Base de Datos MySQL
DB_HOST=tu_host_de_mysql
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=tu_base_de_datos

# Secretos para JWT
JWT_SECRET=tu_secreto_para_access_token
JWT_REFRESH_SECRET=tu_secreto_para_refresh_token
```

## Script para la Base de Datos (MySQL)

Utiliza el siguiente script en tu cliente de MySQL para crear la tabla `Usuarios` que necesita la aplicación.

```sql
CREATE TABLE Usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Scripts Disponibles

- `npm start`: Inicia el servidor en modo de producción.
- `npm run dev`: Inicia el servidor en modo de desarrollo con `nodemon` para recarga automática.
