// src/models/usuario.js
const { pool, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

// Helper to add instance-like methods to the plain user object from DB
const enrichUserObject = (user) => {
  if (!user) return null;

  return {
    ...user,
    // Method to compare password for login
    comparePassword: async function(candidatePassword) {
      // 'this.contrasena' refers to the property on the enriched user object
      return bcrypt.compare(candidatePassword, this.contrasena);
    },
    // Method to return a public version of the user, without the password
    toPublicJSON: function() {
      const { contrasena, ...publicData } = this;
      return publicData;
    }
  };
};

const Usuario = {
  // Crear un nuevo usuario
  create: async ({ nombre, correo, contrasena, username }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const queryString = `
      INSERT INTO Usuarios (nombre, correo, contrasena, username)
      OUTPUT inserted.id, inserted.nombre, inserted.correo, inserted.username, inserted.fecha_creacion
      VALUES (@nombre, @correo, @hashedPassword, @username);
    `;

    const request = pool.request();
    request.input('nombre', sql.NVarChar, nombre);
    request.input('correo', sql.NVarChar, correo);
    request.input('hashedPassword', sql.NVarChar, hashedPassword);
    request.input('username', sql.NVarChar, username);

    const result = await request.query(queryString);
    // The created user (without password hash) is in recordset[0]
    return enrichUserObject(result.recordset[0]);
  },

  // Encontrar un usuario por su correo electrónico (devuelve el objeto completo para verificación de contraseña)
  findByEmail: async (correo) => {
    const queryString = 'SELECT * FROM Usuarios WHERE correo = @correo';
    const request = pool.request();
    request.input('correo', sql.NVarChar, correo);

    const result = await request.query(queryString);
    return enrichUserObject(result.recordset[0]);
  },

  // Encontrar un usuario por su nombre de usuario (devuelve el objeto completo)
  findByUsername: async (username) => {
    const queryString = 'SELECT * FROM usuario WHERE username = @username';
    const request = pool.request();
    request.input('username', sql.NVarChar, username);

    const result = await request.query(queryString);
    return enrichUserObject(result.recordset[0]);
  },

  // Encontrar un usuario por su ID (devuelve solo datos públicos)
  findById: async (id) => {
    // Select only public fields
    const queryString = 'SELECT id, nombre, correo, username, fecha_creacion FROM Usuarios WHERE id = @id';
    const request = pool.request();
    request.input('id', sql.Int, id);

    const result = await request.query(queryString);
    return result.recordset.length > 0 ? result.recordset[0] : null;
  },

  // Obtener todos los usuarios (solo datos públicos) - ✅ Corregido el nombre del método
  getAll: async () => {
    const queryString = 'SELECT id, nombre, correo, username, fecha_creacion FROM Usuarios';
    const result = await pool.request().query(queryString);
    return result.recordset.map(user => enrichUserObject(user));
  },

  // Actualizar un usuario
  update: async (id, updates) => {
    const { nombre, correo, username } = updates;
    
    const queryString = `
      UPDATE Usuarios
      SET nombre = @nombre, correo = @correo, username = @username
      WHERE id = @id;
    `;
    const request = pool.request();
    request.input('id', sql.Int, id);
    request.input('nombre', sql.NVarChar, nombre);
    request.input('correo', sql.NVarChar, correo);
    request.input('username', sql.NVarChar, username);

    await request.query(queryString);
    
    // Retornar el usuario actualizado
    return await Usuario.findById(id);
  },

  // Eliminar un usuario
  delete: async (id) => {
    const queryString = 'DELETE FROM usuario WHERE id = @id';
    const request = pool.request();
    request.input('id', sql.Int, id);
    const result = await request.query(queryString);
    // rowsAffected will be [1] if a row was deleted, [0] otherwise
    return result.rowsAffected[0] > 0;
  }
};

module.exports = Usuario;