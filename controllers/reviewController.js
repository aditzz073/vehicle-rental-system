// filepath: /Users/aditya/Documents/vehicle_rental/controllers/reviewController.js
const Review = require('../models/Review');

const reviewController = {
  // Get all reviews
  getAllReviews: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      
      const reviews = await Review.getAllReviews(limit, offset);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error getting all reviews:', error);
      res.status(500).json({ message: 'Server error getting reviews' });
    }
  },
  
  // Get single review by ID
  getReviewById: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      res.status(200).json(review);
    } catch (error) {
      console.error('Error getting review by ID:', error);
      res.status(500).json({ message: 'Server error getting review' });
    }
  },
  
  // Get reviews by vehicle
  getReviewsByVehicle: async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const reviews = await Review.getByVehicleId(vehicleId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error getting reviews by vehicle:', error);
      res.status(500).json({ message: 'Server error getting vehicle reviews' });
    }
  },
  
  // Get vehicle review statistics
  getVehicleReviewStats: async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const stats = await Review.getVehicleAverageRating(vehicleId);
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting vehicle review statistics:', error);
      res.status(500).json({ message: 'Server error getting review statistics' });
    }
  },
  
  // Get reviews by current user
  getUserReviews: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const reviews = await Review.getByUserId(userId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error getting user reviews:', error);
      res.status(500).json({ message: 'Server error getting user reviews' });
    }
  },
  
  // Delete a review (only allowed for own reviews)
  deleteReview: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const reviewId = req.params.id;
      
      // Get the review
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if the review belongs to the user
      if (review.user_id !== userId && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Delete the review
      const success = await Review.delete(reviewId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to delete review' });
      }
      
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Server error deleting review' });
    }
  },
  
  // Admin endpoints
  
  // Get all reviews for admin
  getAllReviewsAdmin: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      const reviews = await Review.getAllReviews(limit, offset);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error getting all reviews for admin:', error);
      res.status(500).json({ message: 'Server error getting reviews' });
    }
  },
  
  // Delete review as admin
  adminDeleteReview: async (req, res) => {
    try {
      const reviewId = req.params.id;
      
      // Get the review
      const review = await Review.findById(reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Delete the review
      const success = await Review.delete(reviewId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to delete review' });
      }
      
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review as admin:', error);
      res.status(500).json({ message: 'Server error deleting review' });
    }
  }
};

module.exports = reviewController;