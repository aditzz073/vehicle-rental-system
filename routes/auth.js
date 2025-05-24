const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
};

// Middleware to check if user is not authenticated (for login/register)
const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  res.status(400).json({ 
    success: false, 
    message: 'Already authenticated' 
  });
};

// Public routes
router.post('/register', isNotAuthenticated, AuthController.register);
router.post('/login', isNotAuthenticated, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/check', AuthController.checkAuth);

// Protected routes
router.post('/logout', isAuthenticated, AuthController.logout);
router.get('/profile', isAuthenticated, AuthController.getProfile);
router.put('/profile', isAuthenticated, AuthController.updateProfile);
router.put('/change-password', isAuthenticated, AuthController.changePassword);
router.delete('/account', isAuthenticated, AuthController.deleteAccount);

module.exports = router;
