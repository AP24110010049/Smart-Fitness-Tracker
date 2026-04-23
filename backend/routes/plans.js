const express = require('express');
const router = express.Router();
const { generatePlan, getPlans, createPlan, deletePlan } = require('../controllers/planController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generatePlan);
router.get('/', auth, getPlans);
router.post('/', auth, createPlan);
router.delete('/:id', auth, deletePlan);

module.exports = router;
