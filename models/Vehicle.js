const db = require('../config/db');

class Vehicle {
  static async findById(vehicleId) {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding vehicle by ID:', error);
      throw error;
    }
  }

  static async getAllVehicles() {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles');
      return rows;
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      throw error;
    }
  }

  static async getAvailableVehicles() {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles WHERE is_available = TRUE');
      return rows;
    } catch (error) {
      console.error('Error getting available vehicles:', error);
      throw error;
    }
  }

  static async create(vehicleData) {
    try {
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, image_url, description 
      } = vehicleData;
      
      const [result] = await db.execute(
        `INSERT INTO vehicles 
         (make, model, year, registration_number, color, mileage, vehicle_type, daily_rate, image_url, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, daily_rate, image_url || null, description || null
        ]
      );
      
      return { vehicleId: result.insertId, ...vehicleData };
    } catch (error) {
      console.error('Error creating new vehicle:', error);
      throw error;
    }
  }

  static async update(vehicleId, vehicleData) {
    try {
      const { 
        make, model, year, registration_number, color, 
        mileage, vehicle_type, daily_rate, is_available, image_url, description 
      } = vehicleData;
      
      const [result] = await db.execute(
        `UPDATE vehicles SET 
         make = ?, model = ?, year = ?, registration_number = ?, color = ?, 
         mileage = ?, vehicle_type = ?, daily_rate = ?, is_available = ?, 
         image_url = ?, description = ?
         WHERE vehicle_id = ?`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, daily_rate, 
          is_available !== undefined ? is_available : true, 
          image_url || null, description || null, vehicleId
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  static async delete(vehicleId) {
    try {
      const [result] = await db.execute('DELETE FROM vehicles WHERE vehicle_id = ?', [vehicleId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  static async updateAvailability(vehicleId, isAvailable) {
    try {
      const [result] = await db.execute(
        'UPDATE vehicles SET is_available = ? WHERE vehicle_id = ?',
        [isAvailable ? 1 : 0, vehicleId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating vehicle availability:', error);
      throw error;
    }
  }

  static async searchVehicles(criteria) {
    try {
      let query = 'SELECT * FROM vehicles WHERE 1=1';
      const params = [];
      
      if (criteria.make) {
        query += ' AND make LIKE ?';
        params.push(`%${criteria.make}%`);
      }
      
      if (criteria.model) {
        query += ' AND model LIKE ?';
        params.push(`%${criteria.model}%`);
      }
      
      if (criteria.vehicle_type) {
        query += ' AND vehicle_type = ?';
        params.push(criteria.vehicle_type);
      }
      
      if (criteria.year_min) {
        query += ' AND year >= ?';
        params.push(criteria.year_min);
      }
      
      if (criteria.year_max) {
        query += ' AND year <= ?';
        params.push(criteria.year_max);
      }
      
      if (criteria.daily_rate_min) {
        query += ' AND daily_rate >= ?';
        params.push(criteria.daily_rate_min);
      }
      
      if (criteria.daily_rate_max) {
        query += ' AND daily_rate <= ?';
        params.push(criteria.daily_rate_max);
      }
      
      if (criteria.available !== undefined) {
        query += ' AND is_available = ?';
        params.push(criteria.available ? 1 : 0);
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  static async getVehicleTypes() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT vehicle_type FROM vehicles');
      return rows.map(row => row.vehicle_type);
    } catch (error) {
      console.error('Error getting vehicle types:', error);
      throw error;
    }
  }

  static async checkAvailabilityForDateRange(vehicleId, startDate, endDate) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as conflict_count FROM rentals 
         WHERE vehicle_id = ? 
         AND status NOT IN ('cancelled')
         AND ((start_date <= ? AND end_date >= ?) OR 
              (start_date >= ? AND start_date <= ?))`,
        [vehicleId, endDate, startDate, startDate, endDate]
      );
      
      return rows[0].conflict_count === 0;
    } catch (error) {
      console.error('Error checking vehicle availability for date range:', error);
      throw error;
    }
  }
}

module.exports = Vehicle;