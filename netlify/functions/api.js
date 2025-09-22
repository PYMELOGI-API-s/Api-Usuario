// netlify/functions/api.js
const serverless = require('serverless-http');
const app = require('../../src/app'); // Importamos la app de Express

// Exportamos el handler para Netlify
module.exports.handler = serverless(app);
