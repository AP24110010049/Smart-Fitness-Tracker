const express = require('express');
const router = express.Router();
const { logWorkout, getWorkouts, getWorkoutById, deleteWorkout, getStats } = require('../controllers/workoutController');
const auth = require('../middleware/auth');

router.post('/', auth, logWorkout);
router.get('/', auth, getWorkouts);
router.get('/stats', auth, getStats);
router.get('/:id', auth, getWorkoutById);
router.delete('/:id', auth, deleteWorkout);

module.exports = router;
