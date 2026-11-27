require('dotenv').config();
const app = require('./app');
const { connectDatabase, initializeSchema } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const db = await connectDatabase();
    await initializeSchema(db);
    console.log('Database connected and schema initialized.');

    app.listen(PORT, () => {
      console.log(`Campus Events Manager server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
