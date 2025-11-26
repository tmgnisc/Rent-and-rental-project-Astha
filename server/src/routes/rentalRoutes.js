const { Router } = require('express');
const { createRental, confirmRental, getUserRentals } = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

router.use(protect);
router.use(authorizeRoles('user'));

router.post('/', createRental);
router.post('/:id/confirm', confirmRental);
router.get('/me', getUserRentals);

module.exports = router;

