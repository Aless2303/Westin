const express = require('express');
const { register, login, getMe, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin, checkValidation } = require('../utils/validators');
const router = express.Router();

// Rute pentru autentificare
router.post('/register', validateRegister, checkValidation, register);
router.post('/login', validateLogin, checkValidation, login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;