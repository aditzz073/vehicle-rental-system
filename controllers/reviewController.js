const Review = require('../models/Review');
const Rental = require('../models/Rental');

class ReviewController {
  // Create a new review
  static async createReview(req, res) {
    try {
      const userId = req.session.user.id;
      const { rental_id, vehicle_id, rating, comment } = req.body;

      // Validation
      if (!rental_id || !vehicle_id || !rating) {
        return res.status(400).json({
          success: false,
          message: 'Rental ID, vehicle ID, and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      // Check if user can review this rental
      const eligibility = await Review.canUserReview(userId, rental_id);
      if (!eligibility.canReview) {
        return res.status(400).json({
          success: false,
          message: eligibility.reason
        });
      }

      const reviewData = {
        rental_id,
        user_id: userId,
        vehicle_id,
        rating,
        comment
      };

      const review = await Review.create(reviewData);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error.message
      });
    }
  }

  // Get reviews for a vehicle
  static async getVehicleReviews(req, res) {
    try {
      const { vehicle_id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const reviews = await Review.findByVehicleId(vehicle_id, parseInt(limit), parseInt(offset));
      const ratingSummary = await Review.getVehicleRatingSummary(vehicle_id);

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

  // Get user's reviews
  static async getUserReviews(req, res) {
    try {
      const userId = req.session.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const reviews = await Review.findByUserId(userId, parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        reviews,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user reviews',
        error: error.message
      });
    }
  }

  // Get review by ID
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        review
      });

    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review',
        error: error.message
      });
    }
  }

  // Update review
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      const { rating, comment } = req.body;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user owns this review
      if (review.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const updateData = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
          });
        }
        updateData.rating = rating;
      }
      if (comment !== undefined) {
        updateData.comment = comment;
      }

      const updatedReview = await Review.update(id, updateData);

      res.json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error.message
      });
    }
  }

  // Delete review
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      const isAdmin = req.session.user.is_admin;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Check if user owns this review or is admin
      if (review.user_id !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

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

  // Get recent reviews
  static async getRecentReviews(req, res) {
    try {
      const { limit = 5 } = req.query;
      const reviews = await Review.getRecentReviews(parseInt(limit));

      res.json({
        success: true,
        reviews
      });

    } catch (error) {
      console.error('Get recent reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent reviews',
        error: error.message
      });
    }
  }

  // Get top rated vehicles
  static async getTopRatedVehicles(req, res) {
    try {
      const { limit = 10 } = req.query;
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

  // Get rating distribution
  static async getRatingDistribution(req, res) {
    try {
      const distribution = await Review.getRatingDistribution();

      res.json({
        success: true,
        rating_distribution: distribution
      });

    } catch (error) {
      console.error('Get rating distribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rating distribution',
        error: error.message
      });
    }
  }

  // Get platform statistics
  static async getPlatformStats(req, res) {
    try {
      const stats = await Review.getPlatformStats();

      res.json({
        success: true,
        platform_stats: stats
      });

    } catch (error) {
      console.error('Get platform stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch platform statistics',
        error: error.message
      });
    }
  }

  // Check if user can review a rental
  static async checkReviewEligibility(req, res) {
    try {
      const { rental_id } = req.params;
      const userId = req.session.user.id;

      const eligibility = await Review.canUserReview(userId, rental_id);

      res.json({
        success: true,
        ...eligibility
      });

    } catch (error) {
      console.error('Check review eligibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check review eligibility',
        error: error.message
      });
    }
  }

  // Get all reviews with filters
  static async getAllReviews(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        rating,
        vehicle_id,
        user_id,
        min_rating
      } = req.query;

      const offset = (page - 1) * limit;
      const filters = {};

      if (rating) filters.rating = parseInt(rating);
      if (vehicle_id) filters.vehicle_id = vehicle_id;
      if (user_id) filters.user_id = user_id;
      if (min_rating) filters.min_rating = parseInt(min_rating);

      const result = await Review.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        reviews: result.reviews,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: result.pagination.total,
          has_more: result.pagination.hasMore
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

  // Get vehicle rating summary
  static async getVehicleRatingSummary(req, res) {
    try {
      const { vehicle_id } = req.params;
      const summary = await Review.getVehicleRatingSummary(vehicle_id);

      res.json({
        success: true,
        rating_summary: summary
      });

    } catch (error) {
      console.error('Get vehicle rating summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vehicle rating summary',
        error: error.message
      });
    }
  }

  // Get reviewable rentals for user
  static async getReviewableRentals(req, res) {
    try {
      const userId = req.session.user.id;

      // Get completed rentals that haven't been reviewed
      const completedRentals = await Rental.findByUserId(userId, 50, 0);
      const reviewableRentals = [];

      for (const rental of completedRentals) {
        if (rental.status === 'completed') {
          const existingReview = await Review.findByRentalId(rental.id);
          if (!existingReview) {
            reviewableRentals.push(rental);
          }
        }
      }

      res.json({
        success: true,
        reviewable_rentals: reviewableRentals
      });

    } catch (error) {
      console.error('Get reviewable rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviewable rentals',
        error: error.message
      });
    }
  }
}

module.exports = ReviewController;
