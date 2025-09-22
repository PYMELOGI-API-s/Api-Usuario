// index.js - Para desarrollo local
const app = require('./src/app');

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`🚀 Servidor de desarrollo ejecutándose en http://localhost:${port}`);
});
