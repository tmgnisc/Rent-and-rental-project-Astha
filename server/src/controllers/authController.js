const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { registerSchema, loginSchema, formatValidationError } = require('../validators/authValidator');
const { generateToken } = require('../utils/token');
const { mapUserRecord } = require('../utils/mappers');

const register = async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const connection = await pool.getConnection();
  try {
    const normalizedEmail = value.email.toLowerCase();

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      throw new ApiError(409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(value.password, 10);
    await connection.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, 'user', 0)` ,
      [value.name.trim(), normalizedEmail, passwordHash]
    );

    const [rows] = await connection.query(
      `SELECT id, name, email, role, is_verified, created_at, updated_at
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
      `SELECT id, name, email, role, password_hash, is_verified, created_at, updated_at
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

module.exports = {
  register,
  login,
  getProfile,
};
