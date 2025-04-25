const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authController = require('../controllers/authController');

// Public vehicle routes
router.get('/', vehicleController.getAllVehicles);
router.get('/available', vehicleController.getAvailableVehicles);
router.get('/types', vehicleController.getVehicleTypes);
router.get('/search', vehicleController.searchVehicles);
router.get('/locations/cities', vehicleController.getAvailableCities);
router.get('/locations/states', vehicleController.getAvailableStates);
router.get('/location', vehicleController.getVehiclesByLocation);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/reviews', vehicleController.getVehicleReviews);
router.get('/:id/availability', vehicleController.checkAvailability);

// Protected/Admin routes
router.post('/', authController.isAuthenticated, authController.isAdmin, vehicleController.createVehicle);
router.put('/:id', authController.isAuthenticated, authController.isAdmin, vehicleController.updateVehicle);
router.delete('/:id', authController.isAuthenticated, authController.isAdmin, vehicleController.deleteVehicle);
router.put('/:id/availability', authController.isAuthenticated, authController.isAdmin, vehicleController.updateAvailability);

module.exports = router;