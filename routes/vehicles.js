const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');

// Public routes - no authentication required
router.get('/', VehicleController.getAllVehicles);
router.get('/search', VehicleController.searchVehicles);
router.get('/categories', VehicleController.getCategories);
router.get('/locations', VehicleController.getLocations);
router.get('/featured', VehicleController.getFeaturedVehicles);
router.get('/luxury', VehicleController.getLuxuryVehicles);
router.get('/top-rated', VehicleController.getTopRatedVehicles);
router.get('/price-range', VehicleController.getPriceRange);
router.get('/stats', VehicleController.getVehicleStats);
router.get('/category/:category', VehicleController.getVehiclesByCategory);

// Vehicle-specific routes
router.get('/:id', VehicleController.getVehicleById);
router.get('/:id/availability', VehicleController.checkAvailability);
router.get('/:id/similar', VehicleController.getSimilarVehicles);
router.get('/:id/reviews', VehicleController.getVehicleReviews);
router.get('/:id/cost', VehicleController.calculateRentalCost);

module.exports = router;
