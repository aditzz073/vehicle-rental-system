-- AutoHive Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS autohive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autohive;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    driver_license_number VARCHAR(50),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Vehicles table
CREATE TABLE vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(30),
    mileage INT,
    vehicle_type ENUM('Sedan', 'SUV', 'Hatchback', 'Convertible', 'Truck', 'Motorcycle', 'Luxury', 'Sports') NOT NULL,
    category ENUM('Economy', 'Standard', 'Premium', 'Luxury', 'Sports', 'SUV') DEFAULT 'Standard',
    daily_rate DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    description TEXT,
    features JSON,
    fuel_type ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid') DEFAULT 'Petrol',
    transmission ENUM('Manual', 'Automatic') DEFAULT 'Manual',
    seating_capacity INT DEFAULT 5,
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_zip VARCHAR(10),
    location_address TEXT,
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_available (is_available),
    INDEX idx_type (vehicle_type),
    INDEX idx_category (category),
    INDEX idx_location (location_city, location_state),
    INDEX idx_rating (rating)
);

-- Vehicle pricing tiers for different rental durations
CREATE TABLE vehicle_pricing_tiers (
    tier_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    min_days INT NOT NULL,
    max_days INT,
    rate_multiplier DECIMAL(4, 3) DEFAULT 1.000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    INDEX idx_vehicle_days (vehicle_id, min_days)
);

-- Rentals table
CREATE TABLE rentals (
    rental_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    special_requests TEXT,
    damage_reported BOOLEAN DEFAULT FALSE,
    damage_cost DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    INDEX idx_user_rental (user_id),
    INDEX idx_vehicle_rental (vehicle_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Payments table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    rental_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    payment_status ENUM('pending', 'successful', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_gateway VARCHAR(50),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    refund_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rentals(rental_id) ON DELETE CASCADE,
    INDEX idx_rental_payment (rental_id),
    INDEX idx_status (payment_status),
    INDEX idx_date (payment_date)
);

-- Reviews table
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    rental_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (rental_id) REFERENCES rentals(rental_id) ON DELETE CASCADE,
    UNIQUE KEY unique_rental_review (rental_id),
    INDEX idx_vehicle_reviews (vehicle_id),
    INDEX idx_user_reviews (user_id),
    INDEX idx_rating (rating),
    INDEX idx_approved (is_approved)
);

-- Notifications table
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    related_table VARCHAR(50),
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_notifications (user_id),
    INDEX idx_unread (is_read),
    INDEX idx_type (type)
);

-- Vehicle images table (for multiple images per vehicle)
CREATE TABLE vehicle_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    INDEX idx_vehicle_images (vehicle_id),
    INDEX idx_primary (is_primary)
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    maintenance_type ENUM('routine', 'repair', 'inspection', 'cleaning') NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2),
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    performed_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    INDEX idx_vehicle_maintenance (vehicle_id),
    INDEX idx_type (maintenance_type),
    INDEX idx_date (maintenance_date)
);

-- Insert sample admin user (password is 'admin123')
INSERT INTO users (username, email, password, first_name, last_name, is_admin, email_verified) 
VALUES (
    'admin', 
    'admin@autohive.com', 
    '$2b$10$rQYzKb6.Bb8QJ5QQ5QQ5QuyZk9Zk9Zk9Zk9Zk9Zk9Zk9Zk9Zk9Z2', -- This will need to be hashed properly
    'Admin', 
    'User', 
    TRUE, 
    TRUE
);

-- Insert sample vehicles
INSERT INTO vehicles (make, model, year, registration_number, vehicle_type, category, daily_rate, description, location_city, location_state) VALUES
('BMW', 'X5', 2023, 'KA01AB1234', 'SUV', 'Luxury', 150.00, 'Luxury SUV with premium features', 'Bangalore', 'Karnataka'),
('Audi', 'A4', 2022, 'KA01CD5678', 'Sedan', 'Premium', 120.00, 'Premium sedan with excellent performance', 'Bangalore', 'Karnataka'),
('Mercedes-Benz', 'C-Class', 2023, 'KA01EF9012', 'Sedan', 'Luxury', 180.00, 'Luxury sedan with cutting-edge technology', 'Bangalore', 'Karnataka'),
('Honda', 'City', 2022, 'KA01GH3456', 'Sedan', 'Standard', 80.00, 'Reliable and fuel-efficient sedan', 'Bangalore', 'Karnataka'),
('Toyota', 'Fortuner', 2023, 'KA01IJ7890', 'SUV', 'Premium', 140.00, 'Robust SUV perfect for family trips', 'Bangalore', 'Karnataka');

-- Create triggers to update vehicle ratings when reviews are added/updated/deleted
DELIMITER //

CREATE TRIGGER update_vehicle_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE vehicles 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE vehicle_id = NEW.vehicle_id AND is_approved = TRUE
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE vehicle_id = NEW.vehicle_id AND is_approved = TRUE
    )
    WHERE vehicle_id = NEW.vehicle_id;
END//

CREATE TRIGGER update_vehicle_rating_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    UPDATE vehicles 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE vehicle_id = NEW.vehicle_id AND is_approved = TRUE
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE vehicle_id = NEW.vehicle_id AND is_approved = TRUE
    )
    WHERE vehicle_id = NEW.vehicle_id;
END//

CREATE TRIGGER update_vehicle_rating_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
    UPDATE vehicles 
    SET rating = COALESCE((
        SELECT AVG(rating) 
        FROM reviews 
        WHERE vehicle_id = OLD.vehicle_id AND is_approved = TRUE
    ), 0.00),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE vehicle_id = OLD.vehicle_id AND is_approved = TRUE
    )
    WHERE vehicle_id = OLD.vehicle_id;
END//

DELIMITER ;
