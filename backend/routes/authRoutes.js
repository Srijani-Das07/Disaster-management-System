const express = require('express');
const { guestLogin, register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/guest', guestLogin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

module.exports = router;