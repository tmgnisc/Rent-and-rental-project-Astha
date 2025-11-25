const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { productSchema, formatValidationError } = require('../validators/productValidator');
const { mapProductRecord } = require('../utils/productMappers');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');

const toNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return Number.NaN;
  }
  return Number(value);
};

const parseSpecifications = (specifications) => {
  if (!specifications) return null;
  if (typeof specifications === 'object') return specifications;
  if (typeof specifications === 'string') {
    if (!specifications.trim()) {
      return null;
    }
    try {
      return JSON.parse(specifications);
    } catch (error) {
      throw new ApiError(400, 'Invalid specifications format. Please provide valid JSON.');
    }
  }
  return null;
};

const buildProductPayload = (body) => ({
  name: body.name,
  description: body.description ?? '',
  category: body.category,
  image_url: body.image_url ?? '',
  rental_price_per_day: toNumber(body.rental_price_per_day),
  refundable_deposit: toNumber(body.refundable_deposit),
  status: body.status,
  specifications: parseSpecifications(body.specifications),
});

const createProduct = async (req, res, next) => {
  let payload;
  try {
    payload = buildProductPayload(req.body);
  } catch (parseError) {
    return next(parseError);
  }

  const { error, value } = productSchema.validate(payload, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  const connection = await pool.getConnection();
  try {
    const vendorId = req.user.id;
    const vendorName = req.user.name;

     let imageUrl = value.image_url || '';

     if (req.file) {
       try {
         const uploadResult = await uploadBufferToCloudinary(
           req.file.buffer,
           'rent-return/product-images'
         );
         imageUrl = uploadResult.secure_url;
       } catch (uploadError) {
         return next(new ApiError(500, 'Failed to upload product image'));
       }
     }

     if (!imageUrl) {
       return next(new ApiError(400, 'Product image is required'));
     }

    const specificationsJson = value.specifications 
      ? JSON.stringify(value.specifications) 
      : null;

    await connection.query(
      `INSERT INTO products (
        name, description, category, image_url, rental_price_per_day,
        refundable_deposit, status, vendor_id, vendor_name, vendor_rating, specifications
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        value.name.trim(),
        value.description?.trim() || '',
        value.category,
        imageUrl,
        value.rental_price_per_day,
        value.refundable_deposit,
        value.status || 'available',
        vendorId,
        vendorName,
        specificationsJson,
      ]
    );

    const [newProductRows] = await connection.query(
      `SELECT * FROM products 
       WHERE vendor_id = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [vendorId]
    );

    if (newProductRows.length === 0) {
      throw new ApiError(500, 'Failed to retrieve created product');
    }

    const product = mapProductRecord(newProductRows[0]);

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
  let payload;
  try {
    payload = buildProductPayload(req.body);
  } catch (parseError) {
    return next(parseError);
  }

  const { error, value } = productSchema.validate(payload, { abortEarly: false });
  if (error) {
    return next(new ApiError(400, 'Validation failed', formatValidationError(error)));
  }

  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const [existingRows] = await pool.query(
      `SELECT * FROM products WHERE id = ? AND vendor_id = ? LIMIT 1`,
      [id, vendorId]
    );

    if (existingRows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    const existingProduct = existingRows[0];
    let imageUrl = existingProduct.image_url || '';

    if (req.file) {
      try {
        const uploadResult = await uploadBufferToCloudinary(
          req.file.buffer,
          'rent-return/product-images'
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return next(new ApiError(500, 'Failed to upload product image'));
      }
    } else if (value.image_url) {
      imageUrl = value.image_url;
    }

    if (!imageUrl) {
      return next(new ApiError(400, 'Product image is required'));
    }

    const specificationsJson = value.specifications 
      ? JSON.stringify(value.specifications) 
      : null;

    await pool.query(
      `UPDATE products SET
        name = ?, description = ?, category = ?, image_url = ?,
        rental_price_per_day = ?, refundable_deposit = ?, status = ?,
        specifications = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND vendor_id = ?`,
      [
        value.name.trim(),
        value.description?.trim() || '',
        value.category,
        imageUrl,
        value.rental_price_per_day,
        value.refundable_deposit,
        value.status || 'available',
        specificationsJson,
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

