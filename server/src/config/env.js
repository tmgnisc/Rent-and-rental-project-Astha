const path = require('path');
const dotenv = require('dotenv');

// Load .env from the correct path
const envPath = path.join(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  No .env file found for backend configuration.');
  console.warn('Looking for .env at:', envPath);
}

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'PORT',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

// Check which variables are missing
const missingVars = requiredVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((key) => {
    console.error(`   - ${key}`);
  });
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

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
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    assetFolder: process.env.CLOUDINARY_ASSET_FOLDER,
  },
};