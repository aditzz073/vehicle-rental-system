// filepath: /Users/aditya/Documents/vehicle_rental/controllers/rentalController.js
const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

const rentalController = {
  // Get user's rentals
  getUserRentals: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentals = await Rental.getUserRentals(userId);
      res.status(200).json(rentals);
    } catch (error) {
      console.error('Error getting user rentals:', error);
      res.status(500).json({ message: 'Server error getting rentals' });
    }
  },
  
  // Get all rentals (admin only)
  getAllRentals: async (req, res) => {
    try {
      const rentals = await Rental.getAllRentals();
      res.status(200).json(rentals);
    } catch (error) {
      console.error('Error getting all rentals:', error);
      res.status(500).json({ message: 'Server error getting all rentals' });
    }
  },
  
  // Get rental by ID
  getRentalById: async (req, res) => {
    try {
      const rentalId = req.params.id;
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check if the rental belongs to the user or user is admin
      if (rental.user_id !== req.session.user.user_id && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.status(200).json(rental);
    } catch (error) {
      console.error('Error getting rental by ID:', error);
      res.status(500).json({ message: 'Server error getting rental' });
    }
  },
  
  // Calculate rental cost
  calculateRentalCost: async (req, res) => {
    try {
      const { vehicle_id, start_date, end_date } = req.body;
      
      if (!vehicle_id || !start_date || !end_date) {
        return res.status(400).json({ 
          message: 'Missing required fields: vehicle_id, start_date, end_date' 
        });
      }
      
      const rentalCost = await Rental.calculateRentalCost(
        vehicle_id, 
        start_date, 
        end_date
      );
      
      res.status(200).json(rentalCost);
    } catch (error) {
      console.error('Error calculating rental cost:', error);
      res.status(500).json({ message: 'Server error calculating rental cost' });
    }
  },
  
  // Create a rental
  createRental: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const { vehicle_id, start_date, end_date } = req.body;
      
      // Validate required fields
      if (!vehicle_id || !start_date || !end_date) {
        return res.status(400).json({ 
          message: 'Missing required fields: vehicle_id, start_date, end_date' 
        });
      }
      
      // Check if vehicle exists
      const vehicle = await Vehicle.findById(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      // Check if vehicle is available for those dates
      const isAvailable = await Vehicle.checkAvailabilityForDateRange(
        vehicle_id, 
        new Date(start_date), 
        new Date(end_date)
      );
      
      if (!isAvailable) {
        return res.status(400).json({ 
          message: 'Vehicle is not available for the selected dates' 
        });
      }
      
      // Calculate rental cost
      const { totalCost } = await Rental.calculateRentalCost(
        vehicle_id, 
        start_date, 
        end_date
      );
      
      // Create the rental
      const newRental = await Rental.create({
        user_id: userId,
        vehicle_id,
        start_date,
        end_date,
        total_cost: totalCost
      });
      
      res.status(201).json({
        message: 'Rental created successfully',
        rental: newRental
      });
    } catch (error) {
      console.error('Error creating rental:', error);
      res.status(500).json({ message: 'Server error creating rental' });
    }
  },
  
  // Cancel a rental
  cancelRental: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentalId = req.params.id;
      
      // Get the rental
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check if the rental belongs to the user or user is admin
      if (rental.user_id !== userId && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if rental can be cancelled
      if (rental.status !== 'pending' && rental.status !== 'active') {
        return res.status(400).json({ 
          message: `Cannot cancel rental in ${rental.status} status` 
        });
      }
      
      // Update rental status
      const success = await Rental.updateStatus(rentalId, 'cancelled');
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to cancel rental' });
      }
      
      // If payment was made, process refund
      if (rental.payment_status === 'paid') {
        // Get payment info
        const payments = await Payment.getByRentalId(rentalId);
        if (payments && payments.length > 0) {
          const payment = payments.find(p => p.status === 'successful');
          if (payment) {
            await Payment.processRefund(payment.payment_id);
          }
        }
      }
      
      res.status(200).json({ message: 'Rental cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling rental:', error);
      res.status(500).json({ message: 'Server error cancelling rental' });
    }
  },
  
  // Update rental status (admin only)
  updateRentalStatus: async (req, res) => {
    try {
      const rentalId = req.params.id;
      const { status } = req.body;
      
      if (!status || !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Get the rental
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Update rental status
      const success = await Rental.updateStatus(rentalId, status);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update rental status' });
      }
      
      res.status(200).json({ message: 'Rental status updated successfully' });
    } catch (error) {
      console.error('Error updating rental status:', error);
      res.status(500).json({ message: 'Server error updating rental status' });
    }
  },
  
  // Process payment for a rental
  processPayment: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentalId = req.params.id;
      const { payment_method, transaction_id } = req.body;
      
      // Get the rental
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check if the rental belongs to the user
      if (rental.user_id !== userId && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Check if payment is already made
      if (rental.payment_status === 'paid') {
        return res.status(400).json({ message: 'Rental is already paid' });
      }
      
      // Process the payment
      const paymentResult = await Payment.processPayment(rentalId, {
        amount: rental.total_cost,
        payment_method,
        transaction_id
      });
      
      if (!paymentResult.success) {
        return res.status(400).json({ message: 'Payment processing failed' });
      }
      
      res.status(200).json({
        message: 'Payment processed successfully',
        payment_id: paymentResult.paymentId
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Server error processing payment' });
    }
  },
  
  // Get rental payments
  getRentalPayments: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentalId = req.params.id;
      
      // Get the rental
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check if the rental belongs to the user or user is admin
      if (rental.user_id !== userId && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Get payments
      const payments = await Payment.getByRentalId(rentalId);
      res.status(200).json(payments);
    } catch (error) {
      console.error('Error getting rental payments:', error);
      res.status(500).json({ message: 'Server error getting payments' });
    }
  },
  
  // Process refund (admin only)
  processRefund: async (req, res) => {
    try {
      const rentalId = req.params.id;
      
      // Get the rental
      const rental = await Rental.findById(rentalId);
      
      if (!rental) {
        return res.status(404).json({ message: 'Rental not found' });
      }
      
      // Check if payment is made
      if (rental.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Rental is not paid' });
      }
      
      // Get payment info
      const payments = await Payment.getByRentalId(rentalId);
      
      if (!payments || payments.length === 0) {
        return res.status(400).json({ message: 'No payment found for this rental' });
      }
      
      const payment = payments.find(p => p.status === 'successful');
      
      if (!payment) {
        return res.status(400).json({ message: 'No successful payment found for this rental' });
      }
      
      // Process refund
      const refundResult = await Payment.processRefund(payment.payment_id);
      
      if (!refundResult.success) {
        return res.status(400).json({ message: 'Refund processing failed' });
      }
      
      res.status(200).json({
        message: 'Refund processed successfully',
        refund_id: refundResult.refundId
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({ message: 'Server error processing refund' });
    }
  },
  
  // Create a review for a rental
  createReview: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentalId = req.params.id;
      const { rating, comment } = req.body;
      
      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      
      // Check if user can review
      const canReviewResult = await Review.checkUserCanReview(userId, rentalId);
      
      if (!canReviewResult.canReview) {
        return res.status(400).json({ message: canReviewResult.reason });
      }
      
      // Get the rental to get vehicle_id
      const rental = await Rental.findById(rentalId);
      
      // Create the review
      const newReview = await Review.create({
        rental_id: rentalId,
        user_id: userId,
        vehicle_id: rental.vehicle_id,
        rating,
        comment
      });
      
      res.status(201).json({
        message: 'Review created successfully',
        review: newReview
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Server error creating review' });
    }
  },
  
  // Update a review
  updateReview: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const rentalId = req.params.id;
      const { rating, comment } = req.body;
      
      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      
      // Get the review
      const review = await Review.getByRentalId(rentalId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if the review belongs to the user
      if (review.user_id !== userId && !req.session.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Update the review
      const success = await Review.update(review.review_id, { rating, comment });
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update review' });
      }
      
      res.status(200).json({ message: 'Review updated successfully' });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Server error updating review' });
    }
  }
};

module.exports = rentalController;