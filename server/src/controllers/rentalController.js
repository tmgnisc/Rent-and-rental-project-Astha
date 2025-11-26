const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { rentalSchema, formatValidationError } = require('../validators/rentalValidator');
const { mapProductRecord } = require('../utils/productMappers');
const { mapRentalRecord } = require('../utils/rentalMappers');
const { stripeClient } = require('../config/stripe');
const { stripe: stripeConfig } = require('../config/env');

const createRental = async (req, res, next) => {
  let payload;
  try {
    const { error, value } = rentalSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new ApiError(400, 'Validation failed', formatValidationError(error));
    }
    payload = value;
  } catch (err) {
    return next(err);
  }

  if (req.user.kycStatus !== 'approved') {
    return next(new ApiError(400, 'KYC approval is required before renting a product'));
  }

  const connection = await pool.getConnection();
  try {
    const [productRows] = await connection.query(`SELECT * FROM products WHERE id = ? LIMIT 1`, [
      payload.productId,
    ]);

    if (productRows.length === 0) {
      throw new ApiError(404, 'Product not found');
    }

    const product = mapProductRecord(productRows[0]);

    if (product.status !== 'available') {
      throw new ApiError(400, 'This product is currently not available for rent');
    }

    const startDate = new Date(payload.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new ApiError(400, 'Invalid start date');
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + payload.days);
    const dailyCost = Number(product.rentalPricePerDay) * payload.days;
    const totalAmount = dailyCost + Number(product.refundableDeposit || 0);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: stripeConfig.currency || 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        productId: payload.productId,
        userId: req.user.id,
      },
    });

    const [result] = await connection.query(
      `INSERT INTO rentals (
        user_id,
        product_id,
        start_date,
        end_date,
        status,
        total_amount,
        payment_intent_id,
        delivery_address,
        contact_phone
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
      [
        req.user.id,
        payload.productId,
        startDate,
        endDate,
        totalAmount,
        paymentIntent.id,
        payload.deliveryAddress,
        payload.contactPhone,
      ]
    );

    const [rentalRows] = await connection.query(
      `SELECT * FROM rentals WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      rental: mapRentalRecord(rentalRows[0]),
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    next(err);
  } finally {
    connection.release();
  }
};

const confirmRental = async (req, res, next) => {
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    const [rentalRows] = await connection.query(
      `SELECT * FROM rentals WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, req.user.id]
    );

    if (rentalRows.length === 0) {
      throw new ApiError(404, 'Rental not found');
    }

    const rental = rentalRows[0];

    const paymentIntent = await stripeClient.paymentIntents.retrieve(rental.payment_intent_id);

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      throw new ApiError(400, 'Payment not completed for this rental');
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE rentals SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [rental.id]
    );

    await connection.query(`UPDATE products SET status = 'rented' WHERE id = ?`, [rental.product_id]);

    await connection.commit();

    const [updatedRows] = await connection.query(
      `SELECT * FROM rentals WHERE id = ? LIMIT 1`,
      [rental.id]
    );

    res.json({
      success: true,
      rental: mapRentalRecord(updatedRows[0]),
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const getUserRentals = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM rentals WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      rentals: rows.map(mapRentalRecord),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRental,
  confirmRental,
  getUserRentals,
};

