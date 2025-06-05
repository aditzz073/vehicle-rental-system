const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { getFileUrl, deleteFile } = require('../middleware/upload');

class AdminController {
  // Dashboard overview
  static async getDashboard(req, res) {
    try {
      // Get various statistics
      const [
        userStats,
        vehicleStats,
        rentalStats,
        paymentStats,
        recentUsers,
        recentRentals,
        recentReviews
      ] = await Promise.all([
        User.getStats(),
        Vehicle.getStats(),
        Rental.getStats(),
        Payment.getStats(),
        User.getRecentUsers(5),
        Rental.getUpcomingRentals(),
        Review.getRecentReviews(5)
      ]);

      res.json({
        success: true,
        dashboard: {
          stats: {
            users: userStats,
            vehicles: vehicleStats,
            rentals: rentalStats,
            payments: paymentStats
          },
          recent_activity: {
            users: recentUsers,
            rentals: recentRentals,
            reviews: recentReviews
          }
        }
      });

    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }

  // User management
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};
      
      if (search) filters.search = search;
      if (status) filters.is_active = status === 'active';

      const result = await User.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        users: result.users,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: result.pagination.total,
          has_more: result.pagination.hasMore
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's rental history
      const rentals = await Rental.findByUserId(id, 10, 0);
      const payments = await Payment.findByUserId(id, 10, 0);

      const { password_hash, ...userResponse } = user;

