const { verifyToken } = require('../utils/token');
const { ApiError } = require('./errorHandler');
const { pool } = require('../config/db');
const { mapUserRecord } = require('../utils/mappers');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authorization token missing'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status, document_verified_by,
              kyc_document_url, kyc_status, kyc_verified_by, profile_image, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [decoded.sub]
    );

    if (rows.length === 0) {
      return next(new ApiError(401, 'User not found'));
    }

    req.user = mapUserRecord(rows[0]);
    req.tokenPayload = decoded;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = {
  protect,
};
