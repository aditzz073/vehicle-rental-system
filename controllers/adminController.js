// filepath: /Users/aditya/Documents/vehicle_rental/controllers/adminController.js
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const adminController = {
  // User management
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Server error getting users' });
    }
  },
  
  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ message: 'Server error getting user' });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const { first_name, last_name, phone, address } = req.body;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const success = await User.update(userId, {
        first_name,
        last_name,
        phone,
        address
      });
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update user' });
      }
      
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error updating user' });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deleting the admin user
      if (user.is_admin) {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }
      
      const success = await User.delete(userId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to delete user' });
      }
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error deleting user' });
    }
  },
  
  toggleAdminStatus: async (req, res) => {
    try {
      const userId = req.params.id;
      const { is_admin } = req.body;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const success = await User.toggleAdminStatus(userId, is_admin);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update admin status' });
      }
      
      res.status(200).json({ message: 'Admin status updated successfully' });
    } catch (error) {
      console.error('Error toggling admin status:', error);
      res.status(500).json({ message: 'Server error updating admin status' });
    }
  },
  
  activateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const success = await User.activateAccount(userId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to activate user' });
      }
      
      res.status(200).json({ message: 'User activated successfully' });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({ message: 'Server error activating user' });
    }
  },
  
  deactivateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Prevent deactivating the admin user
      if (user.is_admin) {
        return res.status(400).json({ message: 'Cannot deactivate admin user' });
      }
      
      const success = await User.deactivateAccount(userId);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to deactivate user' });
      }
      
      res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: 'Server error deactivating user' });
    }
  },
  
  // Vehicle management
  getAllVehicles: async (req, res) => {
    try {
      const vehicles = await Vehicle.getAllVehicles();
      res.status(200).json(vehicles);
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      res.status(500).json({ message: 'Server error getting vehicles' });
    }
  },
  
  createVehicle: async (req, res) => {
    try {
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, image_url, description 
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
        description
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
  
  updateVehicle: async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, is_available, image_url, description 
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
        description
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
  
  // Rental management
  getAllRentals: async (req, res) => {
    try {
      const rentals = await Rental.getAllRentals();
      res.status(200).json(rentals);
    } catch (error) {
      console.error('Error getting all rentals:', error);
      res.status(500).json({ message: 'Server error getting rentals' });
    }
  },
  
  getActiveRentals: async (req, res) => {
    try {
      const rentals = await Rental.getActiveRentals();
      res.status(200).json(rentals);
    } catch (error) {
      console.error('Error getting active rentals:', error);
      res.status(500).json({ message: 'Server error getting active rentals' });
    }
  },
  
  getPendingRentals: async (req, res) => {
    try {
      const rentals = await Rental.getPendingRentals();
      res.status(200).json(rentals);
    } catch (error) {
      console.error('Error getting pending rentals:', error);
      res.status(500).json({ message: 'Server error getting pending rentals' });
    }
  },
  
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
  
  // Payment management
  getAllPayments: async (req, res) => {
    try {
      // This is a placeholder. We would need to add a method in Payment model
      // to get all payments with pagination
      const [rows] = await db.execute(
        `SELECT p.*, r.user_id, u.username, v.make, v.model
         FROM payments p
         JOIN rentals r ON p.rental_id = r.rental_id
         JOIN users u ON r.user_id = u.user_id
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         ORDER BY p.payment_date DESC
         LIMIT 100`
      );
      
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error getting all payments:', error);
      res.status(500).json({ message: 'Server error getting payments' });
    }
  },
  
  getPaymentStatistics: async (req, res) => {
    try {
      const stats = await Payment.getPaymentStatistics();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      res.status(500).json({ message: 'Server error getting payment statistics' });
    }
  },
  
  updatePaymentStatus: async (req, res) => {
    try {
      const paymentId = req.params.id;
      const { status } = req.body;
      
      if (!status || !['successful', 'failed', 'pending', 'refunded'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const success = await Payment.updateStatus(paymentId, status);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update payment status' });
      }
      
      res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Server error updating payment status' });
    }
  },
  
  processRefund: async (req, res) => {
    try {
      const paymentId = req.params.id;
      
      const refundResult = await Payment.processRefund(paymentId);
      
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
  
  // Dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get active rentals count
      const [activeRentals] = await db.execute(
        'SELECT COUNT(*) as count FROM rentals WHERE status = ?',
        ['active']
      );
      
      // Get pending rentals count
      const [pendingRentals] = await db.execute(
        'SELECT COUNT(*) as count FROM rentals WHERE status = ?',
        ['pending']
      );
      
      // Get total vehicles count
      const [totalVehicles] = await db.execute(
        'SELECT COUNT(*) as count, COUNT(CASE WHEN is_available = 1 THEN 1 END) as available FROM vehicles'
      );
      
      // Get total users count
      const [totalUsers] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE is_admin = 0'
      );
      
      // Get recent rentals
      const [recentRentals] = await db.execute(
        `SELECT r.*, u.username, v.make, v.model 
         FROM rentals r
         JOIN users u ON r.user_id = u.user_id
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         ORDER BY r.created_at DESC
         LIMIT 5`
      );
      
      // Get payment statistics
      const paymentStats = await Payment.getPaymentStatistics();
      
      res.status(200).json({
        active_rentals: activeRentals[0].count,
        pending_rentals: pendingRentals[0].count,
        total_vehicles: totalVehicles[0].count,
        available_vehicles: totalVehicles[0].available,
        total_users: totalUsers[0].count,
        recent_rentals: recentRentals,
        payment_stats: paymentStats
      });
    } catch (error) {
      console.error('Error getting dashboard statistics:', error);
      res.status(500).json({ message: 'Server error getting dashboard statistics' });
    }
  }
};

module.exports = adminController;