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
           kyc_status = 'approved',
           is_verified = 1,
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
      message: 'KYC document uploaded successfully',
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

module.exports = {
  uploadKycDocument,
  getKycStatus,
};
