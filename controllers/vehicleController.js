const Vehicle = require('../models/Vehicle');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error getting all vehicles:', error);
    res.status(500).json({ message: 'Failed to get vehicles', error: error.message });
  }
};

// Get available vehicles
exports.getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.getAvailableVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error getting available vehicles:', error);
    res.status(500).json({ message: 'Failed to get available vehicles', error: error.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    res.status(500).json({ message: 'Failed to get vehicle', error: error.message });
  }
};

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const newVehicle = await Vehicle.create(vehicleData);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Failed to create vehicle', error: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicleData = req.body;
    
    const result = await Vehicle.update(vehicleId, vehicleData);
    
    if (!result) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Failed to update vehicle', error: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const result = await Vehicle.delete(vehicleId);
    
    if (!result) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Failed to delete vehicle', error: error.message });
  }
};

// Update vehicle availability
exports.updateAvailability = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { is_available } = req.body;
    
    if (is_available === undefined) {
      return res.status(400).json({ message: 'is_available field is required' });
    }
    
    const result = await Vehicle.updateAvailability(vehicleId, is_available);
    
    if (!result) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle availability updated successfully' });
  } catch (error) {
    console.error('Error updating vehicle availability:', error);
    res.status(500).json({ message: 'Failed to update vehicle availability', error: error.message });
  }
};

// Search vehicles
exports.searchVehicles = async (req, res) => {
  try {
    // Extract query parameters
    const {
      make, model, year_min, year_max, daily_rate_min, daily_rate_max, 
      vehicle_type, category, available, sort, page = 1, limit = 10,
      search, location, start_date, end_date, latitude, longitude, radius
    } = req.query;
    
    // Build search criteria
    const criteria = {};
    
    if (make) criteria.make = make;
    if (model) criteria.model = model;
    if (year_min) criteria.year_min = parseInt(year_min, 10);
    if (year_max) criteria.year_max = parseInt(year_max, 10);
    if (daily_rate_min) criteria.daily_rate_min = parseFloat(daily_rate_min);
    if (daily_rate_max) criteria.daily_rate_max = parseFloat(daily_rate_max);
    if (vehicle_type) criteria.vehicle_type = vehicle_type;
    if (category) criteria.category = category;
    if (available !== undefined) criteria.available = available === 'true';
    
    // If search term provided, apply it to either make OR model
    if (search) {
      criteria.search = search; // Use a general search term instead of strict matching
    }
    
    // Handle location-based search
    if (location) {
      // Simple location search by city/state/zip
      criteria.location = location;
    } else if (latitude && longitude) {
      // Proximity search with coordinates
      criteria.latitude = parseFloat(latitude);
      criteria.longitude = parseFloat(longitude);
      criteria.radius = radius ? parseFloat(radius) : 10; // Default 10 km radius
    }
    
    // Add sort parameter
    if (sort) criteria.sort = sort;
    
    // Check availability for date range if both start and end dates are provided
    if (start_date && end_date) {
      criteria.start_date = start_date;
      criteria.end_date = end_date;
    }
    
    // Perform search
    const vehicles = await Vehicle.searchVehicles(criteria);
    
    // Calculate pagination
    const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const endIndex = startIndex + parseInt(limit, 10);
    const results = {
      vehicles: vehicles.slice(startIndex, endIndex),
      pagination: {
        total: vehicles.length,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(vehicles.length / parseInt(limit, 10))
      }
    };
    
    res.json(results);
  } catch (error) {
    console.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Failed to search vehicles', error: error.message });
  }
};

// Get vehicle types
exports.getVehicleTypes = async (req, res) => {
  try {
    const types = await Vehicle.getVehicleTypes();
    res.json(types);
  } catch (error) {
    console.error('Error getting vehicle types:', error);
    res.status(500).json({ message: 'Failed to get vehicle types', error: error.message });
  }
};

// Get vehicle categories
exports.getVehicleCategories = async (req, res) => {
  try {
    const categories = await Vehicle.getVehicleCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting vehicle categories:', error);
    res.status(500).json({ message: 'Failed to get vehicle categories', error: error.message });
  }
};

// Get vehicle pricing tiers
exports.getVehiclePricingTiers = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const tiers = await Vehicle.getPricingTiers(vehicleId);
    res.json(tiers);
  } catch (error) {
    console.error('Error getting vehicle pricing tiers:', error);
    res.status(500).json({ message: 'Failed to get pricing tiers', error: error.message });
  }
};

// Calculate rental cost
exports.calculateRentalCost = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query || req.body;
    
    if (!vehicle_id || !start_date || !end_date) {
      return res.status(400).json({ 
        message: 'Vehicle ID, start date, and end date are required' 
      });
    }
    
    const costDetails = await Vehicle.calculateRentalCost(vehicle_id, start_date, end_date);
    res.json(costDetails);
  } catch (error) {
    console.error('Error calculating rental cost:', error);
    res.status(500).json({ message: 'Failed to calculate rental cost', error: error.message });
  }
};

// Check vehicle availability for date range
exports.checkAvailability = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.query || req.body;
    
    if (!vehicle_id || !start_date || !end_date) {
      return res.status(400).json({ 
        message: 'Vehicle ID, start date, and end date are required' 
      });
    }
    
    const isAvailable = await Vehicle.checkAvailabilityForDateRange(
      vehicle_id, 
      start_date, 
      end_date
    );
    
    res.json({ available: isAvailable });
  } catch (error) {
    console.error('Error checking vehicle availability:', error);
    res.status(500).json({ message: 'Failed to check availability', error: error.message });
  }
};

// Get available cities
exports.getAvailableCities = async (req, res) => {
  try {
    const cities = await Vehicle.getAvailableCities();
    res.json(cities);
  } catch (error) {
    console.error('Error getting available cities:', error);
    res.status(500).json({ message: 'Failed to get cities', error: error.message });
  }
};

// Get available states
exports.getAvailableStates = async (req, res) => {
  try {
    const states = await Vehicle.getAvailableStates();
    res.json(states);
  } catch (error) {
    console.error('Error getting available states:', error);
    res.status(500).json({ message: 'Failed to get states', error: error.message });
  }
};