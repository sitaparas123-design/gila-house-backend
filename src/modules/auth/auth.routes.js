const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/google-login', authController.googleLogin);
router.post('/apple-login', authController.appleLogin);
router.put('/update-password', authenticate, authController.updatePassword);
router.put('/profile', authenticate, authController.updateProfile);
// router.get('/me', authenticate, authController.getMe);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPasswordWithOTP);

module.exports = router;
