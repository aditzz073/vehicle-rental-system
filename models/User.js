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
      const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { 
        full_name, email, password, phone, address, date_of_birth, driver_license_number 
      } = userData;
      
      // Generate username from email if not provided
      const username = userData.username || email.split('@')[0];
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await db.execute(
        `INSERT INTO users 
         (username, email, password, full_name, phone, address, date_of_birth, driver_license_number) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, full_name, phone || null, address || null, date_of_birth || null, driver_license_number || null]
      );
      
      return { id: result.insertId, username, email, full_name, phone, address, date_of_birth, driver_license_number };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async update(userId, userData) {
    try {
      const { full_name, phone, address, date_of_birth, driver_license_number } = userData;
      
      const [result] = await db.execute(
        `UPDATE users SET 
         full_name = ?, phone = ?, address = ?, 
         date_of_birth = ?, driver_license_number = ?
         WHERE id = ?`,
        [full_name, phone || null, address || null, date_of_birth || null, driver_license_number || null, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updatePassword(userId, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const [result] = await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
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
      const [rows] = await db.execute(
        'SELECT id, username, email, full_name, phone, address, is_admin, is_active, created_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async findAll(limit = 10, offset = 0, filters = {}) {
    try {
      let query = 'SELECT id, username, email, full_name, phone, address, is_admin, is_active, created_at FROM users';
      let conditions = [];
      let params = [];

      // Apply filters
      if (filters.is_admin !== undefined) {
        conditions.push('is_admin = ?');
        params.push(filters.is_admin);
      }

      if (filters.is_active !== undefined) {
        conditions.push('is_active = ?');
        params.push(filters.is_active);
      }

      if (filters.search) {
        conditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await db.execute(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users';
      if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }
      const [countRows] = await db.execute(countQuery, params);
      const total = countRows[0].total;

      return {
        users: rows,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async login(username, password) {
    try {
      const user = await this.findByUsername(username);
      if (!user) return null;
      
      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }
      
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
        [isAdmin, userId]
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
        'UPDATE users SET is_active = TRUE WHERE user_id = ?',
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
        'UPDATE users SET is_active = FALSE WHERE user_id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  }

  static async searchUsers(searchTerm) {
    try {
      const searchPattern = `%${searchTerm}%`;
      const [rows] = await db.execute(
        `SELECT id, username, email, full_name, phone, is_admin, is_active, created_at 
         FROM users 
         WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
         ORDER BY created_at DESC`,
        [searchPattern, searchPattern, searchPattern]
      );
      return rows;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  static async createResetToken(userId) {
    try {
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      
      const [result] = await db.execute(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, expiresAt, userId]
      );
      
      return result.affectedRows > 0 ? resetToken : null;
    } catch (error) {
      console.error('Error creating reset token:', error);
      throw error;
    }
  }

  static async validateResetToken(token) {
    try {
      const [rows] = await db.execute(
        'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
      );
      return rows[0];
    } catch (error) {
      console.error('Error validating reset token:', error);
      throw error;
    }
  }

  static async clearResetToken(userId) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error clearing reset token:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    try {
      const [result] = await db.execute(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Get user statistics (admin method)
  static async getStats() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_admin = 1 THEN 1 END) as admin_users,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as new_this_week,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_this_month
        FROM users
      `);
      return rows[0];
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Get recent users (admin method)
  static async getRecentUsers(limit = 5) {
    try {
      const limitNum = parseInt(limit);
      const [rows] = await db.execute(`
        SELECT id, full_name, email, created_at, is_admin
        FROM users 
        ORDER BY created_at DESC 
        LIMIT ${limitNum}
      `);
      return rows;
    } catch (error) {
      console.error('Error getting recent users:', error);
      throw error;
    }
  }
}

module.exports = User;
