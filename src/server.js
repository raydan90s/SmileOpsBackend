require('module-alias/register');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
