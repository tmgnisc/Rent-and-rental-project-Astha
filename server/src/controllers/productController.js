const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { productSchema, formatValidationError } = require('../validators/productValidator');
const { mapProductRecord } = require('../utils/productMappers');

const createProduct = async (req, res, next) => {
  const { error, value } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const connection = await pool.getConnection();
  try {
    const vendorId = req.user.id;
    const vendorName = req.user.name;

    const [result] = await connection.query(
      `INSERT INTO products (
        name, description, category, image_url, rental_price_per_day,
        refundable_deposit, status, vendor_id, vendor_name, vendor_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        value.name.trim(),
        value.description?.trim() || '',
        value.category,
        value.image_url || '',
        value.rental_price_per_day,
        value.refundable_deposit,
        value.status || 'available',
        vendorId,
        vendorName,
      ]
    );

    // MySQL2 returns [result, fields] where result has insertId
    const insertId = Array.isArray(result) ? result[0]?.insertId : result.insertId;
    const [rows] = await connection.query(
      `SELECT * FROM products WHERE id = ? LIMIT 1`,
      [insertId]
    );

    const product = mapProductRecord(rows[0]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

const getVendorProducts = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE vendor_id = ? ORDER BY created_at DESC`,
      [vendorId]
    );

    res.json({
      success: true,
      products: rows.map(mapProductRecord),
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const [rows] = await pool.query(
      `SELECT * FROM products WHERE id = ? AND vendor_id = ? LIMIT 1`,
      [id, vendorId]
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      product: mapProductRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  const { error, value } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Check if product exists and belongs to vendor
    const [existing] = await pool.query(
      `SELECT id FROM products WHERE id = ? AND vendor_id = ? LIMIT 1`,
      [id, vendorId]
    );

    if (existing.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    await pool.query(
      `UPDATE products SET
        name = ?, description = ?, category = ?, image_url = ?,
        rental_price_per_day = ?, refundable_deposit = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND vendor_id = ?`,
      [
        value.name.trim(),
        value.description?.trim() || '',
        value.category,
        value.image_url || '',
        value.rental_price_per_day,
        value.refundable_deposit,
        value.status || 'available',
        id,
        vendorId,
      ]
    );

    const [rows] = await pool.query(
      `SELECT * FROM products WHERE id = ? LIMIT 1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: mapProductRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    // Check if product exists and belongs to vendor
    const [existing] = await pool.query(
      `SELECT id FROM products WHERE id = ? AND vendor_id = ? LIMIT 1`,
      [id, vendorId]
    );

    if (existing.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    await pool.query(`DELETE FROM products WHERE id = ? AND vendor_id = ?`, [id, vendorId]);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getVendorProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

