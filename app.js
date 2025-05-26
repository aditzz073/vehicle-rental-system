const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { requestLogger, errorLogger } = require('./services/logger');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Request logging
app.use(requestLogger);

// Middleware
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'autohive_secret_key_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000, // 1 hour
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  }
}));

// Serve static files for API documentation
app.use('/static', express.static(path.join(__dirname, 'public')));

// Authentication middleware functions
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.is_admin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

// Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const rentalRoutes = require('./routes/rentals');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const db = require('./config/db');
    await db.execute('SELECT 1');
    
    res.json({
      success: true,
      message: 'AutoHive API is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// For React single-page application, serve the React app for any non-API route
app.get('*', (req, res) => {
  // If this is a development environment, we'll proxy to the React dev server
  // In production, we'll serve the static build
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3001'}${req.originalUrl}`);
  }
});

// Error handling middleware
app.use(errorLogger);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 AutoHive server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'autohive'}`);
});

module.exports = app;
