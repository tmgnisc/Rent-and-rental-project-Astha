const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');
const { mapUserRecord } = require('../utils/mappers');

const uploadKycDocument = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'KYC document image is required'));
  }

  const connection = await pool.getConnection();
  try {
    let documentUrl = '';
    try {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        'rent-return/kyc-documents'
      );
      documentUrl = uploadResult.secure_url;
    } catch (error) {
      throw new ApiError(500, 'Failed to upload KYC document');
    }

    await connection.query(
      `UPDATE users
       SET kyc_document_url = ?,
           kyc_status = 'pending',
           is_verified = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [documentUrl, req.user.id]
    );

    const [rows] = await connection.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status,
              document_verified_by, kyc_document_url, kyc_status, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    const user = mapUserRecord(rows[0]);

    res.json({
      success: true,
      message: 'KYC document uploaded successfully. Awaiting approval.',
      kyc: {
        status: user.kycStatus,
        documentUrl: user.kycDocumentUrl,
      },
      user,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

const getKycStatus = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT kyc_status, kyc_document_url FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      kyc: {
        status: rows[0].kyc_status || 'unverified',
        documentUrl: rows[0].kyc_document_url || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPendingKycUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status,
              document_verified_by, kyc_document_url, kyc_status, created_at, updated_at
       FROM users
       WHERE kyc_status = 'pending'
       ORDER BY updated_at DESC`
    );

    res.json({
      success: true,
      users: rows.map(mapUserRecord),
    });
  } catch (err) {
    next(err);
  }
};

const reviewKycStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['approved', 'rejected'];

  if (!allowedStatuses.includes(status)) {
    return next(new ApiError(400, 'Status must be either approved or rejected'));
  }

  try {
    const [existing] = await pool.query(
      `SELECT id FROM users WHERE id = ? AND kyc_status != 'unverified' LIMIT 1`,
      [id]
    );

    if (existing.length === 0) {
      throw new ApiError(404, 'User not found or KYC not submitted');
    }

    await pool.query(
      `UPDATE users
       SET kyc_status = ?,
           is_verified = ?,
           kyc_verified_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, status === 'approved' ? 1 : 0, status === 'approved' ? req.user.id : null, id]
    );

    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status,
              document_verified_by, kyc_document_url, kyc_status, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    res.json({
      success: true,
      message: `KYC ${status} successfully`,
      user: mapUserRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status,
              document_verified_by, kyc_document_url, kyc_status, kyc_verified_by, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: rows.map(mapUserRecord),
    });
  } catch (err) {
    next(err);
  }
};

const getAllVendors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status,
              document_verified_by, kyc_document_url, kyc_status, kyc_verified_by, created_at, updated_at
       FROM users
       WHERE role = 'vendor'
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

const updateProfileImage = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Profile image is required'));
  }

  const connection = await pool.getConnection();
  try {
    let imageUrl = '';
    try {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        'rent-return/profile-images'
      );
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      throw new ApiError(500, 'Failed to upload profile image');
    }

    await connection.query(
      `UPDATE users
       SET profile_image = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [imageUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: imageUrl,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

module.exports = {
  uploadKycDocument,
  getKycStatus,
  getPendingKycUsers,
  reviewKycStatus,
  getAllUsers,
  getAllVendors,
  updateProfileImage,
};
