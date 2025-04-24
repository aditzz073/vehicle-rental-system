// filepath: /Users/aditya/Documents/vehicle_rental/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', authController.isAuthenticated, authController.getProfile);
router.put('/profile', authController.isAuthenticated, authController.updateProfile);
router.put('/change-password', authController.isAuthenticated, authController.changePassword);

module.exports = router;