const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const requiredVars = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'PORT',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
];

const candidatePaths = [
  path.join(__dirname, '../../.env'), // server/.env
  path.join(__dirname, '../../../.env'), // project-root/.env
];

let loadedEnvPath = null;

for (const candidate of candidatePaths) {
  if (!fs.existsSync(candidate)) {
    continue;
  }
  dotenv.config({ path: candidate, override: true });
  const missingAfterLoad = requiredVars.filter((key) => !process.env[key]);
  if (missingAfterLoad.length === 0) {
    loadedEnvPath = candidate;
    break;
  }
}

if (loadedEnvPath) {
  // eslint-disable-next-line no-console
  console.info(`[env] Loaded configuration from ${path.relative(process.cwd(), loadedEnvPath)}`);
} else {
  // eslint-disable-next-line no-console
  console.warn('⚠️  .env file missing required values. Ensure either server/.env or project .env is populated.');
}

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
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },
};