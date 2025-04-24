const db = require('../config/db');

class Review {
  static async findById(reviewId) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, u.username, u.first_name, u.last_name, v.make, v.model 
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         WHERE review_id = ?`,
        [reviewId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error finding review by ID:', error);
      throw error;
    }
  }

  static async getByVehicleId(vehicleId) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, u.username, u.first_name, u.last_name 
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         WHERE r.vehicle_id = ?
         ORDER BY r.created_at DESC`,
        [vehicleId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting reviews by vehicle ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, v.make, v.model, v.image_url 
         FROM reviews r
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting reviews by user ID:', error);
      throw error;
    }
  }

  static async getByRentalId(rentalId) {
    try {
      const [rows] = await db.execute('SELECT * FROM reviews WHERE rental_id = ?', [rentalId]);
      return rows[0]; // Assuming one review per rental
    } catch (error) {
      console.error('Error getting review by rental ID:', error);
      throw error;
    }
  }

  static async create(reviewData) {
    try {
      const { rental_id, user_id, vehicle_id, rating, comment } = reviewData;
      
      const [result] = await db.execute(
        `INSERT INTO reviews 
         (rental_id, user_id, vehicle_id, rating, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [rental_id, user_id, vehicle_id, rating, comment || null]
      );
      
      return { reviewId: result.insertId, ...reviewData };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  static async update(reviewId, reviewData) {
    try {
      const { rating, comment } = reviewData;
      
      const [result] = await db.execute(
        'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?',
        [rating, comment || null, reviewId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  static async delete(reviewId) {
    try {
      const [result] = await db.execute('DELETE FROM reviews WHERE review_id = ?', [reviewId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  static async getVehicleAverageRating(vehicleId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          COUNT(*) as review_count,
          AVG(rating) as average_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
         FROM reviews
         WHERE vehicle_id = ?`,
        [vehicleId]
      );
      
      return rows[0];
    } catch (error) {
      console.error('Error getting vehicle average rating:', error);
      throw error;
    }
  }

  static async getAllReviews(limit = 10, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT r.*, u.username, u.first_name, u.last_name, v.make, v.model 
         FROM reviews r
         JOIN users u ON r.user_id = u.user_id
         JOIN vehicles v ON r.vehicle_id = v.vehicle_id
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error getting all reviews:', error);
      throw error;
    }
  }

  static async checkUserCanReview(userId, rentalId) {
    try {
      // Check if the rental belongs to the user and is completed
      const [rental] = await db.execute(
        `SELECT * FROM rentals 
         WHERE rental_id = ? AND user_id = ? AND status = 'completed'`,
        [rentalId, userId]
      );
      
      if (!rental[0]) {
        return { canReview: false, reason: 'Rental not found or not completed' };
      }
      
      // Check if a review already exists
      const [existingReview] = await db.execute(
        'SELECT * FROM reviews WHERE rental_id = ?',
        [rentalId]
      );
      
      if (existingReview[0]) {
        return { canReview: false, reason: 'Review already exists', reviewId: existingReview[0].review_id };
      }
      
      return { canReview: true };
    } catch (error) {
      console.error('Error checking if user can review:', error);
      throw error;
    }
  }
}

module.exports = Review;