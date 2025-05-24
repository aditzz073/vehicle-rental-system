const db = require('../config/db');

class Rental {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.vehicle_id = data.vehicle_id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.pickup_location = data.pickup_location;
    this.dropoff_location = data.dropoff_location;
    this.total_cost = data.total_cost;
    this.status = data.status;
    this.payment_status = data.payment_status;
    this.special_requests = data.special_requests;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new rental
  static async create(rentalData) {
    try {
      const {
        user_id,
        vehicle_id,
        start_date,
        end_date,
        pickup_location,
        dropoff_location,
        total_cost,
        special_requests
      } = rentalData;

      const query = `
        INSERT INTO rentals 
        (user_id, vehicle_id, start_date, end_date, pickup_location, dropoff_location, total_cost, special_requests, status, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
      `;

      const [result] = await db.execute(query, [
        user_id, vehicle_id, start_date, end_date, 
        pickup_location, dropoff_location, total_cost, special_requests
      ]);

      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating rental: ${error.message}`);
    }
  }

  // Find rental by ID
  static async findById(id) {
    try {
      const query = `
        SELECT r.*, u.full_name as user_name, u.email as user_email,
               v.make, v.model, v.year, v.license_plate
        FROM rentals r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows.length > 0 ? new Rental(rows[0]) : null;
    } catch (error) {
      throw new Error(`Error finding rental: ${error.message}`);
    }
  }

  // Get all rentals with pagination
  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = `
        SELECT r.*, u.full_name as user_name, u.email as user_email,
               v.make, v.model, v.year, v.license_plate
        FROM rentals r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters
      if (filters.status) {
        query += ' AND r.status = ?';
        params.push(filters.status);
      }
      if (filters.payment_status) {
        query += ' AND r.payment_status = ?';
        params.push(filters.payment_status);
      }
      if (filters.user_id) {
        query += ' AND r.user_id = ?';
        params.push(filters.user_id);
      }
      if (filters.vehicle_id) {
        query += ' AND r.vehicle_id = ?';
        params.push(filters.vehicle_id);
      }

      query += ` ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await db.execute(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM rentals r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE 1=1
      `;
      
      // Apply same filters to count query
      if (filters.status) {
        countQuery += ' AND r.status = ?';
      }
      if (filters.payment_status) {
        countQuery += ' AND r.payment_status = ?';
      }
      if (filters.user_id) {
        countQuery += ' AND r.user_id = ?';
      }
      if (filters.vehicle_id) {
        countQuery += ' AND r.vehicle_id = ?';
      }
      
      const [countRows] = await db.execute(countQuery, params);
      const total = countRows[0].total;

      return {
        rentals: rows.map(row => new Rental(row)),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      throw new Error(`Error fetching rentals: ${error.message}`);
    }
  }

  // Get rentals by user ID
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      const query = `
        SELECT r.*, v.make, v.model, v.year, v.license_plate, v.image_url
        FROM rentals r
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const [rows] = await db.execute(query, [parseInt(userId)]);
      return rows.map(row => new Rental(row));
    } catch (error) {
      throw new Error(`Error fetching user rentals: ${error.message}`);
    }
  }

  // Update rental status
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const query = 'UPDATE rentals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await db.execute(query, [status, id]);
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating rental status: ${error.message}`);
    }
  }

  // Update payment status
  static async updatePaymentStatus(id, paymentStatus) {
    try {
      const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error('Invalid payment status');
      }

      const query = 'UPDATE rentals SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await db.execute(query, [paymentStatus, id]);
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  // Check vehicle availability for given dates
  static async checkAvailability(vehicleId, startDate, endDate, excludeRentalId = null) {
    try {
      let query = `
        SELECT COUNT(*) as conflict_count
        FROM rentals 
        WHERE vehicle_id = ? 
        AND status IN ('confirmed', 'active')
        AND (
          (start_date <= ? AND end_date >= ?) OR
          (start_date <= ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `;
      const params = [vehicleId, startDate, startDate, endDate, endDate, startDate, endDate];

      if (excludeRentalId) {
        query += ' AND id != ?';
        params.push(excludeRentalId);
      }

      const [rows] = await db.execute(query, params);
      return rows[0].conflict_count === 0;
    } catch (error) {
      throw new Error(`Error checking availability: ${error.message}`);
    }
  }

  // Get rental statistics
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_rentals,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_rentals,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_rentals,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rentals,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rentals,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_rentals,
          SUM(CASE WHEN status = 'completed' THEN total_cost ELSE 0 END) as total_revenue,
          AVG(CASE WHEN status = 'completed' THEN total_cost ELSE NULL END) as avg_rental_value
        FROM rentals
      `;

      const [rows] = await db.execute(query);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching rental stats: ${error.message}`);
    }
  }

  // Get upcoming rentals (starting in next 24 hours)
  static async getUpcomingRentals() {
    try {
      const query = `
        SELECT r.*, u.full_name as user_name, u.email as user_email, u.phone,
               v.make, v.model, v.year, v.license_plate
        FROM rentals r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'confirmed'
        AND r.start_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
        ORDER BY r.start_date ASC
      `;

      const [rows] = await db.execute(query);
      return rows.map(row => new Rental(row));
    } catch (error) {
      throw new Error(`Error fetching upcoming rentals: ${error.message}`);
    }
  }

  // Get overdue rentals
  static async getOverdueRentals() {
    try {
      const query = `
        SELECT r.*, u.full_name as user_name, u.email as user_email, u.phone,
               v.make, v.model, v.year, v.license_plate
        FROM rentals r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.status = 'active'
        AND r.end_date < NOW()
        ORDER BY r.end_date ASC
      `;

      const [rows] = await db.execute(query);
      return rows.map(row => new Rental(row));
    } catch (error) {
      throw new Error(`Error fetching overdue rentals: ${error.message}`);
    }
  }

  // Cancel rental
  static async cancel(id, reason = null) {
    try {
      const rental = await this.findById(id);
      if (!rental) {
        throw new Error('Rental not found');
      }

      if (rental.status === 'active' || rental.status === 'completed') {
        throw new Error('Cannot cancel active or completed rental');
      }

      const query = `
        UPDATE rentals 
        SET status = 'cancelled', 
            special_requests = CONCAT(IFNULL(special_requests, ''), ' | Cancelled: ', ?),
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      await db.execute(query, [reason || 'User requested cancellation', id]);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error cancelling rental: ${error.message}`);
    }
  }

  // Get rental duration in days
  getDuration() {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  // Check if rental is active
  isActive() {
    const now = new Date();
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    return this.status === 'active' && now >= start && now <= end;
  }

  // Check if rental is overdue
  isOverdue() {
    const now = new Date();
    const end = new Date(this.end_date);
    return this.status === 'active' && now > end;
  }
}

module.exports = Rental;
