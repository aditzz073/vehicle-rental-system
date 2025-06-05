const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);
router.get('/analytics', AdminController.getAnalytics);
router.get('/system-status', AdminController.getSystemStatus);

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.put('/users/:id/status', AdminController.toggleUserStatus);
router.put('/users/bulk', AdminController.bulkUpdateUsers);

// Vehicle management
router.get('/vehicles', AdminController.getAllVehicles);
router.post('/vehicles', uploadSingle, AdminController.createVehicle, handleUploadError);
router.put('/vehicles/:id', uploadSingle, AdminController.updateVehicle, handleUploadError);
router.delete('/vehicles/:id', AdminController.deleteVehicle);

// Vehicle image upload routes
router.post('/vehicles/:id/images', uploadMultiple, AdminController.uploadVehicleImages, handleUploadError);
router.delete('/vehicles/:id/images/:imageId', AdminController.deleteVehicleImage);

// Rental management
router.get('/rentals', AdminController.getAllRentals);
router.put('/rentals/:id/status', AdminController.updateRentalStatus);

// Payment management
router.get('/payments', AdminController.getAllPayments);
router.post('/payments/:id/refund', AdminController.refundPayment);

// Review management
router.get('/reviews', AdminController.getAllReviews);
router.delete('/reviews/:id', AdminController.deleteReview);

// Data export
router.get('/export', AdminController.exportData);

module.exports = router;
