const User = require('../models/User');
const bcrypt = require('bcrypt');

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password, first_name, last_name, phone, address } = req.body;
      
      // Check if username or email already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      // Create new user
      const newUser = await User.create({
        username,
        email,
        password,
        first_name,
        last_name,
        phone,
        address
      });
      
      // Return new user (without password)
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          user_id: newUser.userId,
          username: newUser.username,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name
        }
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },
  
  // Log in a user
  login: async (req, res) => {
    try {
      console.log('Login attempt for user:', req.body.username);
      const { username, password } = req.body;
      
      // Authenticate user
      const user = await User.login(username, password);
      
      if (!user) {
        console.log('Authentication failed for user:', username);
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      console.log('Authentication successful for user:', username);
      
      // Set session data
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      };
      
      console.log('Session created:', req.session.user);
      
      res.status(200).json({
        message: 'Login successful',
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  },
  
  // Log out a user
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  },
  
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Don't send password
      const { password, ...userProfile } = user;
      
      res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ message: 'Server error getting profile' });
    }
  },
  
  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const { first_name, last_name, phone, address } = req.body;
      
      const success = await User.update(userId, {
        first_name,
        last_name,
        phone,
        address
      });
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to update profile' });
      }
      
      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error updating profile' });
    }
  },
  
  // Change password
  changePassword: async (req, res) => {
    try {
      const userId = req.session.user.user_id;
      const { currentPassword, newPassword } = req.body;
      
      // Get user with password
      const user = await User.findById(userId);
      
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      const success = await User.updatePassword(userId, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to change password' });
      }
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error changing password' });
    }
  },
  
  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal that email doesn't exist for security
        return res.status(200).json({ 
          message: 'If your email is registered, you will receive a password reset link' 
        });
      }
      
      // Generate reset token
      const token = await User.createResetToken(user.user_id);
      
      // In a real app, send email with reset link
      // For now, just return the token
      console.log(`Reset token for ${email}: ${token}`);
      
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link',
        // In production, don't return the token directly
        token: token
      });
    } catch (error) {
      console.error('Error in forgot password:', error);
      res.status(500).json({ message: 'Server error processing password reset' });
    }
  },
  
  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      // Validate token and get user ID
      const userId = await User.validateResetToken(token);
      if (!userId) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
      
      // Update password
      const success = await User.updatePassword(userId, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to reset password' });
      }
      
      // Delete the token
      await User.deleteResetToken(token);
      
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Server error resetting password' });
    }
  },
  
  // Middleware to check if user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json({ message: 'Authentication required' });
    }
  },
  
  // Middleware to check if user is admin
  isAdmin: (req, res, next) => {
    if (req.session.user && req.session.user.is_admin) {
      next();
    } else {
      res.status(403).json({ message: 'Admin privileges required' });
    }
  }
};

module.exports = authController;