const { Router } = require('express');
const { getAllProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

router.use(protect);
router.use(authorizeRoles('superadmin'));

router.get('/', getAllProducts);

module.exports = router;
