const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'vehicle_rental_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.is_admin) {
    return next();
  }
  res.status(403).redirect('/login');
};

// Routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const rentalRoutes = require('./routes/rentals');
const adminRoutes = require('./routes/admin');

app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/rentals', rentalRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Authentication page routes
app.get('/register', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Protected routes - require authentication
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/vehicles-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'vehicles.html'));
});

// Admin routes - require admin authentication
app.use('/admin', isAdmin, adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;