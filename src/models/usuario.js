// src/models/usuario.js
const { poolPromise, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  constructor(usuario) {
    this.id = usuario.id;
    this.contrasena = usuario.contrasena;
    this.correo = usuario.correo;
    this.nombre = usuario.nombre;
    this.email = usuario.email || usuario.correo; // Compatibilidad
    this.password = usuario.password || usuario.contrasena; // Compatibilidad
    this.username = usuario.username;
    this.fecha_creacion = usuario.fecha_creacion;
  }

  static async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM usuario WHERE id = @id');
    return result.recordset[0] ? new Usuario(result.recordset[0]) : null;
  }

  static async findByEmail(email) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM usuario WHERE (email = @email OR correo = @email)');
    return result.recordset[0] ? new Usuario(result.recordset[0]) : null;
  }

  static async findByUsername(username) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM usuario WHERE username = @username');
    return result.recordset[0] ? new Usuario(result.recordset[0]) : null;
  }

  static async create(nuevoUsuario) {
    const { nombre, correo, contrasena, username } = nuevoUsuario;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('correo', sql.NVarChar, correo)
      .input('email', sql.NVarChar, correo)
      .input('contrasena', sql.NVarChar, hashedPassword)
      .input('password', sql.NVarChar, hashedPassword)
      .input('username', sql.NVarChar, username)
      .query(`
        INSERT INTO usuario (nombre, correo, email, contrasena, password, username) 
        OUTPUT INSERTED.* 
        VALUES (@nombre, @correo, @email, @contrasena, @password, @username)
      `);
    return new Usuario(result.recordset[0]);
  }

  static async update(id, updates) {
    const pool = await poolPromise;
    const campos = [];
    const request = pool.request().input('id', sql.Int, id);

    if (updates.nombre) {
      campos.push('nombre = @nombre');
      request.input('nombre', sql.NVarChar, updates.nombre);
    }
    if (updates.correo) {
      campos.push('correo = @correo, email = @correo');
      request.input('correo', sql.NVarChar, updates.correo);
    }
    if (updates.username) {
      campos.push('username = @username');
      request.input('username', sql.NVarChar, updates.username);
    }
    if (updates.contrasena) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updates.contrasena, salt);
      campos.push('contrasena = @contrasena, password = @contrasena');
      request.input('contrasena', sql.NVarChar, hashedPassword);
    }

    if (campos.length > 0) {
      await request.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id = @id`);
    }
  }

  static async delete(id) {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM usuario WHERE id = @id');
  }

  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM usuario ORDER BY fecha_creacion DESC');
    return result.recordset.map(u => new Usuario(u));
  }

  async comparePassword(password) {
    return await bcrypt.compare(password, this.contrasena);
  }

  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      correo: this.correo,
      email: this.email,
      username: this.username,
      fecha_creacion: this.fecha_creacion
    };
  }
}

module.exports = Usuario;