const express = require('express');
const router = express.Router();
const { getMetrics, getMetricsSummary } = require('../controllers/metricsController');
const auth = require('../middleware/auth');

router.get('/', auth, getMetrics);
router.get('/summary', auth, getMetricsSummary);

module.exports = router;
