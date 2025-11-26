const { Router } = require('express');
const { getPublicProducts, getPublicProductById } = require('../controllers/productController');

const router = Router();

router.get('/', getPublicProducts);
router.get('/:id', getPublicProductById);

module.exports = router;
