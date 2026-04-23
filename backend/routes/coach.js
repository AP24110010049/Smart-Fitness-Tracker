const express = require('express');
const router = express.Router();
const { getClients, getClientDetails, assignPlan, getClientPlans, getCoachStats } = require('../controllers/coachController');
const auth = require('../middleware/auth');
const coachOnly = require('../middleware/coach');

router.get('/clients', auth, coachOnly, getClients);
router.get('/clients/:clientId', auth, coachOnly, getClientDetails);
router.post('/clients/:clientId/plans', auth, coachOnly, assignPlan);
router.get('/clients/:clientId/plans', auth, coachOnly, getClientPlans);
router.get('/stats', auth, coachOnly, getCoachStats);

module.exports = router;
