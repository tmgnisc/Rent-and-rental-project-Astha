const { pool } = require('../config/db');
const { mapReturnRecords, buildReturnsQuery } = require('../utils/returnQueries');

const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [[userStats]] = await pool.query(
      `SELECT 
         COUNT(*) AS totalUsers,
         SUM(role = 'vendor') AS totalVendors
       FROM users`
    );

    const [[productStats]] = await pool.query(
      `SELECT COUNT(*) AS totalProducts FROM products`
    );

    const [[rentalStats]] = await pool.query(
      `SELECT 
         COUNT(*) AS totalRentals,
         SUM(status = 'active') AS activeRentals,
         SUM(status = 'pending') AS pendingRentals,
         SUM(status = 'completed') AS completedRentals,
         SUM(CASE WHEN status IN ('active','completed') THEN total_amount ELSE 0 END) AS totalRevenue
       FROM rentals`
    );

    const [[returnStats]] = await pool.query(
      `SELECT 
         SUM(return_request_status = 'pending') AS pendingReturns,
         SUM(return_request_status = 'rejected') AS disputes
       FROM rentals`
    );

    const [recentDisputes] = await pool.query(
      `${buildReturnsQuery}
       WHERE r.return_request_status = 'rejected'
       ORDER BY r.return_requested_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalUsers: Number(userStats.totalUsers) || 0,
        totalVendors: Number(userStats.totalVendors) || 0,
        totalProducts: Number(productStats.totalProducts) || 0,
        totalRentals: Number(rentalStats.totalRentals) || 0,
        activeRentals: Number(rentalStats.activeRentals) || 0,
        pendingRentals: Number(rentalStats.pendingRentals) || 0,
        completedRentals: Number(rentalStats.completedRentals) || 0,
        totalRevenue: Number(rentalStats.totalRevenue) || 0,
        pendingReturns: Number(returnStats.pendingReturns) || 0,
        disputes: Number(returnStats.disputes) || 0,
      },
      recentDisputes: mapReturnRecords(recentDisputes),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlatformAnalytics,
};

