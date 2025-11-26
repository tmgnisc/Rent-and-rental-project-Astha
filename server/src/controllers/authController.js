const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  formatValidationError,
} = require('../validators/authValidator');
const { forgotPasswordSchema, resetPasswordSchema } = require('../validators/passwordValidator');
const { generateToken } = require('../utils/token');
const { mapUserRecord } = require('../utils/mappers');
const { sendEmail } = require('../services/emailService');

const RESET_TOKEN_EXPIRY_MINUTES = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 60);
const FRONTEND_BASE_URL = ((process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0] || '').replace(/\/$/, '');

const register = async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const connection = await pool.getConnection();
  let transactionStarted = false;
  try {
    const normalizedEmail = value.email.toLowerCase();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      throw new ApiError(409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified, verification_status, kyc_status)
       VALUES (?, ?, ?, 'user', 0, 'approved', 'unverified')`,
      [value.name.trim(), normalizedEmail, passwordHash]
    );

    const [rows] = await connection.query(
      `SELECT id, name, email, role, is_verified, vendor_document_url, verification_status, document_verified_by,
              kyc_document_url, kyc_status, kyc_verified_by, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    const user = mapUserRecord(rows[0]);
    const token = generateToken({ sub: user.id, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      token,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

const login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  try {
    const normalizedEmail = value.email.toLowerCase();
    const [rows] = await pool.query(
      `SELECT id, name, email, role, password_hash, is_verified, vendor_document_url, verification_status, document_verified_by,
              kyc_document_url, kyc_status, kyc_verified_by, created_at, updated_at
       FROM users WHERE email = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const userRecord = rows[0];
    const isMatch = await bcrypt.compare(value.password, userRecord.password_hash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (
      userRecord.role === 'vendor' &&
      userRecord.verification_status &&
      userRecord.verification_status !== 'approved'
    ) {
      throw new ApiError(403, `Vendor verification ${userRecord.verification_status}. Please wait for approval.`);
    }

    const user = mapUserRecord(userRecord);
    const token = generateToken({ sub: user.id, role: user.role });

    res.json({
      success: true,
      message: 'Logged in successfully',
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

const forgotPassword = async (req, res, next) => {
  const { error, value } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const normalizedEmail = value.email.toLowerCase();

  try {
    const [users] = await pool.query('SELECT id, name FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists for that email, a reset link has been sent.',
      });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${FRONTEND_BASE_URL}/reset-password?token=${token}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

    await sendEmail({
      to: normalizedEmail,
      subject: 'Reset your Rent&Return password',
      html: `
        <p>Hello ${user.name || ''},</p>
        <p>We received a request to reset your Rent&Return password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" target="_blank" rel="noopener">Reset Password</a></p>
        <p>This link will expire in ${RESET_TOKEN_EXPIRY_MINUTES} minutes. If you did not request this, you can ignore this email.</p>
        <p>— Rent&Return Team</p>
      `,
      text: `Hello ${user.name || ''},

We received a request to reset your Rent&Return password. Use the link below to set a new password:
${resetUrl}

This link will expire in ${RESET_TOKEN_EXPIRY_MINUTES} minutes. If you did not request this, you can ignore this email.

— Rent&Return Team`,
    });

    res.json({
      success: true,
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  const { error, value } = resetPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const normalizedEmail = value.email.toLowerCase();
  const tokenHash = crypto.createHash('sha256').update(value.token).digest('hex');

  const connection = await pool.getConnection();
  try {
    const [tokenRows] = await connection.query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used_at
       FROM password_reset_tokens pr
       INNER JOIN users u ON pr.user_id = u.id
       WHERE u.email = ? AND pr.token_hash = ?
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [normalizedEmail, tokenHash]
    );

    if (tokenRows.length === 0) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    const resetRecord = tokenRows[0];
    if (resetRecord.used_at) {
      throw new ApiError(400, 'This reset link has already been used');
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      throw new ApiError(400, 'This reset link has expired');
    }

    const passwordHash = await bcrypt.hash(value.password, 10);

    await connection.beginTransaction();
    transactionStarted = true;

    await connection.query(
      `UPDATE users
       SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [passwordHash, resetRecord.user_id]
    );

    await connection.query(
      `UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [resetRecord.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Password updated successfully. You can now login with the new password.',
    });
  } catch (err) {
    if (transactionStarted) {
      await connection.rollback();
    }
    next(err);
  } finally {
    connection.release();
  }
};

const changePassword = async (req, res, next) => {
  const { error, value } = changePasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  try {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [req.user.id]);

    if (rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }

    const currentMatch = await bcrypt.compare(value.currentPassword, rows[0].password_hash);
    if (!currentMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    if (value.currentPassword === value.newPassword) {
      throw new ApiError(400, 'New password must be different from the current password');
    }

    const newHash = await bcrypt.hash(value.newPassword, 10);
    await pool.query(
      `UPDATE users
       SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
};
