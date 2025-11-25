const { Router } = require('express');
const { registerVendor, getPendingVendors, verifyVendor, uploadMiddleware } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

router.post('/register', uploadMiddleware, registerVendor);
router.get('/pending', protect, authorizeRoles('superadmin'), getPendingVendors);
router.patch('/:id/verify', protect, authorizeRoles('superadmin'), verifyVendor);

module.exports = router;
