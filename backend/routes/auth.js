const express = require('express');
const router = express.Router();
const { signup, login, getMe, googleAuth, coachSignup, coachLogin } = require('../controllers/authController');
const auth = require('../middleware/auth');
const passport = require('passport');

router.post('/signup', signup);
router.post('/login', login);
router.post('/coach/signup', coachSignup);
router.post('/coach/login', coachLogin);
router.get('/me', auth, getMe);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuth
);

module.exports = router;
