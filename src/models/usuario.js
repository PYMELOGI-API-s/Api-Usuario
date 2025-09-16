// src/models/usuario.js
const { poolPromise, sql } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  constructor(usuario) {
    this.UsuarioID = usuario.UsuarioID;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.email = usuario.email;
    this.password_hash = usuario.password_hash;
    this.rol = usuario.rol;
    this.estado = usuario.estado;
  }

  static async findById(id) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Usuarios WHERE UsuarioID = @id');
    return result.recordset[0] ? new Usuario(result.recordset[0]) : null;
  }

  static async findByEmail(email) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Usuarios WHERE email = @email');
    return result.recordset[0] ? new Usuario(result.recordset[0]) : null;
  }

  static async create(nuevoUsuario) {
    const { nombre, apellido, email, password } = nuevoUsuario;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('apellido', sql.NVarChar, apellido)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Usuarios (nombre, apellido, email, password_hash) OUTPUT INSERTED.* VALUES (@nombre, @apellido, @email, @password)');
    return new Usuario(result.recordset[0]);
  }

  static async update(id, updates) {
    const pool = await poolPromise;
    const { nombre, apellido } = updates;
    await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('apellido', sql.NVarChar, apellido)
        .query('UPDATE Usuarios SET nombre = @nombre, apellido = @apellido WHERE UsuarioID = @id');
  }

  static async delete(id) {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Usuarios SET estado = \'eliminado\' WHERE UsuarioID = @id');
  }

  static async getAll() {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Usuarios WHERE estado <> \'eliminado\'');
    return result.recordset.map(u => new Usuario(u));
  }

  async comparePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }
}

module.exports = Usuario;
