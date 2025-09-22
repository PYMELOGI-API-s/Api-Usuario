console.log('Iniciando netlify/functions/api.js...'); // Log de diagnóstico

const serverless = require('serverless-http');
const app = require('../../src/app'); // Importamos la app de Express

console.log('Aplicación Express importada. Creando handler...'); // Log de diagnóstico

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  console.log('--- INICIO DE LA INVOCACIÓN DE LA FUNCIÓN ---'); // Log de diagnóstico
  console.log('Evento recibido:', JSON.stringify(event, null, 2)); // Log de diagnóstico
  
  try {
    const result = await handler(event, context);
    console.log('Respuesta generada por Express:', JSON.stringify(result, null, 2)); // Log de diagnóstico
    console.log('--- FIN DE LA INVOCACIÓN DE LA FUNCIÓN ---'); // Log de diagnóstico
    return result;
  } catch (error) {
    console.error('!!! ERROR DURANTE LA INVOCACIÓN DEL HANDLER !!!', error); // Log de diagnóstico
    console.log('--- FIN DE LA INVOCACIÓN DE LA FUNCIÓN (CON ERROR) ---'); // Log de diagnóstico
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error crítico en el handler de la función.' })
    };
  }
};
