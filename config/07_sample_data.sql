USE autohive;

-- Insert sample admin user (password is 'admin123' - will be hashed by the application)
INSERT INTO users (username, email, password, full_name, is_admin, email_verified) VALUES
('admin', 'admin@autohive.com', '$2b$10$rGKs5cM5r5cM5r5cM5r5cuL9E2vL9E2vL9E2vL9E2vL9E2vL9E2vL2', 'Admin User', TRUE, TRUE),
('johndoe', 'john@example.com', '$2b$10$rGKs5cM5r5cM5r5cM5r5cuL9E2vL9E2vL9E2vL9E2vL9E2vL9E2vL2', 'John Doe', FALSE, TRUE),
('janesmith', 'jane@example.com', '$2b$10$rGKs5cM5r5cM5r5cM5r5cuL9E2vL9E2vL9E2vL9E2vL9E2vL9E2vL2', 'Jane Smith', FALSE, TRUE);

-- Insert sample vehicles
INSERT INTO vehicles (make, model, year, license_plate, vehicle_type, category, daily_rate, description, location, fuel_type, transmission) VALUES
('BMW', 'X5', 2023, 'KA01AB1234', 'SUV', 'Luxury', 150.00, 'Luxury SUV with premium features and advanced safety systems', 'Bangalore, Karnataka', 'Petrol', 'Automatic'),
('Audi', 'A4', 2022, 'KA01CD5678', 'Sedan', 'Premium', 120.00, 'Premium sedan with excellent performance and comfort', 'Bangalore, Karnataka', 'Petrol', 'Automatic'),
('Mercedes-Benz', 'C-Class', 2023, 'KA01EF9012', 'Sedan', 'Luxury', 180.00, 'Luxury sedan with cutting-edge technology', 'Bangalore, Karnataka', 'Petrol', 'Automatic'),
('Honda', 'City', 2022, 'KA01GH3456', 'Sedan', 'Standard', 80.00, 'Reliable and fuel-efficient sedan perfect for city drives', 'Bangalore, Karnataka', 'Petrol', 'Manual'),
('Toyota', 'Fortuner', 2023, 'KA01IJ7890', 'SUV', 'Premium', 140.00, 'Robust SUV perfect for family trips and adventures', 'Bangalore, Karnataka', 'Diesel', 'Automatic'),
('Hyundai', 'i20', 2022, 'KA01KL2345', 'Hatchback', 'Economy', 60.00, 'Compact and economical hatchback for city commuting', 'Bangalore, Karnataka', 'Petrol', 'Manual'),
('Maruti Suzuki', 'Swift', 2021, 'KA01MN6789', 'Hatchback', 'Economy', 55.00, 'Popular hatchback with great fuel efficiency', 'Bangalore, Karnataka', 'Petrol', 'Manual'),
('Mahindra', 'Thar', 2023, 'KA01OP1234', 'SUV', 'Sports', 130.00, 'Off-road adventure SUV with rugged design', 'Bangalore, Karnataka', 'Diesel', 'Manual');

-- Insert sample rentals
INSERT INTO rentals (user_id, vehicle_id, start_date, end_date, total_cost, status, payment_status, pickup_location, dropoff_location) VALUES
(2, 1, '2025-05-25', '2025-05-27', 300.00, 'confirmed', 'paid', 'Bangalore Airport', 'Bangalore Airport'),
(3, 4, '2025-05-26', '2025-05-28', 160.00, 'pending', 'pending', 'MG Road, Bangalore', 'MG Road, Bangalore'),
(2, 2, '2025-05-30', '2025-06-02', 360.00, 'confirmed', 'paid', 'Whitefield, Bangalore', 'Electronic City, Bangalore');

-- Insert sample payments
INSERT INTO payments (rental_id, amount, payment_method, payment_status, transaction_id, payment_gateway) VALUES
(1, 300.00, 'credit_card', 'successful', 'TXN001234567', 'stripe'),
(3, 360.00, 'debit_card', 'successful', 'TXN001234568', 'razorpay');

-- Insert sample reviews
INSERT INTO reviews (user_id, vehicle_id, rental_id, rating, comment) VALUES
(2, 1, 1, 5, 'Excellent luxury SUV! Very comfortable and well-maintained. The booking process was smooth and the staff was professional.'),
(2, 2, 3, 4, 'Great car with good performance. Clean and reliable. Would definitely rent again for business trips.');
