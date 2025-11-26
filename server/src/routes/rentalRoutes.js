const { Router } = require('express');
const {
  createRental,
  confirmRental,
  requestRentalReturn,
  getUserRentals,
  getVendorAnalytics,
  markRentalHandedOver,
  markRentalReturned,
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

const router = Router();

router.use(protect);

router.post('/', authorizeRoles('user'), createRental);
router.post('/:id/confirm', authorizeRoles('user'), confirmRental);
router.post('/:id/return-request', authorizeRoles('user'), upload.single('photo'), requestRentalReturn);
router.get('/me', authorizeRoles('user'), getUserRentals);

router.get('/vendor/analytics', authorizeRoles('vendor'), getVendorAnalytics);
router.patch('/:id/handover', authorizeRoles('vendor'), markRentalHandedOver);
router.patch('/:id/return', authorizeRoles('vendor'), markRentalReturned);

module.exports = router;

