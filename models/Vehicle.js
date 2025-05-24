const db = require('../config/db');

class Vehicle {
  static async findById(vehicleId) {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding vehicle by ID:', error);
      throw error;
    }
  }

  static async getAllVehicles() {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      throw error;
    }
  }

  static async getAvailableVehicles() {
    try {
      const [rows] = await db.execute('SELECT * FROM vehicles WHERE is_available = TRUE ORDER BY rating DESC, created_at DESC');
      return rows;
    } catch (error) {
      console.error('Error getting available vehicles:', error);
      throw error;
    }
  }

  static async getFeaturedVehicles(limit = 6) {
    try {
      const limitNum = parseInt(limit);
      const [rows] = await db.execute(
        `SELECT * FROM vehicles WHERE is_available = TRUE ORDER BY rating DESC, total_reviews DESC LIMIT ${limitNum}`
      );
      return rows;
    } catch (error) {
      console.error('Error getting featured vehicles:', error);
      throw error;
    }
  }

  static async create(vehicleData) {
    try {
      const {
        make, model, year, license_plate, color, mileage, vehicle_type,
        category, daily_rate, image_url, description, features, fuel_type,
        transmission, seating_capacity, location
      } = vehicleData;

      const [result] = await db.execute(
        `INSERT INTO vehicles 
         (make, model, year, license_plate, color, mileage, vehicle_type,
         category, daily_rate, image_url, description, features, fuel_type,
         transmission, seating_capacity, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          make, model, year, license_plate, color || null, mileage || null,
          vehicle_type, category || 'Standard', daily_rate, image_url || null,
          description || null, JSON.stringify(features || {}), fuel_type || 'Petrol',
          transmission || 'Manual', seating_capacity || 5, location || null
        ]
      );

      return { vehicleId: result.insertId, ...vehicleData };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  static async update(vehicleId, vehicleData) {
    try {
      const {
        make, model, year, license_plate, color, mileage, vehicle_type,
        category, daily_rate, is_available, image_url, description, features,
        fuel_type, transmission, seating_capacity, location
      } = vehicleData;

      const [result] = await db.execute(
        `UPDATE vehicles SET
         make = ?, model = ?, year = ?, license_plate = ?, color = ?,
         mileage = ?, vehicle_type = ?, category = ?, daily_rate = ?, is_available = ?,
         image_url = ?, description = ?, features = ?, fuel_type = ?, transmission = ?,
         seating_capacity = ?, location = ?
         WHERE id = ?`,
        [
          make, model, year, license_plate, color || null, mileage || null,
          vehicle_type, category || 'Standard', daily_rate,
          is_available !== undefined ? is_available : true, image_url || null,
          description || null, JSON.stringify(features || {}), fuel_type || 'Petrol',
          transmission || 'Manual', seating_capacity || 5, location || null, vehicleId
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
      const [result] = await db.execute('DELETE FROM vehicles WHERE id = ?', [vehicleId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  static async updateAvailability(vehicleId, isAvailable) {
    try {
      const [result] = await db.execute(
        'UPDATE vehicles SET is_available = ? WHERE id = ?',
        [isAvailable, vehicleId]
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

      // Basic search filters
      if (criteria.search) {
        query += ' AND (make LIKE ? OR model LIKE ? OR description LIKE ?)';
        params.push(`%${criteria.search}%`, `%${criteria.search}%`, `%${criteria.search}%`);
      }

      if (criteria.vehicle_type) {
        query += ' AND vehicle_type = ?';
        params.push(criteria.vehicle_type);
      }

      if (criteria.category) {
        query += ' AND category = ?';
        params.push(criteria.category);
      }

      if (criteria.fuel_type) {
        query += ' AND fuel_type = ?';
        params.push(criteria.fuel_type);
      }

      if (criteria.transmission) {
        query += ' AND transmission = ?';
        params.push(criteria.transmission);
      }

      // Price range filters
      if (criteria.daily_rate_min) {
        query += ' AND daily_rate >= ?';
        params.push(parseFloat(criteria.daily_rate_min));
      }

      if (criteria.daily_rate_max) {
        query += ' AND daily_rate <= ?';
        params.push(parseFloat(criteria.daily_rate_max));
      }

      // Year filters
      if (criteria.year_min) {
        query += ' AND year >= ?';
        params.push(parseInt(criteria.year_min));
      }

      if (criteria.year_max) {
        query += ' AND year <= ?';
        params.push(parseInt(criteria.year_max));
      }

      // Location filters
      if (criteria.location) {
        query += ' AND location LIKE ?';
        params.push(`%${criteria.location}%`);
      }

      // Availability filter (default to available only)
      if (criteria.available !== 'false') {
        query += ' AND is_available = TRUE';
      }

      // Date availability check
      if (criteria.start_date && criteria.end_date) {
        query += ` AND id NOT IN (
         SELECT vehicle_id FROM rentals 
         WHERE status IN ('confirmed', 'active')
         AND NOT (end_date < ? OR start_date > ?)
        )`;
        params.push(criteria.start_date, criteria.end_date);
      }

      // Sorting
      const sortOptions = {
        'price_asc': 'daily_rate ASC',
        'price_desc': 'daily_rate DESC',
        'rating_desc': 'rating DESC, total_reviews DESC',
        'year_desc': 'year DESC',
        'newest': 'created_at DESC'
      };

      const sortBy = sortOptions[criteria.sort] || 'rating DESC, total_reviews DESC';
      query += ` ORDER BY ${sortBy}`;

      // Pagination
      const page = parseInt(criteria.page) || 1;
      const limit = parseInt(criteria.limit) || 10;
      const offset = (page - 1) * limit;

      query += ` LIMIT ${limit} OFFSET ${offset}`;
      // Don't add limit and offset to params anymore

      const [rows] = await db.execute(query, params);

      // Get total count for pagination
      let countQuery = query.replace(/SELECT \* FROM/, 'SELECT COUNT(*) as total FROM');
      countQuery = countQuery.replace(/ORDER BY.*/, '').replace(/LIMIT.*/, '');
      const countParams = params; // Use all params since we removed limit/offset

      const [countResult] = await db.execute(countQuery, countParams);
      const total = countResult[0].total;

      return {
        vehicles: rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = 'SELECT * FROM vehicles';
      let conditions = [];
      let params = [];

      // Apply filters
      if (filters.is_available !== undefined) {
        conditions.push('is_available = ?');
        params.push(filters.is_available);
      }

      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters.vehicle_type) {
        conditions.push('vehicle_type = ?');
        params.push(filters.vehicle_type);
      }

      if (filters.search) {
        conditions.push('(make LIKE ? OR model LIKE ? OR description LIKE ?)');
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await db.execute(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM vehicles';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      const [countRows] = await db.execute(countQuery, params);
      const total = countRows[0].total;

      return {
        vehicles: rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      console.error('Error finding all vehicles:', error);
      throw error;
    }
  }

  static async getVehicleTypes() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT vehicle_type FROM vehicles ORDER BY vehicle_type');
      return rows.map(row => row.vehicle_type);
    } catch (error) {
      console.error('Error getting vehicle types:', error);
      throw error;
    }
  }

  static async getVehicleCategories() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT category FROM vehicles ORDER BY category');
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting vehicle categories:', error);
      throw error;
    }
  }

  static async getFuelTypes() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT fuel_type FROM vehicles ORDER BY fuel_type');
      return rows.map(row => row.fuel_type);
    } catch (error) {
      console.error('Error getting fuel types:', error);
      throw error;
    }
  }

  static async getAvailableCities() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT location FROM vehicles WHERE location IS NOT NULL ORDER BY location');
      return rows.map(row => row.location);
    } catch (error) {
      console.error('Error getting available cities:', error);
      throw error;
    }
  }

  static async checkAvailabilityForDateRange(vehicleId, startDate, endDate) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as conflicts FROM rentals 
         WHERE vehicle_id = ? AND status IN ('confirmed', 'active')
         AND NOT (end_date < ? OR start_date > ?)`,
        [vehicleId, startDate, endDate]
      );

      return rows[0].conflicts === 0;
    } catch (error) {
      console.error('Error checking vehicle availability:', error);
      throw error;
    }
  }

  static async calculateRentalCost(vehicleId, startDate, endDate) {
    try {
      const vehicle = await this.findById(vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (days <= 0) throw new Error('Invalid date range');

      // Simple pricing calculation without tiers for now
      let rateMultiplier = 1.0;

      // Apply discounts for longer rentals
      if (days >= 7) {
        rateMultiplier = 0.85; // 15% discount for weekly rentals
      } else if (days >= 3) {
        rateMultiplier = 0.95; // 5% discount for 3+ day rentals
      }

      const baseRate = vehicle.daily_rate;
      const adjustedRate = baseRate * rateMultiplier;
      const subtotal = adjustedRate * days;
      const taxRate = 0.18; // 18% GST
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      return {
        days,
        baseRate,
        rateMultiplier,
        adjustedRate,
        subtotal,
        taxRate,
        taxAmount,
        total
      };
    } catch (error) {
      console.error('Error calculating rental cost:', error);
      throw error;
    }
  }

  // Additional methods for controller compatibility
  static async getCategories() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT category FROM vehicles WHERE category IS NOT NULL ORDER BY category');
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  static async getLocations() {
    try {
      const [rows] = await db.execute('SELECT DISTINCT location FROM vehicles WHERE location IS NOT NULL ORDER BY location');
      return rows.map(row => row.location);
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  static async getFeatured(limit = 6) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vehicles WHERE is_available = TRUE ORDER BY rating DESC, total_reviews DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting featured vehicles:', error);
      throw error;
    }
  }

  static async getLuxury(limit = 8) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vehicles WHERE category = "Luxury" AND is_available = TRUE ORDER BY daily_rate DESC LIMIT ?',
        [limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting luxury vehicles:', error);
      throw error;
    }
  }

  static async checkAvailability(vehicleId, startDate, endDate) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) as conflicts FROM rentals 
         WHERE vehicle_id = ? AND status IN ('confirmed', 'active')
         AND NOT (end_date < ? OR start_date > ?)`,
        [vehicleId, startDate, endDate]
      );

      return rows[0].conflicts === 0;
    } catch (error) {
      console.error('Error checking vehicle availability:', error);
      throw error;
    }
  }

  static async getPriceRange() {
    try {
      const [rows] = await db.execute('SELECT MIN(daily_rate) as min_price, MAX(daily_rate) as max_price FROM vehicles WHERE is_available = TRUE');
      return rows[0];
    } catch (error) {
      console.error('Error getting price range:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total_vehicles,
          COUNT(CASE WHEN is_available = TRUE THEN 1 END) as available_vehicles,
          AVG(daily_rate) as average_rate,
          COUNT(DISTINCT category) as total_categories
        FROM vehicles
      `);
      return rows[0];
    } catch (error) {
      console.error('Error getting vehicle stats:', error);
      throw error;
    }
  }

  static async findSimilar(vehicleId, category, limit = 4) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vehicles WHERE category = ? AND id != ? AND is_available = TRUE ORDER BY rating DESC LIMIT ?',
        [category, vehicleId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error finding similar vehicles:', error);
      throw error;
    }
  }

  static async findByCategory(category, limit = 12, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM vehicles WHERE category = ? AND is_available = TRUE ORDER BY rating DESC LIMIT ? OFFSET ?',
        [category, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error finding vehicles by category:', error);
      throw error;
    }
  }
}

module.exports = Vehicle;