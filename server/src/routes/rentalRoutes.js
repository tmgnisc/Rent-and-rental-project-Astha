const { Router } = require('express');
const {
  createRental,
  confirmRental,
  getUserRentals,
  getVendorAnalytics,
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

router.use(protect);

router.post('/', authorizeRoles('user'), createRental);
router.post('/:id/confirm', authorizeRoles('user'), confirmRental);
router.get('/me', authorizeRoles('user'), getUserRentals);

router.get('/vendor/analytics', authorizeRoles('vendor'), getVendorAnalytics);

module.exports = router;

