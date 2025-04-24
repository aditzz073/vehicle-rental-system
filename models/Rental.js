const db = require('../config/db');

class Rental {
  static async findById(rentalId) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.registration_number, u.first_name, u.last_name, u.email 
         FROM rentals r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         JOIN users u ON r.user_id = u.user_id
         WHERE rental_id = ?`,
        [rentalId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding rental by ID:', error);
      throw error;
    }
  }

  static async getUserRentals(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.image_url, v.registration_number 
         FROM rentals r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user rentals:', error);
      throw error;
    }
  }

  static async getAllRentals() {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.registration_number, u.first_name, u.last_name, u.email 
         FROM rentals r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         JOIN users u ON r.user_id = u.user_id
         ORDER BY r.created_at DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error getting all rentals:', error);
      throw error;
    }
  }

  static async create(rentalData) {
    try {
      const { user_id, vehicle_id, start_date, end_date, total_cost } = rentalData;
      
      const [result] = await db.execute(
        `INSERT INTO rentals 
         (user_id, vehicle_id, start_date, end_date, total_cost) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, vehicle_id, start_date, end_date, total_cost]
      );
      
      // Update vehicle availability
      await db.execute(
        'UPDATE vehicles SET is_available = FALSE WHERE vehicle_id = ?',
        [vehicle_id]
      );
      
      return { rentalId: result.insertId, ...rentalData };
    } catch (error) {
      console.error('Error creating rental:', error);
      throw error;
    }
  }

  static async updateStatus(rentalId, status) {
    try {
      const [result] = await db.execute(
        'UPDATE rentals SET status = ? WHERE rental_id = ?',
        [status, rentalId]
      );
      
      // If rental is completed or cancelled, make vehicle available again
      if (status === 'completed' || status === 'cancelled') {
        const [rental] = await db.execute(
          'SELECT vehicle_id FROM rentals WHERE rental_id = ?',
          [rentalId]
        );
        
        if (rental[0]) {
          await db.execute(
            'UPDATE vehicles SET is_available = TRUE WHERE vehicle_id = ?',
            [rental[0].vehicle_id]
          );
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating rental status:', error);
      throw error;
    }
  }

  static async updatePaymentStatus(rentalId, paymentStatus) {
    try {
      const [result] = await db.execute(
        'UPDATE rentals SET payment_status = ? WHERE rental_id = ?',
        [paymentStatus, rentalId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating rental payment status:', error);
      throw error;
    }
  }

  static async getActiveRentals() {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.registration_number, u.first_name, u.last_name, u.email 
         FROM rentals r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         JOIN users u ON r.user_id = u.user_id
         WHERE r.status = 'active'
         ORDER BY r.start_date`
      );
      return rows;
    } catch (error) {
      console.error('Error getting active rentals:', error);
      throw error;
    }
  }

  static async getPendingRentals() {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.registration_number, u.first_name, u.last_name, u.email 
         FROM rentals r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         JOIN users u ON r.user_id = u.user_id
         WHERE r.status = 'pending'
         ORDER BY r.created_at`
      );
      return rows;
    } catch (error) {
      console.error('Error getting pending rentals:', error);
      throw error;
    }
  }

  static async calculateRentalCost(vehicleId, startDate, endDate) {
    try {
      // Convert dates to Date objects if they are strings
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Calculate number of days
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Get vehicle daily rate
      const [vehicle] = await db.execute(
        'SELECT daily_rate FROM vehicles WHERE vehicle_id = ?',
        [vehicleId]
      );
      
      if (!vehicle[0]) {
        throw new Error('Vehicle not found');
      }
      
      const dailyRate = vehicle[0].daily_rate;
      const cost = dailyRate * diffDays;
      
      return { days: diffDays, dailyRate, totalCost: cost };
    } catch (error) {
      console.error('Error calculating rental cost:', error);
      throw error;
    }
  }

  static async searchRentals(criteria) {
    try {
      let query = `
        SELECT r.*, v.make, v.model, v.registration_number, u.first_name, u.last_name, u.email 
        FROM rentals r
        JOIN vehicles v ON r.vehicle_id = v.vehicle_id
        JOIN users u ON r.user_id = u.user_id
        WHERE 1=1
      `;
      const params = [];
      
      if (criteria.status) {
        query += ' AND r.status = ?';
        params.push(criteria.status);
      }
      
      if (criteria.payment_status) {
        query += ' AND r.payment_status = ?';
        params.push(criteria.payment_status);
      }
      
      if (criteria.start_date_from) {
        query += ' AND r.start_date >= ?';
        params.push(criteria.start_date_from);
      }
      
      if (criteria.start_date_to) {
        query += ' AND r.start_date <= ?';
        params.push(criteria.start_date_to);
      }
      
      if (criteria.end_date_from) {
        query += ' AND r.end_date >= ?';
        params.push(criteria.end_date_from);
      }
      
      if (criteria.end_date_to) {
        query += ' AND r.end_date <= ?';
        params.push(criteria.end_date_to);
      }
      
      if (criteria.vehicle_id) {
        query += ' AND r.vehicle_id = ?';
        params.push(criteria.vehicle_id);
      }
      
      if (criteria.user_id) {
        query += ' AND r.user_id = ?';
        params.push(criteria.user_id);
      }
      
      query += ' ORDER BY r.created_at DESC';
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error searching rentals:', error);
      throw error;
    }
  }
}

module.exports = Rental;