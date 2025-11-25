const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const upload = require('../middleware/upload');
const { vendorRegisterSchema } = require('../validators/vendorValidator');
const { formatValidationError } = require('../validators/authValidator');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');
const { mapUserRecord } = require('../utils/mappers');

const registerVendor = async (req, res, next) => {
  const { error, value } = vendorRegisterSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  if (!req.file) {
    return next(new ApiError(400, 'Document image is required'));
  }

  const connection = await pool.getConnection();
  try {
    const normalizedEmail = value.email.toLowerCase();
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      throw new ApiError(409, 'Email is already registered');
    }

    let documentUrl;
    try {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'rent-return/vendor-documents');
      documentUrl = uploadResult.secure_url;
    } catch (uploadError) {
      throw new ApiError(500, 'Failed to upload document. Please try again.');
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified, vendor_document_url, verification_status)
       VALUES (?, ?, ?, 'vendor', 0, ?, 'pending')`,
      [value.name.trim(), normalizedEmail, passwordHash, documentUrl]
    );

    const [rows] = await connection.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    const vendor = mapUserRecord(rows[0]);

    res.status(201).json({
      success: true,
      message: 'Vendor application submitted successfully. Awaiting approval.',
      vendor,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

const getPendingVendors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status, created_at
       FROM users
       WHERE role = 'vendor' AND verification_status = 'pending'
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      vendors: rows.map(mapUserRecord),
    });
  } catch (err) {
    next(err);
  }
};

const verifyVendor = async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['approved', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return next(new ApiError(400, 'Status must be either approved or rejected'));
  }

  try {
    const [result] = await pool.query(
      `UPDATE users
       SET verification_status = ?,
           is_verified = ?,
           document_verified_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND role = 'vendor'`,
      [status, status === 'approved' ? 1 : 0, status === 'approved' ? req.user.id : null, req.params.id]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Vendor not found');
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: `Vendor ${status} successfully`,
      vendor: mapUserRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerVendor,
  getPendingVendors,
  verifyVendor,
  uploadMiddleware: upload.single('document'),
};
