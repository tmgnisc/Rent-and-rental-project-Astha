const { Router } = require('express');
const { getPlatformAnalytics } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

router.use(protect);
router.use(authorizeRoles('superadmin'));

router.get('/', getPlatformAnalytics);

module.exports = router;

