# Api-Usuario

npm install express
npm install body-parser
npm install mongoose

-- Script para crear la base de datos y tabla de usuarios
#-- Base de datos: api_usuarios

#CREATE DATABASE api_usuarios;
GO

USE api_usuarios;
GO

-- Tabla de usuarios sin id_rol
CREATE TABLE Usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    contrasena NVARCHAR(255) NOT NULL,
    correo NVARCHAR(100) NOT NULL UNIQUE,
    nombre NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE, -- Duplicado del correo para compatibilidad
    password NVARCHAR(255) NOT NULL,     -- Duplicado de contrasena para compatibilidad
    username NVARCHAR(50) NOT NULL UNIQUE,
    estado NVARCHAR(20) DEFAULT 'activo',
    fecha_creacion DATETIME DEFAULT GETDATE()
);

-- Índices para optimizar consultas
CREATE INDEX IX_Usuarios_Email ON Usuarios(email);
CREATE INDEX IX_Usuarios_Username ON Usuarios(username);
CREATE INDEX IX_Usuarios_Estado ON Usuarios(estado);

-- Datos de ejemplo
INSERT INTO Usuarios (contrasena, correo, nombre, email, password, username) VALUES
('$2a$10$example1', 'admin@example.com', 'Administrador', 'admin@example.com', '$2a$10$example1', 'admin'),
('$2a$10$example2', 'user@example.com', 'Usuario Test', 'user@example.com', '$2a$10$example2', 'user');

GO
