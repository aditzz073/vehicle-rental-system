/**
 * Authentication middleware functions for the AutoHive application
 */
const jwt = require('jsonwebtoken');

// Middleware to authenticate users via JWT
const authenticateJWT = (req, res, next) => {
  // First check session-based authentication (for backward compatibility)
  if (req.session && req.session.user) {
    return next();
  }

  // Then check JWT-based authentication
  const token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.jwt || 
                req.query?.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'autohive_jwt_secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  // First check from JWT payload
  if (req.user && req.user.isAdmin) {
    return next();
  }
  
  // Then check from session (for backward compatibility)
  if (req.session && req.session.user && req.session.user.is_admin) {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin privileges required' });
};

module.exports = { authenticateJWT, isAdmin };