      res.json({
        success: true,
        user: {
          ...userResponse,
          rental_history: rentals,
          payment_history: payments
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password_hash;
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const updatedUser = await User.update(id, updateData);

      const { password_hash, ...userResponse } = updatedUser;

      res.json({
        success: true,
        message: 'User updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message
      });
    }
  }

  static async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_active must be a boolean value'
        });
      }

      const updatedUser = await User.update(id, { is_active });

      const { password_hash, ...userResponse } = updatedUser;

      res.json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
        user: userResponse
      });

    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle user status',
        error: error.message
      });
    }
  }

  // Vehicle management
  static async getAllVehicles(req, res) {
    try {
      const { page = 1, limit = 20, search, category, status } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};
      
      if (search) filters.search = search;
      if (category) filters.category = category;
      if (status) filters.is_available = status === 'available';

      const result = await Vehicle.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        vehicles: result.vehicles,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: result.pagination.total,
          has_more: result.pagination.hasMore
        }
      });

    } catch (error) {
      console.error('Get all vehicles error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicles',
        error: error.message
      });
    }
  }

  static async createVehicle(req, res) {
    try {
      const vehicleData = req.body;

      // Handle uploaded image if present
      if (req.file) {
        vehicleData.image_url = getFileUrl(req, req.file.filename);
      }

      // Validation
      const requiredFields = ['make', 'model', 'year', 'category', 'daily_rate', 'location'];
      for (const field of requiredFields) {
        if (!vehicleData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      const vehicle = await Vehicle.create(vehicleData);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        vehicle
      });

    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create vehicle',
        error: error.message
      });
    }
  }

  static async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Handle uploaded image if present
      if (req.file) {
        updateData.image_url = getFileUrl(req, req.file.filename);
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const updatedVehicle = await Vehicle.update(id, updateData);

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        vehicle: updatedVehicle
      });

    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update vehicle',
        error: error.message
      });
    }
  }

  static async deleteVehicle(req, res) {
    try {
      const { id } = req.params;

      // Check if vehicle has active rentals
      const activeRentals = await Rental.findAll(1, 0, {
        vehicle_id: id,
        status: 'active'
      });

      if (activeRentals.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete vehicle with active rentals'
        });
      }

      await Vehicle.delete(id);

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });

    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete vehicle',
        error: error.message
      });
    }
  }

  // Rental management
  static async getAllRentals(req, res) {
    try {
      const { page = 1, limit = 20, status, user_id, vehicle_id } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};
      
      if (status) filters.status = status;
      if (user_id) filters.user_id = user_id;
      if (vehicle_id) filters.vehicle_id = vehicle_id;

      const result = await Rental.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        rentals: result.rentals,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: result.pagination.total,
          has_more: result.pagination.hasMore
        }
      });

    } catch (error) {
      console.error('Get all rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rentals',
        error: error.message
      });
    }
  }

  static async updateRentalStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const updatedRental = await Rental.updateStatus(id, status);

      res.json({
        success: true,
        message: 'Rental status updated successfully',
        rental: updatedRental
      });

    } catch (error) {
      console.error('Update rental status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rental status',
        error: error.message
      });
    }
  }

  // Payment management
  static async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 20, status, user_id, date_from, date_to } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};
      
      if (status) filters.status = status;
      if (user_id) filters.user_id = user_id;
      if (date_from) filters.date_from = date_from;
      if (date_to) filters.date_to = date_to;

      const payments = await Payment.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        payments,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
        error: error.message
      });
    }
  }

  static async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const refundResult = await Payment.refund(id, reason);

      res.json({
        success: true,
        message: 'Payment refunded successfully',
        refund: refundResult
      });

    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refund payment',
        error: error.message
      });
    }
  }

  // Review management
  static async getAllReviews(req, res) {
    try {
      const { page = 1, limit = 20, rating, vehicle_id } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};
      
      if (rating) filters.rating = rating;
      if (vehicle_id) filters.vehicle_id = vehicle_id;

      const reviews = await Review.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        reviews,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: error.message
      });
    }
  }

  static async deleteReview(req, res) {
    try {
      const { id } = req.params;

      await Review.delete(id);

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error.message
      });
    }
  }

  // Analytics and reports
  static async getAnalytics(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const [
        paymentStats,
        paymentMethods,
        platformStats,
        ratingDistribution,
        topRatedVehicles
      ] = await Promise.all([
        Payment.getStats(date_from, date_to),
        Payment.getPaymentMethodsStats(),
        Review.getPlatformStats(),
        Review.getRatingDistribution(),
        Review.getTopRatedVehicles(10)
      ]);

      res.json({
        success: true,
        analytics: {
          payment_stats: paymentStats,
          payment_methods: paymentMethods,
          platform_stats: platformStats,
          rating_distribution: ratingDistribution,
          top_rated_vehicles: topRatedVehicles
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics',
        error: error.message
      });
    }
  }

  // System monitoring
  static async getSystemStatus(req, res) {
    try {
      const [
        overdueRentals,
        failedPayments,
        upcomingRentals
      ] = await Promise.all([
        Rental.getOverdueRentals(),
        Payment.getRecentFailedPayments(10),
        Rental.getUpcomingRentals()
      ]);

      res.json({
        success: true,
        system_status: {
          overdue_rentals: overdueRentals,
          failed_payments: failedPayments,
          upcoming_rentals: upcomingRentals
        }
      });

    } catch (error) {
      console.error('Get system status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system status',
        error: error.message
      });
    }
  }

  // Bulk operations
  static async bulkUpdateUsers(req, res) {
    try {
      const { user_ids, update_data } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'user_ids array is required'
        });
      }

      if (!update_data || typeof update_data !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'update_data object is required'
        });
      }

      // Remove sensitive fields
      delete update_data.password_hash;
      delete update_data.id;

      const results = [];
      for (const userId of user_ids) {
        try {
          const updatedUser = await User.update(userId, update_data);
          results.push({ user_id: userId, success: true, user: updatedUser });
        } catch (error) {
          results.push({ user_id: userId, success: false, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Bulk update completed',
        results
      });

    } catch (error) {
      console.error('Bulk update users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update users',
        error: error.message
      });
    }
  }

  // Export data
  static async exportData(req, res) {
    try {
      const { type, date_from, date_to } = req.query;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Export type is required (users, vehicles, rentals, payments)'
        });
      }

      let data = [];
      let filename = '';

      switch (type) {
        case 'users':
          data = await User.findAll(1000, 0);
          filename = 'users_export.json';
          break;
        case 'vehicles':
          data = await Vehicle.findAll(1000, 0);
          filename = 'vehicles_export.json';
          break;
        case 'rentals':
          const filters = {};
          if (date_from) filters.date_from = date_from;
          if (date_to) filters.date_to = date_to;
          data = await Rental.findAll(1000, 0, filters);
          filename = 'rentals_export.json';
          break;
        case 'payments':
          const paymentFilters = {};
          if (date_from) paymentFilters.date_from = date_from;
          if (date_to) paymentFilters.date_to = date_to;
          data = await Payment.findAll(1000, 0, paymentFilters);
          filename = 'payments_export.json';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid export type'
          });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json({
        success: true,
        export_type: type,
        export_date: new Date().toISOString(),
        data
      });

    } catch (error) {
      console.error('Export data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export data',
        error: error.message
      });
    }
  }

  // Vehicle image upload methods
  static async uploadVehicleImages(req, res) {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided'
        });
      }

      // Verify vehicle exists
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        // Clean up uploaded files if vehicle doesn't exist
        req.files.forEach(file => deleteFile(file.filename));
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      // Generate URLs for uploaded images
      const imageUrls = req.files.map(file => getFileUrl(req, file.filename));

      // Update vehicle with new images (assuming we store multiple images as JSON array)
      const existingImages = vehicle.images ? JSON.parse(vehicle.images) : [];
      const updatedImages = [...existingImages, ...imageUrls];

      await Vehicle.update(id, { images: JSON.stringify(updatedImages) });

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        images: imageUrls,
        total_images: updatedImages.length
      });

    } catch (error) {
      console.error('Upload vehicle images error:', error);
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(file => deleteFile(file.filename));
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload images',
        error: error.message
      });
    }
  }

  static async deleteVehicleImage(req, res) {
    try {
      const { id, imageId } = req.params;

      // Verify vehicle exists
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      const existingImages = vehicle.images ? JSON.parse(vehicle.images) : [];
      const imageIndex = parseInt(imageId);

      if (imageIndex < 0 || imageIndex >= existingImages.length) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      // Extract filename from URL and delete file
      const imageUrl = existingImages[imageIndex];
      const filename = imageUrl.split('/').pop();
      deleteFile(filename);

      // Remove image from array
      existingImages.splice(imageIndex, 1);

      // Update vehicle
      await Vehicle.update(id, { images: JSON.stringify(existingImages) });

      res.json({
        success: true,
        message: 'Image deleted successfully',
        remaining_images: existingImages.length
      });

    } catch (error) {
      console.error('Delete vehicle image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }
  }
}

module.exports = AdminController;
