const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticateJWT, isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/search', vehicleController.searchVehicles);
router.get('/types', vehicleController.getVehicleTypes);
router.get('/categories', vehicleController.getVehicleCategories);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/pricing-tiers', vehicleController.getVehiclePricingTiers);
router.get('/available/all', vehicleController.getAvailableVehicles);
router.get('/available/cities', vehicleController.getAvailableCities);
router.get('/available/states', vehicleController.getAvailableStates);

// Calculate rental cost without requiring authentication
router.get('/calculate-rental', vehicleController.calculateRentalCost);
router.post('/calculate-rental', vehicleController.calculateRentalCost);

// Check availability without requiring authentication
router.get('/check-availability', vehicleController.checkAvailability);
router.post('/check-availability', vehicleController.checkAvailability);

// Protected routes - require authentication
router.get('/', authenticateJWT, vehicleController.getAllVehicles);

// Admin-only routes
router.post('/', authenticateJWT, isAdmin, vehicleController.createVehicle);
router.put('/:id', authenticateJWT, isAdmin, vehicleController.updateVehicle);
router.delete('/:id', authenticateJWT, isAdmin, vehicleController.deleteVehicle);
router.patch('/:id/availability', authenticateJWT, isAdmin, vehicleController.updateAvailability);

module.exports = router;