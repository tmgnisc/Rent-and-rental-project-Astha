const { Router } = require('express');
const {
  uploadKycDocument,
  getKycStatus,
  getPendingKycUsers,
  reviewKycStatus,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

const router = Router();

router.use(protect);

router.get('/kyc', getKycStatus);
router.post('/kyc', upload.single('document'), uploadKycDocument);

router.get('/kyc/pending', authorizeRoles('superadmin'), getPendingKycUsers);
router.patch('/kyc/:id', authorizeRoles('superadmin'), reviewKycStatus);

module.exports = router;
