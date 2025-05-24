const User = require('../models/User');

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    // Check session first
    if (req.session && req.session.user) {
      return next();
    }
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Decode our simple token
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split(':');
        const userId = parts[0];
        const email = parts[1];
        // parts[2] would be timestamp if present
        
        if (userId && email) {
          // Fetch user from database
          const user = await User.findById(parseInt(userId));
          if (user && user.email === email) {
            req.user = user;
            return next();
          }
        }
      } catch (err) {
        // Token decode failed, continue to error response
      }
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error_code: 'AUTHENTICATION_REQUIRED'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error_code: 'AUTHENTICATION_REQUIRED'
    });
  }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    // At this point, req.user should be set by isAuthenticated middleware
    const user = req.user || req.session?.user;
    
    if (user && user.is_admin) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      error_code: 'ADMIN_ACCESS_REQUIRED'
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      error_code: 'ADMIN_ACCESS_REQUIRED'
    });
  }
};

// Check if user is not authenticated (for login/register routes)
const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return next();
  }
  
  return res.status(400).json({
    success: false,
    message: 'Already authenticated. Please log out first.',
    error_code: 'ALREADY_AUTHENTICATED'
  });
};

// Verify user account is active
const isActiveUser = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error_code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      // User no longer exists, destroy session
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please log in again.',
        error_code: 'USER_NOT_FOUND'
      });
    }

    if (!user.is_active) {
      // User account is deactivated, destroy session
      req.session.destroy();
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
        error_code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Update session with latest user data
    req.session.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_admin: user.is_admin
    };

    // Attach user to request for easier access
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Active user check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify user status',
      error_code: 'USER_VERIFICATION_ERROR'
    });
  }
};

// Optional authentication - sets user if authenticated but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user.id);
      if (user && user.is_active) {
        req.user = user;
        req.session.user = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_admin: user.is_admin
        };
      } else {
        // Clear invalid session
        req.session.destroy();
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Don't fail the request for optional auth errors
    next();
  }
};

// Rate limiting middleware (basic implementation)
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [id, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(id);
      } else {
        requests.set(id, validTimestamps);
      }
    }

    // Check current client's requests
    const clientRequests = requests.get(clientId) || [];
    const recentRequests = clientRequests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        error_code: 'RATE_LIMIT_EXCEEDED',
        retry_after: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(clientId, recentRequests);

    next();
  };
};

// Validation middleware generator
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error_code: 'MISSING_REQUIRED_FIELDS',
        missing_fields: missingFields
      });
    }

    next();
  };
};

// Check ownership middleware - ensures user owns the resource
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.session.user.id;
      const isAdmin = req.session.user.is_admin;
      const resourceId = req.params.id;

      // Admins can access any resource
      if (isAdmin) {
        return next();
      }

      let ownsResource = false;

      switch (resourceType) {
        case 'rental':
          const Rental = require('../models/Rental');
          const rental = await Rental.findById(resourceId);
          ownsResource = rental && rental.user_id === userId;
          break;
        case 'review':
          const Review = require('../models/Review');
          const review = await Review.findById(resourceId);
          ownsResource = review && review.user_id === userId;
          break;
        case 'payment':
          const Payment = require('../models/Payment');
          const payment = await Payment.findById(resourceId);
          ownsResource = payment && payment.user_id === userId;
          break;
        default:
          return res.status(500).json({
            success: false,
            message: 'Invalid resource type for ownership check',
            error_code: 'INVALID_RESOURCE_TYPE'
          });
      }

      if (!ownsResource) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not own this resource.',
          error_code: 'OWNERSHIP_REQUIRED'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify resource ownership',
        error_code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isNotAuthenticated,
  isActiveUser,
  optionalAuth,
  rateLimiter,
  validateRequired,
  checkOwnership
};
