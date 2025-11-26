const { Router } = require('express');
const { uploadKycDocument, getKycStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = Router();

router.use(protect);

router.get('/kyc', getKycStatus);
router.post('/kyc', upload.single('document'), uploadKycDocument);

module.exports = router;
