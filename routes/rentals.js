const express = require('express');
const router = express.Router();
const RentalController = require('../controllers/rentalController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes (for availability checking)
router.get('/availability', RentalController.checkAvailability);

// Protected routes - user must be authenticated
router.use(isAuthenticated);

// Rental management
router.post('/', RentalController.createRental);
router.get('/', RentalController.getUserRentals);
router.get('/upcoming', RentalController.getUpcomingRentals);
router.get('/history', RentalController.getRentalHistory);

// Individual rental operations
router.get('/:id', RentalController.getRentalById);
router.put('/:id/status', RentalController.updateRentalStatus);
router.post('/:id/cancel', RentalController.cancelRental);
router.post('/:id/payment', RentalController.processPayment);
router.post('/:id/extend', RentalController.extendRental);

module.exports = router;
