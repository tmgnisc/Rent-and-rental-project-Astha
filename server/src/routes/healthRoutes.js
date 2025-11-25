const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Rent&Return API is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
