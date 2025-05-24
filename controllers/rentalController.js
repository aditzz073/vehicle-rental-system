const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');

class RentalController {
  // Create a new rental booking
  static async createRental(req, res) {
    try {
      const userId = req.user?.id || req.session?.user?.id;
      const {
        vehicle_id,
        start_date,
        end_date,
        pickup_location,
        dropoff_location,
        special_requests
      } = req.body;

      // Validation
      if (!vehicle_id || !start_date || !end_date || !pickup_location) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle ID, start date, end date, and pickup location are required'
        });
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      const now = new Date();

      if (startDate < now) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past'
        });
      }

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      // Check vehicle existence and availability
      const vehicle = await Vehicle.findById(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found'
        });
      }

      if (!vehicle.is_available) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle is not available for rental'
        });
      }

      // Check availability for the requested dates
      const isAvailable = await Vehicle.checkAvailability(vehicle_id, start_date, end_date);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle is not available for the selected dates'
        });
      }

      // Calculate total cost
      const totalCost = await Vehicle.calculateRentalCost(vehicle_id, start_date, end_date);

      // Create rental
      const rentalData = {
        user_id: userId,
        vehicle_id,
        start_date,
        end_date,
        pickup_location,
        dropoff_location: dropoff_location || pickup_location,
        total_cost: totalCost.total,
        special_requests
      };

      const rental = await Rental.create(rentalData);

      res.status(201).json({
        success: true,
        message: 'Rental booking created successfully',
        rental,
        cost_breakdown: totalCost
      });

    } catch (error) {
      console.error('Create rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create rental booking',
        error: error.message
      });
    }
  }

  // Get user's rentals
  static async getUserRentals(req, res) {
    try {
      const userId = req.user?.id || req.session?.user?.id;
      const { page = 1, limit = 10, status } = req.query;

      const offset = (page - 1) * limit;
      let rentals;

      if (status) {
        const filters = { user_id: userId, status };
        rentals = await Rental.findAll(parseInt(limit), parseInt(offset), filters);
      } else {
        rentals = await Rental.findByUserId(userId, parseInt(limit), parseInt(offset));
      }

      res.json({
        success: true,
        rentals,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get user rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user rentals',
        error: error.message
      });
    }
  }

  // Get rental by ID
  static async getRentalById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.session?.user?.id;
      const isAdmin = req.user?.is_admin || req.session?.user?.is_admin;

      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      // Check if user owns this rental or is admin
      if (rental.user_id !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Get associated payments
      const payments = await Payment.findByRentalId(id);

      res.json({
        success: true,
        rental: {
          ...rental,
          payments
        }
      });

    } catch (error) {
      console.error('Get rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental',
        error: error.message
      });
    }
  }

  // Update rental status
  static async updateRentalStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || req.session?.user?.id;
      const isAdmin = req.user?.is_admin || req.session?.user?.is_admin;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      // Check permissions
      if (!isAdmin && rental.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Users can only cancel their own pending/confirmed rentals
      if (!isAdmin && status === 'cancelled' && !['pending', 'confirmed'].includes(rental.status)) {
        return res.status(400).json({
          success: false,
          message: 'Can only cancel pending or confirmed rentals'
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

  // Cancel rental
  static async cancelRental(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id || req.session?.user?.id;

      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      // Check if user owns this rental
      if (rental.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const cancelledRental = await Rental.cancel(id, reason);

      res.json({
        success: true,
        message: 'Rental cancelled successfully',
        rental: cancelledRental
      });

    } catch (error) {
      console.error('Cancel rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel rental',
        error: error.message
      });
    }
  }

  // Process rental payment
  static async processPayment(req, res) {
    try {
      const { id } = req.params;
      const {
        payment_method,
        card_details
      } = req.body;
      const userId = req.user?.id || req.session?.user?.id;

      if (!payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Payment method is required'
        });
      }

      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      // Check if user owns this rental
      if (rental.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if rental is in correct status for payment
      if (rental.status !== 'pending' && rental.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot process payment for this rental status'
        });
      }

      if (rental.payment_status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Rental is already paid'
        });
      }

      // Process payment
      const paymentData = {
        rental_id: id,
        user_id: userId,
        amount: rental.total_cost,
        payment_method,
        card_details
      };

      const paymentResult = await Payment.processPayment(paymentData);

      if (paymentResult.success) {
        // Update rental status to confirmed if payment successful
        await Rental.updateStatus(id, 'confirmed');
      }

      res.json({
        success: paymentResult.success,
        message: paymentResult.message,
        payment: paymentResult.payment,
        transaction_id: paymentResult.transaction_id
      });

    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment',
        error: error.message
      });
    }
  }

  // Get upcoming rentals
  static async getUpcomingRentals(req, res) {
    try {
      const userId = req.user?.id || req.session?.user?.id;
      const isAdmin = req.user?.is_admin || req.session?.user?.is_admin;

      let upcomingRentals;

      if (isAdmin) {
        upcomingRentals = await Rental.getUpcomingRentals();
      } else {
        // Get user's upcoming rentals
        const filters = {
          user_id: userId,
          status: 'confirmed'
        };
        const allUserRentals = await Rental.findAll(50, 0, filters);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        upcomingRentals = allUserRentals.filter(rental => {
          const startDate = new Date(rental.start_date);
          return startDate >= now && startDate <= tomorrow;
        });
      }

      res.json({
        success: true,
        upcoming_rentals: upcomingRentals
      });

    } catch (error) {
      console.error('Get upcoming rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming rentals',
        error: error.message
      });
    }
  }

  // Get rental history
  static async getRentalHistory(req, res) {
    try {
      const userId = req.user?.id || req.session?.user?.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;
      const filters = {
        user_id: userId,
        status: 'completed'
      };

      const rentals = await Rental.findAll(parseInt(limit), parseInt(offset), filters);

      res.json({
        success: true,
        rental_history: rentals,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Get rental history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental history',
        error: error.message
      });
    }
  }

  // Get rental statistics
  static async getRentalStats(req, res) {
    try {
      const userId = req.user?.id || req.session?.user?.id;
      const isAdmin = req.user?.is_admin || req.session?.user?.is_admin;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const stats = await Rental.getStats();

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Get rental stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rental statistics',
        error: error.message
      });
    }
  }

  // Check rental availability
  static async checkAvailability(req, res) {
    try {
      const { vehicle_id, start_date, end_date } = req.query;

      if (!vehicle_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle ID, start date, and end date are required'
        });
      }

      const isAvailable = await Rental.checkAvailability(vehicle_id, start_date, end_date);

      res.json({
        success: true,
        available: isAvailable
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

  // Get overdue rentals (admin only)
  static async getOverdueRentals(req, res) {
    try {
      const isAdmin = req.user?.is_admin || req.session?.user?.is_admin;

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const overdueRentals = await Rental.getOverdueRentals();

      res.json({
        success: true,
        overdue_rentals: overdueRentals
      });

    } catch (error) {
      console.error('Get overdue rentals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch overdue rentals',
        error: error.message
      });
    }
  }

  // Extend rental
  static async extendRental(req, res) {
    try {
      const { id } = req.params;
      const { new_end_date } = req.body;
      const userId = req.user?.id || req.session?.user?.id;

      if (!new_end_date) {
        return res.status(400).json({
          success: false,
          message: 'New end date is required'
        });
      }

      const rental = await Rental.findById(id);
      if (!rental) {
        return res.status(404).json({
          success: false,
          message: 'Rental not found'
        });
      }

      // Check if user owns this rental
      if (rental.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Check if rental can be extended
      if (rental.status !== 'active' && rental.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Can only extend active or confirmed rentals'
        });
      }

      const newEndDate = new Date(new_end_date);
      const currentEndDate = new Date(rental.end_date);

      if (newEndDate <= currentEndDate) {
        return res.status(400).json({
          success: false,
          message: 'New end date must be after current end date'
        });
      }

      // Check availability for extended period
      const isAvailable = await Rental.checkAvailability(
        rental.vehicle_id,
        rental.end_date,
        new_end_date,
        rental.id
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle is not available for the extended period'
        });
      }

      // Calculate additional cost
      const additionalCost = await Vehicle.calculateRentalCost(
        rental.vehicle_id,
        rental.end_date,
        new_end_date
      );

      // For now, just return the calculation
      // In a real implementation, you'd update the rental and process additional payment
      res.json({
        success: true,
        message: 'Rental can be extended',
        additional_cost: additionalCost,
        new_end_date
      });

    } catch (error) {
      console.error('Extend rental error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend rental',
        error: error.message
      });
    }
  }
}

module.exports = RentalController;
