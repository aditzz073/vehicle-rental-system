// filepath: /Users/aditya/Documents/vehicle_rental/routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Public review routes
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.get('/vehicle/:vehicleId', reviewController.getReviewsByVehicle);
router.get('/stats/vehicle/:vehicleId', reviewController.getVehicleReviewStats);

// Protected review routes
router.use(authController.isAuthenticated);
router.get('/user/me', reviewController.getUserReviews);
router.delete('/:id', reviewController.deleteReview);

// Admin routes
router.get('/all', authController.isAdmin, reviewController.getAllReviewsAdmin);
router.delete('/:id/admin', authController.isAdmin, reviewController.adminDeleteReview);

module.exports = router;