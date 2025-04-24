// filepath: /Users/aditya/Documents/vehicle_rental/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');

// All admin routes require authentication and admin privileges
router.use(authController.isAuthenticated);
router.use(authController.isAdmin);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/toggle-admin', adminController.toggleAdminStatus);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/deactivate', adminController.deactivateUser);

// Vehicle management in admin section
router.get('/vehicles', adminController.getAllVehicles);
router.post('/vehicles', adminController.createVehicle);
router.put('/vehicles/:id', adminController.updateVehicle);
router.delete('/vehicles/:id', adminController.deleteVehicle);

// Rental management
router.get('/rentals', adminController.getAllRentals);
router.get('/rentals/active', adminController.getActiveRentals);
router.get('/rentals/pending', adminController.getPendingRentals);
router.put('/rentals/:id/status', adminController.updateRentalStatus);

// Payment management
router.get('/payments', adminController.getAllPayments);
router.get('/payments/stats', adminController.getPaymentStatistics);
router.put('/payments/:id/status', adminController.updatePaymentStatus);
router.post('/payments/:id/refund', adminController.processRefund);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

module.exports = router;