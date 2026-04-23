const express = require('express');
const router = express.Router();
const { createChallenge, getChallenges, joinChallenge, updateProgress } = require('../controllers/challengeController');
const auth = require('../middleware/auth');

router.post('/', auth, createChallenge);
router.get('/', auth, getChallenges);
router.post('/:id/join', auth, joinChallenge);
router.post('/:id/progress', auth, updateProgress);

module.exports = router;
