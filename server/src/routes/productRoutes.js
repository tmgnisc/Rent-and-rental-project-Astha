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
const upload = require('../middleware/upload');

const router = Router();

// All routes require authentication and vendor role
router.use(protect);
router.use(authorizeRoles('vendor'));

router.post('/', upload.single('image'), createProduct);
router.get('/', getVendorProducts);
router.get('/:id', getProductById);
router.put('/:id', upload.single('image'), updateProduct);
router.patch('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

