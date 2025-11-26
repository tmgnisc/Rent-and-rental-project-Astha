const { randomUUID } = require('crypto');
const { pool } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const { rentalSchema, formatValidationError } = require('../validators/rentalValidator');
const { mapProductRecord } = require('../utils/productMappers');
const { mapRentalRecord, calculateRentalFinancials } = require('../utils/rentalMappers');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');
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

    const rentalId = randomUUID();

    const dailyFine = 100;

    await connection.query(
      `INSERT INTO rentals (
        id,
        user_id,
        product_id,
        start_date,
        end_date,
        status,
        total_amount,
        payment_intent_id,
        delivery_address,
        contact_phone,
        daily_fine
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)`,
      [
        rentalId,
        req.user.id,
        payload.productId,
        startDate,
        endDate,
        totalAmount,
        paymentIntent.id,
        payload.deliveryAddress,
        payload.contactPhone,
        dailyFine,
      ]
    );

    const [rentalRows] = await connection.query(`SELECT * FROM rentals WHERE id = ? LIMIT 1`, [
      rentalId,
    ]);

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
  let transactionStarted = false;
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
    transactionStarted = true;

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
    if (transactionStarted) {
      await connection.rollback();
    }
    next(err);
  } finally {
    connection.release();
  }
};

const requestRentalReturn = async (req, res, next) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM rentals WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      throw new ApiError(404, 'Rental not found');
    }

    const rental = rows[0];

    if (rental.status !== 'active') {
      throw new ApiError(400, 'Only active rentals can request a return');
    }

    if (rental.return_request_status === 'pending') {
      throw new ApiError(400, 'Return request already submitted');
    }

    if (!note || !note.trim()) {
      throw new ApiError(400, 'Return description is required');
    }

    if (!req.file) {
      throw new ApiError(400, 'Product photo is required for return request');
    }

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      'rent-return/return-requests'
    );

    await pool.query(
      `UPDATE rentals 
       SET return_request_note = ?, 
           return_request_image = ?, 
           return_requested_at = CURRENT_TIMESTAMP,
           return_request_status = 'pending',
           return_rejection_reason = NULL,
           return_rejection_note = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [note?.trim() || null, uploadResult.secure_url, rental.id]
    );

    const [updatedRows] = await pool.query(`SELECT * FROM rentals WHERE id = ? LIMIT 1`, [
      rental.id,
    ]);

    res.json({
      success: true,
      rental: mapRentalRecord(updatedRows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const rejectRentalReturn = async (req, res, next) => {
  const { id } = req.params;
  const { reason, note } = req.body;

  if (!reason || !reason.trim()) {
    return next(new ApiError(400, 'Rejection reason is required'));
  }

  try {
    const rental = await fetchRentalForVendor(id, req.user.id);

    if (rental.return_request_status !== 'pending') {
      throw new ApiError(400, 'No pending return request for this rental');
    }

    await pool.query(
      `UPDATE rentals
       SET return_request_status = 'rejected',
           return_rejection_reason = ?,
           return_rejection_note = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [reason.trim(), note?.trim() || null, rental.id]
    );

    const [rows] = await pool.query(`SELECT * FROM rentals WHERE id = ? LIMIT 1`, [rental.id]);

    res.json({
      success: true,
      rental: mapRentalRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const getUserRentals = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        p.name AS product_name,
        p.image_url AS product_image,
        p.category AS product_category,
        p.vendor_name AS product_vendor_name
       FROM rentals r
       INNER JOIN products p ON p.id = r.product_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
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

const getVendorAnalytics = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        r.*,
        p.name AS product_name,
        p.image_url AS product_image,
        p.category AS product_category,
        p.vendor_name AS product_vendor_name,
        u.name AS customer_name,
        u.email AS customer_email
       FROM rentals r
       INNER JOIN products p ON p.id = r.product_id
       INNER JOIN users u ON u.id = r.user_id
       WHERE p.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    const summaryAccumulator = rows.reduce(
      (acc, rental) => {
        acc.totalRentals += 1;
        if (rental.status === 'active') acc.activeRentals += 1;
        if (rental.status === 'pending') acc.pendingRentals += 1;
        if (rental.status === 'completed') acc.completedRentals += 1;
        if (rental.status === 'cancelled') acc.cancelledRentals += 1;
        const financials = calculateRentalFinancials(rental);
        if (financials.isOverdue) acc.overdueRentals += 1;
        if (['active', 'completed'].includes(rental.status)) {
          acc.totalRevenue += Number(rental.total_amount || 0);
        }
        acc.outstandingFines += financials.outstandingFine;
        acc.uniqueCustomers.add(rental.user_id);
        return acc;
      },
      {
        totalRentals: 0,
        activeRentals: 0,
        pendingRentals: 0,
        completedRentals: 0,
        cancelledRentals: 0,
        totalRevenue: 0,
        outstandingFines: 0,
        overdueRentals: 0,
        uniqueCustomers: new Set(),
      }
    );

    const summary = {
      totalRentals: summaryAccumulator.totalRentals,
      activeRentals: summaryAccumulator.activeRentals,
      pendingRentals: summaryAccumulator.pendingRentals,
      completedRentals: summaryAccumulator.completedRentals,
      cancelledRentals: summaryAccumulator.cancelledRentals,
      totalRevenue: Number(summaryAccumulator.totalRevenue.toFixed(2)),
      outstandingFines: Number(summaryAccumulator.outstandingFines.toFixed(2)),
      overdueRentals: summaryAccumulator.overdueRentals,
      uniqueCustomers: summaryAccumulator.uniqueCustomers.size,
    };

    res.json({
      success: true,
      summary,
      rentals: rows.map(mapRentalRecord),
    });
  } catch (err) {
    next(err);
  }
};

