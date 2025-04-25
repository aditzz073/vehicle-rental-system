const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');

const vehicleController = {
  // Get all vehicles
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.getAllVehicles();
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      res.status(500).json({ message: 'Server error getting vehicles' });
    }
  },
  
  // Get available vehicles
  getAvailableVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.getAvailableVehicles();
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error getting available vehicles:', error);
      res.status(500).json({ message: 'Server error getting available vehicles' });
    }
  },
  
  // Get vehicle by ID
  getVehicleById: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const vehicle = await Vehicle.findById(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      // Get average rating
      const ratingStats = await Review.getVehicleAverageRating(vehicleId);
      
      res.status(200).json({
        ...vehicle,
        rating_stats: ratingStats
      });
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      res.status(500).json({ message: 'Server error getting vehicle' });
    }
  },
  
  // Get vehicle types
  getVehicleTypes: async (req, res) => {
    try {
      const types = await Vehicle.getVehicleTypes();
      res.status(200).json(types);
    } catch (error) {
      console.error('Error getting vehicle types:', error);
      res.status(500).json({ message: 'Server error getting vehicle types' });
    }
  },
  
  // Create a new vehicle (admin only)
  createVehicle: async (req, res) => {
    try {
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude 
      } = req.body;
      
      // Validate required fields
      if (!make || !model || !year || !registration_number || !vehicle_type || !daily_rate) {
        return res.status(400).json({ 
          message: 'Missing required fields: make, model, year, registration_number, vehicle_type, daily_rate' 
        });
      }
      
      const newVehicle = await Vehicle.create({
        make, 
        model, 
        year, 
        registration_number, 
        color, 
        mileage, 
        vehicle_type, 
        daily_rate,
        image_url,
        description,
        location_city,
        location_state,
        location_zip,
        location_address,
        location_latitude,
        location_longitude
      });
      
      res.status(201).json({
        message: 'Vehicle created successfully',
        vehicle: newVehicle
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ message: 'Server error creating vehicle' });
    }
  },
  
  // Update a vehicle (admin only)
  updateVehicle: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, is_available, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude
      } = req.body;
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const success = await Vehicle.update(vehicleId, {
        make, 
        model, 
        year, 
        registration_number, 
        color, 
        mileage, 
        vehicle_type, 
        daily_rate, 
        is_available, 
        image_url, 
        description,
        location_city,
        location_state,
        location_zip,
        location_address,
        location_latitude,
        location_longitude
      });
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update vehicle' });
      }
      
      res.status(200).json({ message: 'Vehicle updated successfully' });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ message: 'Server error updating vehicle' });
    }
  },
  
  // Delete a vehicle (admin only)
  deleteVehicle: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const success = await Vehicle.delete(vehicleId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to delete vehicle' });
      }
      
      res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ message: 'Server error deleting vehicle' });
    }
  },
  
  // Update vehicle availability (admin only)
  updateAvailability: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const { is_available } = req.body;
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const success = await Vehicle.updateAvailability(vehicleId, is_available);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update availability' });
      }
      
      res.status(200).json({ message: 'Availability updated successfully' });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ message: 'Server error updating availability' });
    }
  },
  
  // Search vehicles
  searchVehicles: async (req, res) => {
    try {
      const criteria = req.query;
      const vehicles = await Vehicle.searchVehicles(criteria);
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error searching vehicles:', error);
      res.status(500).json({ message: 'Server error searching vehicles' });
    }
  },
  
  // Get vehicle reviews
  getVehicleReviews: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const reviews = await Review.getByVehicleId(vehicleId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error getting vehicle reviews:', error);
      res.status(500).json({ message: 'Server error getting reviews' });
    }
  },
  
  // Check vehicle availability for a date range
  checkAvailability: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      const isAvailable = await Vehicle.checkAvailabilityForDateRange(
        vehicleId, 
        new Date(start_date), 
        new Date(end_date)
      );
      
      if (!isAvailable) {
        return res.status(200).json({ 
          available: false,
          message: 'Vehicle is not available for the selected dates'
        });
      }
      
      // If available, calculate rental cost as well
      const rentalCost = await Rental.calculateRentalCost(vehicleId, start_date, end_date);
      
      res.status(200).json({
        available: true,
        message: 'Vehicle is available for the selected dates',
        rental_cost: rentalCost
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({ message: 'Server error checking availability' });
    }
  },
  
  // Get vehicles by location
  getVehiclesByLocation: async (req, res) => {
    try {
      const { location, radius } = req.query;
      
      if (!location) {
        return res.status(400).json({ message: 'Location parameter is required' });
      }
      
      let vehicles;
      
      // Check if location contains coordinates
      if (req.query.latitude && req.query.longitude) {
        vehicles = await Vehicle.searchVehiclesByLocation({
          latitude: req.query.latitude,
          longitude: req.query.longitude
        }, radius || 10);
      } else {
        // Search by text location (city, state, zip)
        vehicles = await Vehicle.searchVehiclesByLocation(location);
      }
      
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error getting vehicles by location:', error);
      res.status(500).json({ message: 'Server error getting vehicles by location' });
    }
  },
  
  // Get all available cities
  getAvailableCities: async (req, res) => {
    try {
      const cities = await Vehicle.getAvailableCities();
      res.status(200).json(cities);
    } catch (error) {
      console.error('Error getting available cities:', error);
      res.status(500).json({ message: 'Server error getting cities' });
    }
  },
  
  // Get all available states
  getAvailableStates: async (req, res) => {
    try {
      const states = await Vehicle.getAvailableStates();
      res.status(200).json(states);
    } catch (error) {
      console.error('Error getting available states:', error);
      res.status(500).json({ message: 'Server error getting states' });
    }
  }
};

module.exports = vehicleController;