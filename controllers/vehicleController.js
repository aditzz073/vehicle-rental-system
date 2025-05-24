const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');

class VehicleController {
  // Get all vehicles with search and filtering
  static async getAllVehicles(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        category,
        location,
        min_price,
        max_price,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      // If no search criteria, get all vehicles
      if (!search && !category && !location && !min_price && !max_price && !start_date && !end_date) {
        const vehicles = await Vehicle.getAllVehicles();
        
        res.json({
          success: true,
          vehicles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: vehicles.length,
            pages: Math.ceil(vehicles.length / limit)
          }
        });
        return;
      }

      // Use the searchVehicles method for filtered results
      const searchCriteria = {
        search,
        category,
        location,
        daily_rate_min: min_price,
        daily_rate_max: max_price,
        start_date,
        end_date,
        page,
        limit
      };

      const result = await Vehicle.searchVehicles(searchCriteria);
      const vehicles = result.vehicles || result;
      const totalVehicles = result.pagination ? result.pagination.total : vehicles.length;

      res.json({
        success: true,
        vehicles,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalVehicles / limit),
          total_vehicles: totalVehicles,
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles',
        error: error.message
      });
    }
  }

  // Get vehicle by ID
  static async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Get vehicle reviews and rating summary
      const reviews = await Review.findByVehicleId(id, 5, 0);
      const ratingSummary = await Review.getVehicleRatingSummary(id);

      res.json({
        success: true,
        vehicle: {
          ...vehicle,
          reviews,
          rating_summary: ratingSummary
        }
      });

    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle',
        error: error.message
      });
    }
  }

  // Check vehicle availability
  static async checkAvailability(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const isAvailable = await Vehicle.checkAvailability(id, start_date, end_date);
      let rentalCost = null;

      if (isAvailable) {
        rentalCost = await Vehicle.calculateRentalCost(id, start_date, end_date);
      }

      res.json({
        success: true,
        available: isAvailable,
        rental_cost: rentalCost
      });

    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error.message
      });
    }
  }

  // Get vehicle categories
  static async getCategories(req, res) {
    try {
      const categories = await Vehicle.getCategories();

      res.json({
        success: true,
        categories
      });

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
  }

  // Get available locations
  static async getLocations(req, res) {
    try {
      const locations = await Vehicle.getLocations();

      res.json({
        success: true,
        locations
      });

    } catch (error) {
      console.error('Get locations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch locations',
        error: error.message
      });
    }
  }

  // Get featured vehicles
  static async getFeaturedVehicles(req, res) {
    try {
      const { limit = 6 } = req.query;
      const vehicles = await Vehicle.getFeaturedVehicles(parseInt(limit));

      res.json({
        success: true,
        vehicles
      });

    } catch (error) {
      console.error('Get featured vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured vehicles',
        error: error.message
      });
    }
  }

  // Get luxury vehicles
  static async getLuxuryVehicles(req, res) {
    try {
      const { limit = 8 } = req.query;
      const vehicles = await Vehicle.getLuxury(parseInt(limit));

      res.json({
        success: true,
        vehicles
      });

    } catch (error) {
      console.error('Get luxury vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch luxury vehicles',
        error: error.message
      });
    }
  }

  // Search vehicles
  static async searchVehicles(req, res) {
    try {
      const {
        search,
        location,
        start_date,
        end_date,
        page = 1,
        limit = 12,
        category,
        vehicle_type,
        min_price,
        max_price
      } = req.query;

      const searchCriteria = {
        search,
        location,
        start_date,
        end_date,
        page,
        limit,
        category,
        vehicle_type,
        daily_rate_min: min_price,
        daily_rate_max: max_price
      };

      const result = await Vehicle.searchVehicles(searchCriteria);

      res.json({
        success: true,
        vehicles: result.vehicles || result,
        pagination: result.pagination || null
      });

    } catch (error) {
      console.error('Search vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search vehicles',
        error: error.message
      });
    }
  }

  // Get price range
  static async getPriceRange(req, res) {
    try {
      const priceRange = await Vehicle.getPriceRange();

      res.json({
        success: true,
        price_range: priceRange
      });

    } catch (error) {
      console.error('Get price range error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch price range',
        error: error.message
      });
    }
  }

  // Get vehicle stats (for dashboard)
  static async getVehicleStats(req, res) {
    try {
      const stats = await Vehicle.getStats();

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Get vehicle stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle stats',
        error: error.message
      });
    }
  }

  // Get similar vehicles
  static async getSimilarVehicles(req, res) {
    try {
      const { id } = req.params;
      const { limit = 4 } = req.query;

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      const similarVehicles = await Vehicle.findSimilar(id, vehicle.category, parseInt(limit));

      res.json({
        success: true,
        vehicles: similarVehicles
      });

    } catch (error) {
      console.error('Get similar vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch similar vehicles',
        error: error.message
      });
    }
  }

  // Get vehicle reviews
  static async getVehicleReviews(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const reviews = await Review.findByVehicleId(id, parseInt(limit), parseInt(offset));
      const ratingSummary = await Review.getVehicleRatingSummary(id);

      res.json({
        success: true,
        reviews,
        rating_summary: ratingSummary,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get vehicle reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle reviews',
        error: error.message
      });
    }
  }

  // Calculate rental cost
  static async calculateRentalCost(req, res) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const rentalCost = await Vehicle.calculateRentalCost(id, start_date, end_date);

      res.json({
        success: true,
        rental_cost: rentalCost
      });

    } catch (error) {
      console.error('Calculate rental cost error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate rental cost',
        error: error.message
      });
    }
  }

  // Get vehicles by category
  static async getVehiclesByCategory(req, res) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 12 } = req.query;

      const offset = (page - 1) * limit;
      const vehicles = await Vehicle.findByCategory(category, parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        vehicles,
        category,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get vehicles by category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles by category',
        error: error.message
      });
    }
  }

  // Get top rated vehicles
  static async getTopRatedVehicles(req, res) {
    try {
      const { limit = 6 } = req.query;
      const vehicles = await Review.getTopRatedVehicles(parseInt(limit));

      res.json({
        success: true,
        vehicles
      });

    } catch (error) {
      console.error('Get top rated vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top rated vehicles',
        error: error.message
      });
    }
  }
}

module.exports = VehicleController;
