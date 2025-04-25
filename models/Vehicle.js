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
        mileage, vehicle_type, category, daily_rate, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude
      } = vehicleData;
      
      const [result] = await db.execute(
        `INSERT INTO vehicles 
         (make, model, year, registration_number, color, mileage, vehicle_type, 
         category, daily_rate, image_url, description, 
         location_city, location_state, location_zip, location_address, 
         location_latitude, location_longitude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, category || 'Standard', daily_rate, 
          image_url || null, description || null,
          location_city || null, location_state || null, location_zip || null, 
          location_address || null, location_latitude || null, location_longitude || null
        ]
      );
      
      // If pricing tiers are provided, add them
      if (vehicleData.pricing_tiers && vehicleData.pricing_tiers.length > 0) {
        await Promise.all(vehicleData.pricing_tiers.map(tier => {
          return db.execute(
            `INSERT INTO vehicle_pricing_tiers 
            (vehicle_id, min_days, max_days, rate_multiplier) 
            VALUES (?, ?, ?, ?)`,
            [result.insertId, tier.min_days, tier.max_days, tier.rate_multiplier]
          );
        }));
      }
      
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
        mileage, vehicle_type, category, daily_rate, is_available, image_url, description,
        location_city, location_state, location_zip, location_address,
        location_latitude, location_longitude
      } = vehicleData;
      
      const [result] = await db.execute(
        `UPDATE vehicles SET 
         make = ?, model = ?, year = ?, registration_number = ?, color = ?, 
         mileage = ?, vehicle_type = ?, category = ?, daily_rate = ?, is_available = ?, 
         image_url = ?, description = ?,
         location_city = ?, location_state = ?, location_zip = ?, location_address = ?,
         location_latitude = ?, location_longitude = ?
         WHERE vehicle_id = ?`,
        [
          make, model, year, registration_number, color || null, 
          mileage || null, vehicle_type, category || 'Standard', daily_rate, 
          is_available !== undefined ? is_available : true, 
          image_url || null, description || null,
          location_city || null, location_state || null, location_zip || null, 
          location_address || null, location_latitude || null, location_longitude || null,
          vehicleId
        ]
      );
      
      // Update pricing tiers if provided
      if (vehicleData.pricing_tiers && vehicleData.pricing_tiers.length > 0) {
        // Clear existing tiers first
        await db.execute('DELETE FROM vehicle_pricing_tiers WHERE vehicle_id = ?', [vehicleId]);
        
        // Add new tiers
        await Promise.all(vehicleData.pricing_tiers.map(tier => {
          return db.execute(
            `INSERT INTO vehicle_pricing_tiers 
            (vehicle_id, min_days, max_days, rate_multiplier) 
            VALUES (?, ?, ?, ?)`,
            [vehicleId, tier.min_days, tier.max_days, tier.rate_multiplier]
          );
        }));
      }
      
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
      
      // Handle generic search parameter (search across make, model, and description)
      if (criteria.search) {
        query += ' AND (make LIKE ? OR model LIKE ? OR description LIKE ?)';
        params.push(`%${criteria.search}%`, `%${criteria.search}%`, `%${criteria.search}%`);
      } else {
        // Handle specific field searches if no generic search is provided
        if (criteria.make) {
          query += ' AND make LIKE ?';
          params.push(`%${criteria.make}%`);
        }
        
        if (criteria.model) {
          query += ' AND model LIKE ?';
          params.push(`%${criteria.model}%`);
        }
      }
      
      if (criteria.vehicle_type) {
        query += ' AND vehicle_type = ?';
        params.push(criteria.vehicle_type);
      }
      
      if (criteria.category) {
        query += ' AND category = ?';
        params.push(criteria.category);
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
      if (criteria.location) {
        query += ' AND (location_city LIKE ? OR location_state LIKE ? OR location_zip LIKE ?)';
        params.push(`%${criteria.location}%`, `%${criteria.location}%`, `%${criteria.location}%`);
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
      
      // Check availability for date range
      if (criteria.start_date && criteria.end_date) {
        query += ` AND vehicle_id NOT IN (
          SELECT vehicle_id FROM rentals 
          WHERE status NOT IN ('cancelled')
          AND ((start_date <= ? AND end_date >= ?) OR 
              (start_date >= ? AND start_date <= ?))
        )`;
        params.push(
          criteria.end_date,
          criteria.start_date,
          criteria.start_date,
          criteria.end_date
        );
      }
      
      // Add sorting options
      if (criteria.sort) {
        switch (criteria.sort) {
          case 'price_asc':
            query += ' ORDER BY daily_rate ASC';
            break;
          case 'price_desc':
            query += ' ORDER BY daily_rate DESC';
            break;
          case 'name_asc':
            query += ' ORDER BY make ASC, model ASC';
            break;
          case 'name_desc':
            query += ' ORDER BY make DESC, model DESC';
            break;
          case 'year_desc':
            query += ' ORDER BY year DESC';
            break;
          case 'year_asc':
            query += ' ORDER BY year ASC';
            break;
          default:
            query += ' ORDER BY daily_rate ASC';
        }
      } else {
        query += ' ORDER BY daily_rate ASC';
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
  
  static async getVehicleCategories() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT category FROM vehicles');
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting vehicle categories:', error);
      throw error;
    }
  }

  static async getPricingTiers(vehicleId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vehicle_pricing_tiers WHERE vehicle_id = ? ORDER BY min_days ASC',
        [vehicleId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting pricing tiers:', error);
      throw error;
    }
  }
  
  static async calculateRentalCost(vehicleId, startDate, endDate) {
    try {
      // Get vehicle basic info
      const [vehicleRows] = await db.execute(
        'SELECT daily_rate FROM vehicles WHERE vehicle_id = ?',
        [vehicleId]
      );
      
      if (!vehicleRows.length) {
        throw new Error('Vehicle not found');
      }
      
      const vehicle = vehicleRows[0];
      
      // Calculate rental duration in days
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
      
      // Get applicable pricing tier
      const [tierRows] = await db.execute(
        `SELECT rate_multiplier 
         FROM vehicle_pricing_tiers 
         WHERE vehicle_id = ? 
         AND ? BETWEEN min_days AND max_days 
         ORDER BY min_days ASC 
         LIMIT 1`,
        [vehicleId, durationDays]
      );
      
      // Default to standard rate if no tier applies
      const rateMultiplier = tierRows.length ? tierRows[0].rate_multiplier : 1.0;
      
      // Calculate total cost
      const dailyRate = parseFloat(vehicle.daily_rate);
      const totalCost = dailyRate * durationDays * rateMultiplier;
      
      return {
        vehicleId,
        dailyRate,
        duration: durationDays,
        rateMultiplier,
        baseTotal: dailyRate * durationDays,
        discountedTotal: totalCost,
        discountAmount: dailyRate * durationDays - totalCost,
        discountPercentage: ((1 - rateMultiplier) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error calculating rental cost:', error);
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