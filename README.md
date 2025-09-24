
# API REST de Gestión de Usuarios con Autenticación JWT y SQL Server

Esta es una API RESTful construida con Node.js, Express y SQL Server para la gestión de usuarios. Incluye registro, inicio de sesión con tokens JWT (Access y Refresh Tokens) y operaciones CRUD sobre los usuarios.

## Características Principales

- **Autenticación Basada en Tokens**: Uso de JSON Web Tokens (JWT) para asegurar los endpoints.
  - **Access Token**: De corta duración (24 horas), para acceder a rutas protegidas.
  - **Refresh Token**: De larga duración (7 días), para obtener un nuevo access token sin volver a iniciar sesión.
- **Base de Datos SQL Server**: Persistencia de datos utilizando `mssql`.
- **Hashing de Contraseñas**: Las contraseñas se almacenan de forma segura utilizando `bcrypt.js`.
- **Validación y Limpieza**: Validación de entradas en el lado del servidor.
- **Middleware de Seguridad**: Uso de `helmet` para seguridad básica de cabeceras HTTP y `express-rate-limit` para prevenir ataques de fuerza bruta.
- **Variables de Entorno**: Configuración gestionada a través de `dotenv`.
- **Estructura Modular**: Código organizado en controladores, modelos y rutas.

## Endpoints de la API

Todas las respuestas de la API siguen una estructura consistente:
`{ success: boolean, message: string, data: object | null, total?: number }`

### Autenticación (`/api/auth`)

- **`POST /registro`**: Registra un nuevo usuario.
  - **Body**: `{ "nombre": "John Doe", "correo": "john.doe@example.com", "contrasena": "password123", "username": "johndoe" }`
  - **Respuesta Exitosa (201)**: `data` contiene el objeto del usuario (sin contraseña) y los tokens.

- **`POST /login`**: Inicia sesión.
  - **Body**: `{ "correo": "john.doe@example.com", "contrasena": "password123" }` o `{ "username": "johndoe", "contrasena": "password123" }`
  - **Respuesta Exitosa (200)**: `data` contiene el objeto del usuario (sin contraseña) y los tokens.

- **`POST /refresh`**: Renueva el `accessToken`.
  - **Body**: `{ "refreshToken": "..." }`
  - **Respuesta Exitosa (200)**: `data` contiene el nuevo `accessToken` y `refreshToken`.

### Usuarios (`/api/usuarios`)

_**Nota**: Todas las rutas de usuarios requieren un `Authorization: Bearer <accessToken>` en las cabeceras._

- **`GET /perfil`**: Obtiene el perfil del usuario autenticado.

- **`GET /`**: Obtiene una lista de todos los usuarios (solo datos públicos).

- **`GET /:id`**: Obtiene un usuario específico por su ID.

- **`PUT /:id`**: Actualiza los datos de un usuario (nombre, correo, username).
  - **Body**: `{ "nombre": "Jane Doe", "correo": "jane.doe@example.com" }`
  - _Restricción_: Por defecto, un usuario solo puede actualizar su propio perfil.

- **`DELETE /:id`**: Elimina un usuario.

## Configuración y Despliegue

### 1. Script de la Base de Datos

Ejecuta el siguiente script en tu base de datos SQL Server para crear la tabla `Usuarios`:

```sql
CREATE TABLE Usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100) NOT NULL,
    correo NVARCHAR(100) NOT NULL UNIQUE,
    contrasena NVARCHAR(255) NOT NULL,
    username NVARCHAR(50) NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT GETDATE()
);
```

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Configuración del servidor
PORT=8080
CORS_ORIGIN=http://localhost:3000

# Configuración de la Base de Datos SQL Server
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SERVER=localhost
DB_DATABASE=your_db_name
# Para Azure SQL o conexiones encriptadas, pon DB_ENCRYPT en 'true'
DB_ENCRYPT=false 
# Ponlo en 'true' para desarrollo local con certificados autofirmados
DB_TRUST_SERVER_CERTIFICATE=true

# Secretos para JWT
JWT_SECRET=tu_secreto_super_secreto_para_access_tokens
JWT_REFRESH_SECRET=otro_secreto_aun_mas_secreto_para_refresh_tokens
```

### 3. Instalación de Dependencias

```bash
npm install
```

### 4. Ejecución

- **Modo de desarrollo** (con reinicio automático):
  ```bash
  npm run dev
  ```

- **Modo de producción**:
  ```bash
  npm start
  ```

## Despliegue en Vercel

1.  **Conecta tu repositorio a Vercel**.
2.  **Configura las variables de entorno** en el dashboard de tu proyecto en Vercel (en `Settings` -> `Environment Variables`). Asegúrate de que coincidan con tu archivo `.env`.
3.  **Despliega**. Vercel instalará las dependencias y ejecutará la aplicación en un entorno serverless.

