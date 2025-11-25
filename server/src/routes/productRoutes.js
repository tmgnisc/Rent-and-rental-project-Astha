const { Router } = require('express');
const {
  createProduct,
  getVendorProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = Router();

// All routes require authentication and vendor role
router.use(protect);
router.use(authorizeRoles('vendor'));

router.post('/', createProduct);
router.get('/', getVendorProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

