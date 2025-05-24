const User = require('../models/User');
const bcrypt = require('bcrypt');

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { full_name, email, password, phone, date_of_birth, address } = req.body;

      // Validation
      if (!full_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Password validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const userData = {
        full_name,
        email: email.toLowerCase(),
        password,
        phone,
        date_of_birth,
        address
      };

      const user = await User.create(userData);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Create session
      req.session.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin
      };

      // Remove password from response
      const { password: _, ...userResponse } = user;

      // Generate a simple token (for testing purposes)
      const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        message: 'Login successful',
        user: userResponse,
        token: token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // User logout
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({
            success: false,
            message: 'Logout failed'
          });
        }

        res.clearCookie('connect.sid');
        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.session.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove password from response
      const { password_hash, ...userResponse } = user;

      res.json({
        success: true,
        user: userResponse
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.session.user.id;
      const { full_name, phone, date_of_birth, address } = req.body;

      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;
      if (date_of_birth) updateData.date_of_birth = date_of_birth;
      if (address) updateData.address = address;

      const updatedUser = await User.update(userId, updateData);

      // Remove password from response
      const { password_hash, ...userResponse } = updatedUser;

      // Update session
      req.session.user.full_name = updatedUser.full_name;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userResponse
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const userId = req.session.user.id;
      const { current_password, new_password } = req.body;

      // Validation
      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Get current user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await User.updatePassword(userId, new_password);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const user = await User.findByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      const resetToken = await User.generatePasswordResetToken(user.id);

      // In a real application, you would send an email here
      // For now, we'll just return the token (remove this in production)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
        // Remove this in production:
        reset_token: resetToken
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Reset token and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await User.resetPassword(token, new_password);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check authentication status
  static async checkAuth(req, res) {
    try {
      if (req.session && req.session.user) {
        const user = await User.findById(req.session.user.id);
        if (user && user.is_active) {
          const { password_hash, ...userResponse } = user;
          return res.json({
            success: true,
            authenticated: true,
            user: userResponse
          });
        }
      }

      res.json({
        success: true,
        authenticated: false
      });

    } catch (error) {
      console.error('Check auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check authentication status'
      });
    }
  }

  // Delete account
  static async deleteAccount(req, res) {
    try {
      const userId = req.session.user.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to delete account'
        });
      }

      // Verify password
      const user = await User.findById(userId);
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }

      // Deactivate account instead of deleting
      await User.update(userId, { is_active: false });

      // Destroy session
      req.session.destroy();

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }
}

module.exports = AuthController;
