USE autohive;

CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
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
    location VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
