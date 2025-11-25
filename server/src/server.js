const app = require('./app');
const { port, env } = require('./config/env');
const { initDatabase } = require('./config/db');

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on http://localhost:${port} in ${env} mode`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
