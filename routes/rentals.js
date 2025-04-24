// filepath: /Users/aditya/Documents/vehicle_rental/routes/rentals.js
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authController = require('../controllers/authController');

// Rental routes - All require authentication
router.use(authController.isAuthenticated);

// User rental routes
router.get('/user', rentalController.getUserRentals);
router.post('/calculate', rentalController.calculateRentalCost);
router.post('/', rentalController.createRental);
router.get('/:id', rentalController.getRentalById);
router.post('/:id/cancel', rentalController.cancelRental);

// Review routes related to rentals
router.post('/:id/review', rentalController.createReview);
router.put('/:id/review', rentalController.updateReview);

// Payment routes related to rentals
router.post('/:id/pay', rentalController.processPayment);
router.get('/:id/payments', rentalController.getRentalPayments);

// Admin only routes
router.get('/', authController.isAdmin, rentalController.getAllRentals);
router.put('/:id/status', authController.isAdmin, rentalController.updateRentalStatus);
router.post('/:id/refund', authController.isAdmin, rentalController.processRefund);

module.exports = router;