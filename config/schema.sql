-- Create the schema if it doesn't exist
CREATE DATABASE IF NOT EXISTS autohive_db;
USE autohive_db;

-- Drop existing tables if they exist (for clean reset)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS rental_addons;
DROP TABLE IF EXISTS addons;
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS vehicle_pricing_tiers;
DROP TABLE IF EXISTS vehicle_images;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone_number VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  driver_license_number VARCHAR(50),
  driver_license_state VARCHAR(50),
  date_of_birth DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE vehicles (
  vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INT NOT NULL,
  registration_number VARCHAR(20) UNIQUE,
  color VARCHAR(20),
  mileage INT,
  vehicle_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) DEFAULT 'Standard',
  daily_rate DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(255),
  description TEXT,
  location_city VARCHAR(100),
  location_state VARCHAR(50),
  location_zip VARCHAR(20),
  location_address VARCHAR(255),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create vehicle_images table for multiple images per vehicle
CREATE TABLE vehicle_images (
  image_id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

-- Create vehicle_pricing_tiers table for tiered pricing based on rental duration
CREATE TABLE vehicle_pricing_tiers (
  tier_id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  min_days INT NOT NULL,
  max_days INT NOT NULL,
  rate_multiplier DECIMAL(3, 2) NOT NULL, -- e.g., 0.90 for 10% off
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  CONSTRAINT rate_range_valid CHECK (rate_multiplier > 0 AND rate_multiplier <= 1)
);

-- Create reviews table
CREATE TABLE reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create rentals table
CREATE TABLE rentals (
  rental_id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  rental_status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  checkout_notes TEXT,
  checkin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT valid_rental_dates CHECK (end_date >= start_date)
);

-- Create addons table (e.g., GPS, child seat, additional insurance)
CREATE TABLE addons (
  addon_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  daily_rate DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create junction table for rental and addons
CREATE TABLE rental_addons (
  rental_addon_id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  addon_id INT NOT NULL,
  quantity INT DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (rental_id) REFERENCES rentals(rental_id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES addons(addon_id) ON DELETE RESTRICT
);

-- Create payments table
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  rental_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rental_id) REFERENCES rentals(rental_id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_category ON vehicles(category);
CREATE INDEX idx_vehicles_city ON vehicles(location_city);
CREATE INDEX idx_vehicles_state ON vehicles(location_state);
CREATE INDEX idx_vehicles_availability ON vehicles(is_available);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX idx_rentals_status ON rentals(rental_status);
CREATE INDEX idx_reviews_vehicle ON reviews(vehicle_id);
CREATE INDEX idx_payments_status ON payments(payment_status);