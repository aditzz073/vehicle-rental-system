const db = require('../config/db');

class Review {
  static async findByVehicleId(vehicleId, limit = 10, offset = 0) {
    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const query = `
        SELECT r.*, u.full_name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const [rows] = await db.execute(query, [parseInt(vehicleId)]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching vehicle reviews:', error);
      throw error;
    }
  }

  static async findById(reviewId) {
    try {
      const query = `
        SELECT r.*, u.full_name as user_name, v.make, v.model
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.id = ?
      `;
      
      const [rows] = await db.execute(query, [parseInt(reviewId)]);
      return rows[0];
    } catch (error) {
      console.error('Error finding review by ID:', error);
      throw error;
    }
  }

  static async create(reviewData) {
    try {
      const {
        user_id, vehicle_id, rental_id, rating, comment
      } = reviewData;

      const [result] = await db.execute(
        `INSERT INTO reviews (user_id, vehicle_id, rental_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          parseInt(user_id),
          parseInt(vehicle_id),
          rental_id ? parseInt(rental_id) : null,
          parseInt(rating),
          comment || null
        ]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  static async update(reviewId, updateData) {
    try {
      const { rating, comment } = updateData;
      
      const [result] = await db.execute(
        `UPDATE reviews 
         SET rating = ?, comment = ?, updated_at = NOW()
         WHERE id = ?`,
        [parseInt(rating), comment || null, parseInt(reviewId)]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  static async delete(reviewId) {
    try {
      const [result] = await db.execute('DELETE FROM reviews WHERE id = ?', [parseInt(reviewId)]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  static async getVehicleRatingSummary(vehicleId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM reviews 
        WHERE vehicle_id = ?
      `;
      
      const [rows] = await db.execute(query, [parseInt(vehicleId)]);
      const summary = rows[0];
      
      return {
        total_reviews: summary.total_reviews || 0,
        average_rating: summary.average_rating ? parseFloat(summary.average_rating).toFixed(1) : 0,
        rating_distribution: {
          five_star: summary.five_star || 0,
          four_star: summary.four_star || 0,
          three_star: summary.three_star || 0,
          two_star: summary.two_star || 0,
          one_star: summary.one_star || 0
        }
      };
    } catch (error) {
      console.error('Error getting vehicle rating summary:', error);
      throw error;
    }
  }

  static async getUserReviews(userId, limit = 10, offset = 0) {
    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const query = `
        SELECT r.*, v.make, v.model, v.year
        FROM reviews r
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const [rows] = await db.execute(query, [parseInt(userId)]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  static async getAllReviews(limit = 50, offset = 0) {
    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const query = `
        SELECT r.*, u.full_name as user_name, v.make, v.model, v.year
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const [rows] = await db.execute(query);
      
      return rows;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = `
        SELECT r.*, u.full_name as user_name, v.make, v.model, v.year
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE 1=1
      `;
      const params = [];

      // Apply filters
      if (filters.rating) {
        query += ' AND r.rating = ?';
        params.push(filters.rating);
      }

      if (filters.min_rating) {
        query += ' AND r.rating >= ?';
        params.push(filters.min_rating);
      }

      if (filters.vehicle_id) {
        query += ' AND r.vehicle_id = ?';
        params.push(filters.vehicle_id);
      }

      if (filters.user_id) {
        query += ' AND r.user_id = ?';
        params.push(filters.user_id);
      }

      query += ` ORDER BY r.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await db.execute(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE 1=1
      `;
      
      // Apply same filters to count query
      if (filters.rating) {
        countQuery += ' AND r.rating = ?';
      }
      if (filters.min_rating) {
        countQuery += ' AND r.rating >= ?';
      }
      if (filters.vehicle_id) {
        countQuery += ' AND r.vehicle_id = ?';
      }
      if (filters.user_id) {
        countQuery += ' AND r.user_id = ?';
      }
      
      const [countRows] = await db.execute(countQuery, params);
      const total = countRows[0].total;

      return {
        reviews: rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      console.error('Error finding all reviews:', error);
      throw error;
    }
  }

  static async getTopRatedVehicles(limit = 10) {
    try {
      const limitNum = parseInt(limit);
      
      const query = `
        SELECT v.*, AVG(r.rating) as avg_rating, COUNT(r.id) as review_count
        FROM vehicles v
        LEFT JOIN reviews r ON v.id = r.vehicle_id
        WHERE v.is_available = TRUE
        GROUP BY v.id
        HAVING review_count > 0
        ORDER BY avg_rating DESC, review_count DESC
        LIMIT ${limitNum}
      `;
      
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting top rated vehicles:', error);
      throw error;
    }
  }

  static async getPlatformStats() {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as platform_rating,
          COUNT(DISTINCT user_id) as unique_reviewers,
          COUNT(DISTINCT vehicle_id) as reviewed_vehicles
        FROM reviews
      `;
      
      const recentQuery = `
        SELECT COUNT(*) as recent_reviews
        FROM reviews
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const [statsRows] = await db.execute(statsQuery);
      const [recentRows] = await db.execute(recentQuery);
      
      return {
        total_reviews: statsRows[0].total_reviews || 0,
        platform_rating: statsRows[0].platform_rating ? parseFloat(statsRows[0].platform_rating).toFixed(1) : 0,
        unique_reviewers: statsRows[0].unique_reviewers || 0,
        reviewed_vehicles: statsRows[0].reviewed_vehicles || 0,
        recent_reviews: recentRows[0].recent_reviews || 0
      };
    } catch (error) {
      console.error('Error getting platform review stats:', error);
      throw error;
    }
  }

  static async checkUserReviewExists(userId, vehicleId) {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM reviews WHERE user_id = ? AND vehicle_id = ?',
        [parseInt(userId), parseInt(vehicleId)]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user review exists:', error);
      throw error;
    }
  }

  static async getReviewsByRating(rating, limit = 20, offset = 0) {
    try {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      
      const query = `
        SELECT r.*, u.full_name as user_name, v.make, v.model
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        WHERE r.rating = ?
        ORDER BY r.created_at DESC
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
      
      const [rows] = await db.execute(query, [parseInt(rating)]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching reviews by rating:', error);
      throw error;
    }
  }

  // Get recent reviews (admin method)
  static async getRecentReviews(limit = 5) {
    try {
      const limitNum = parseInt(limit);
      const query = `
        SELECT r.*, u.full_name as user_name, v.make, v.model
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN vehicles v ON r.vehicle_id = v.id
        ORDER BY r.created_at DESC
        LIMIT ${limitNum}
      `;
      
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting recent reviews:', error);
      throw error;
    }
  }
}

module.exports = Review;