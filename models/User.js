const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { username, email, password, first_name, last_name, phone, address } = userData;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password, first_name, last_name, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, first_name, last_name, phone || null, address || null]
      );
      
      return { userId: result.insertId, ...userData, password: undefined };
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }

  static async update(userId, userData) {
    try {
      const { first_name, last_name, phone, address } = userData;
      
      const [result] = await db.execute(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE user_id = ?',
        [first_name, last_name, phone || null, address || null, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [hashedPassword, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const [rows] = await db.execute('SELECT user_id, username, email, first_name, last_name, phone, address, is_admin, created_at FROM users');
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async login(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) return null;
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return null;
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  static async delete(userId) {
    try {
      const [result] = await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async toggleAdminStatus(userId, isAdmin) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_admin = ? WHERE user_id = ?',
        [isAdmin ? 1 : 0, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling admin status:', error);
      throw error;
    }
  }

  static async activateAccount(userId) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_active = 1 WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error activating account:', error);
      throw error;
    }
  }

  static async deactivateAccount(userId) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET is_active = 0 WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  }

  static async getUserBookings(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT b.*, v.make, v.model 
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.vehicle_id
         WHERE b.user_id = ?
         ORDER BY b.booking_date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  static async searchUsers(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await db.execute(
        `SELECT user_id, username, email, first_name, last_name 
         FROM users 
         WHERE username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern]
      );
      return rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async validateResetToken(token) {
    try {
      const [rows] = await db.execute(
        `SELECT user_id FROM password_reset_tokens 
         WHERE token = ? AND expires_at > NOW()`,
        [token]
      );
      return rows[0] ? rows[0].user_id : null;
    } catch (error) {
      console.error('Error validating reset token:', error);
      throw error;
    }
  }

  static async createResetToken(userId) {
    try {
      // Generate a random token
      const token = require('crypto').randomBytes(32).toString('hex');
      
      // Token expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Delete any existing tokens for this user
      await db.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
      
      // Create new token
      await db.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
      
      return token;
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw error;
    }
  }

  static async deleteResetToken(token) {
    try {
      await db.execute('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
      return true;
    } catch (error) {
      console.error('Error deleting reset token:', error);
      throw error;
    }
  }
}

module.exports = User;