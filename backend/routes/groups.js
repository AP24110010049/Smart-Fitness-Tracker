const express = require('express');
const router = express.Router();
const { createGroup, getGroups, joinGroup, leaveGroup, getMyGroups } = require('../controllers/groupController');
const auth = require('../middleware/auth');

router.post('/', auth, createGroup);
router.get('/', auth, getGroups);
router.get('/mine', auth, getMyGroups);
router.post('/:id/join', auth, joinGroup);
router.post('/:id/leave', auth, leaveGroup);

module.exports = router;
