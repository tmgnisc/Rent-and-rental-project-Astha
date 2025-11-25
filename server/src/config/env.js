const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  No .env file found for backend configuration.');
}

const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'PORT', 'JWT_SECRET'];
requiredVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  },
  cors: {
    origin: process.env.FRONTEND_URL?.split(',').map((url) => url.trim()) || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
};
