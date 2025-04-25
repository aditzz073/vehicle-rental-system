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
        mileage, vehicle_type, daily_rate, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude
      } = vehicleData;
      
      const [result] = await db.execute(
        `INSERT INTO vehicles 
         (make, model, year, registration_number, color, mileage, vehicle_type, 
         daily_rate, image_url, description, 
         location_city, location_state, location_zip, location_address, 
         location_latitude, location_longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, daily_rate, image_url || null, description || null,
          location_city || null, location_state || null, location_zip || null, 
          location_address || null, location_latitude || null, location_longitude || null
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
        mileage, vehicle_type, daily_rate, is_available, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude
      } = vehicleData;
      
      const [result] = await db.execute(
        `UPDATE vehicles SET 
         make = ?, model = ?, year = ?, registration_number = ?, color = ?, 
         mileage = ?, vehicle_type = ?, daily_rate = ?, is_available = ?, 
         image_url = ?, description = ?,
         location_city = ?, location_state = ?, location_zip = ?, location_address = ?,
         location_latitude = ?, location_longitude = ?
         WHERE vehicle_id = ?`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, daily_rate, 
          is_available !== undefined ? is_available : true, 
          image_url || null, description || null,
          location_city || null, location_state || null, location_zip || null, 
          location_address || null, location_latitude || null, location_longitude || null,
          vehicleId
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
      
      // Location-based search criteria
      if (criteria.location_city) {
        query += ' AND location_city = ?';
        params.push(criteria.location_city);
      }
      
      if (criteria.location_state) {
        query += ' AND location_state = ?';
        params.push(criteria.location_state);
      }
      
      if (criteria.location_zip) {
        query += ' AND location_zip = ?';
        params.push(criteria.location_zip);
      }
      
      // Search by proximity if lat/long and radius provided
      if (criteria.latitude && criteria.longitude && criteria.radius) {
        // Haversine formula to calculate distance in kilometers
        query += ` AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(location_latitude)) * 
            cos(radians(location_longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(location_latitude))
          ) <= ?
        )`;
        params.push(
          parseFloat(criteria.latitude),
          parseFloat(criteria.longitude),
          parseFloat(criteria.latitude),
          parseFloat(criteria.radius)
        );
      }
      
      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  static async searchVehiclesByLocation(location, radius = 10) {
    try {
      // You can implement either a simple search by city/state/zip
      // or a more advanced proximity search using geocoordinates
      
      // Simple location search
      if (typeof location === 'string') {
        const [rows] = await db.execute(
          `SELECT * FROM vehicles WHERE 
           location_city LIKE ? OR 
           location_state LIKE ? OR 
           location_zip LIKE ?`,
          [`%${location}%`, `%${location}%`, `%${location}%`]
        );
        return rows;
      }
      
      // Proximity search if coordinates provided
      if (location.latitude && location.longitude) {
        const [rows] = await db.execute(
          `SELECT *, (
            6371 * acos(
              cos(radians(?)) * cos(radians(location_latitude)) * 
              cos(radians(location_longitude) - radians(?)) + 
              sin(radians(?)) * sin(radians(location_latitude))
            )
          ) AS distance 
          FROM vehicles 
          HAVING distance <= ? 
          ORDER BY distance`,
          [
            parseFloat(location.latitude),
            parseFloat(location.longitude),
            parseFloat(location.latitude),
            parseFloat(radius)
          ]
        );
        return rows;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching vehicles by location:', error);
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
  
  static async getAvailableCities() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT location_city FROM vehicles WHERE location_city IS NOT NULL'
      );
      return rows.map(row => row.location_city);
    } catch (error) {
      console.error('Error getting available cities:', error);
      throw error;
    }
  }

  static async getAvailableStates() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT location_state FROM vehicles WHERE location_state IS NOT NULL'
      );
      return rows.map(row => row.location_state);
    } catch (error) {
      console.error('Error getting available states:', error);
      throw error;
    }
  }
}

module.exports = Vehicle;