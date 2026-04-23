const express = require('express');
const router = express.Router();
const { syncDevice, getDeviceStatus } = require('../controllers/deviceController');
const auth = require('../middleware/auth');

router.post('/sync', auth, syncDevice);
router.get('/status', auth, getDeviceStatus);

module.exports = router;