const fetchRentalForVendor = async (rentalId, vendorId) => {
  const [rows] = await pool.query(
    `SELECT r.*, p.vendor_id 
     FROM rentals r 
     INNER JOIN products p ON p.id = r.product_id 
     WHERE r.id = ? AND p.vendor_id = ? 
     LIMIT 1`,
    [rentalId, vendorId]
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Rental not found for this vendor');
  }

  return rows[0];
};

const markRentalHandedOver = async (req, res, next) => {
  const { id } = req.params;

  try {
    await fetchRentalForVendor(id, req.user.id);
    await pool.query(
      `UPDATE rentals 
       SET handed_over_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [id]
    );

    const [rows] = await pool.query(`SELECT * FROM rentals WHERE id = ? LIMIT 1`, [id]);

    res.json({
      success: true,
      rental: mapRentalRecord(rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

const markRentalReturned = async (req, res, next) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    const rental = await fetchRentalForVendor(id, req.user.id);
    if (rental.return_request_status !== 'pending') {
      throw new ApiError(400, 'No pending return request for this rental');
    }

    const settlement = calculateRentalFinancials(rental, new Date());

    await connection.beginTransaction();
    transactionStarted = true;

    await connection.query(
      `UPDATE rentals 
       SET returned_at = CURRENT_TIMESTAMP, 
           status = 'completed',
           fine_amount = ?, 
           return_request_status = 'approved',
           return_rejection_reason = NULL,
           return_rejection_note = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [settlement.calculatedFine, id]
    );

    await connection.query(
      `UPDATE products 
       SET status = 'available', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [rental.product_id]
    );

    await connection.commit();

    const [rows] = await pool.query(`SELECT * FROM rentals WHERE id = ? LIMIT 1`, [id]);

    res.json({
      success: true,
      rental: mapRentalRecord(rows[0]),
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

const buildReturnsQuery = `
  SELECT 
    r.*,
    p.name AS product_name,
    p.image_url AS product_image,
    p.category AS product_category,
    p.vendor_name AS product_vendor_name,
    u.name AS customer_name,
    u.email AS customer_email,
    v.name AS vendor_name_internal,
    v.email AS vendor_email
   FROM rentals r
   INNER JOIN products p ON p.id = r.product_id
   INNER JOIN users u ON u.id = r.user_id
   INNER JOIN users v ON v.id = p.vendor_id
`;

const mapReturnRecords = (rows) =>
  rows.map((record) =>
    mapRentalRecord({
      ...record,
      vendor_name: record.vendor_name_internal || record.product_vendor_name,
    })
  );

const getReturnRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${buildReturnsQuery}
       WHERE r.return_request_status IN ('pending','approved','rejected')
       ORDER BY r.return_requested_at DESC`
    );

    res.json({
      success: true,
      returns: mapReturnRecords(rows),
    });
  } catch (err) {
    next(err);
  }
};

const getDisputeReturns = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `${buildReturnsQuery}
       WHERE r.return_request_status = 'rejected'
       ORDER BY r.return_requested_at DESC`
    );

    res.json({
      success: true,
      disputes: mapReturnRecords(rows),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRental,
  confirmRental,
  requestRentalReturn,
  getUserRentals,
  getVendorAnalytics,
  markRentalHandedOver,
  markRentalReturned,
  rejectRentalReturn,
  getReturnRequests,
  getDisputeReturns,
};

