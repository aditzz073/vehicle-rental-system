-- Luxury Vehicles Seed Data for Indian Market
-- Run this file to insert dummy data for luxury vehicles into the database
USE vehicle_rental;

-- Clear existing data first to avoid duplicates
DELETE FROM vehicle_pricing_tiers;
DELETE FROM vehicles WHERE make IN ('BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Ford', 'Mini', 'Jaguar', 'Land Rover', 'Lexus', 'Bentley', 'Maserati');

-- Category: Luxury Sedan
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('BMW', '7 Series 740Li M Sport', 2024, 'MH01AB1234', 'Mineral White Metallic', 2500, 'Luxury Sedan', 'Premium', 25000, TRUE, '/images/bmw-7-series.jpg', 
'Experience the pinnacle of luxury with the BMW 7 Series 740Li M Sport. This flagship sedan features a 3.0-litre six-cylinder turbo-petrol engine producing 380 bhp, advanced driver assistance systems, rear-seat entertainment, and impeccable comfort.', 
'Mumbai', 'Maharashtra', '400001', 'Marine Drive, Mumbai');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Mercedes-Benz', 'S-Class S 350d', 2024, 'HR26GH3456', 'Obsidian Black', 1800, 'Luxury Sedan', 'Premium', 28000, TRUE, '/images/mercedes-s-class.jpg', 
'The Mercedes-Benz S-Class represents the pinnacle of luxury and technology. Featuring a 3.0L inline-6 diesel engine, MBUX infotainment system with augmented reality navigation, rear-wheel steering, and level 2 autonomous driving capabilities.', 
'Gurgaon', 'Haryana', '122001', 'Golf Course Road, Gurgaon');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Audi', 'A8 L 55 TFSI', 2024, 'DL03MN5678', 'Vesuvius Gray Metallic', 2000, 'Luxury Sedan', 'Premium', 26000, TRUE, '/images/audi-a8.jpg', 
'The Audi A8 L delivers uncompromising luxury with its adaptive air suspension, all-wheel steering, and premium Bang & Olufsen sound system. Its 3.0L V6 TFSI engine with 48V mild-hybrid technology ensures smooth performance with efficiency.', 
'Delhi', 'Delhi', '110001', 'Diplomatic Enclave, Delhi');

-- Category: Luxury SUV
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('BMW', 'X7 xDrive40i', 2023, 'KA01CD5678', 'Carbon Black', 5000, 'Luxury SUV', 'Premium', 22000, TRUE, '/images/bmw-x7.jpg', 
'The BMW X7 represents the pinnacle of luxury SUVs with three rows of seating. Featuring a powerful 3.0L turbocharged engine, air suspension, panoramic sunroof, and BMW\'s latest infotainment system, this vehicle offers both performance and comfort.', 
'Bangalore', 'Karnataka', '560001', 'MG Road, Bangalore');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Mercedes-Benz', 'GLS 450 4MATIC', 2023, 'TN07IJ7890', 'Selenite Grey Metallic', 4000, 'Luxury SUV', 'Premium', 24000, TRUE, '/images/mercedes-gls.jpg', 
'The Mercedes-Benz GLS is the S-Class of SUVs, offering unmatched luxury and space with three full rows of seating. With a 3.0L turbocharged inline-6 with EQ Boost mild hybrid system, air suspension, and premium Burmester sound system, it redefines SUV luxury.', 
'Chennai', 'Tamil Nadu', '600001', 'Anna Salai, Chennai');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Audi', 'Q8 55 TFSI quattro', 2023, 'MH02OP9012', 'Navarra Blue Metallic', 3500, 'Luxury SUV', 'Premium', 23000, TRUE, '/images/audi-q8.jpg', 
'The Audi Q8 combines SUV utility with coupe-like styling. Featuring Audi\'s Virtual Cockpit, air suspension, and quattro all-wheel drive, it delivers a perfect blend of luxury, technology and performance with its 3.0L turbocharged V6 engine.', 
'Mumbai', 'Maharashtra', '400001', 'Worli Sea Face, Mumbai');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Porsche', 'Cayenne Turbo GT', 2023, 'TN10UV1234', 'Carmine Red', 2500, 'Luxury SUV', 'Ultra Luxury', 32000, TRUE, '/images/porsche-cayenne.jpg', 
'The Porsche Cayenne Turbo GT is the ultimate performance SUV with a 4.0L twin-turbo V8 producing 631 hp. With track-tuned suspension, ceramic brakes, and aggressive styling, it combines SUV utility with supercar performance.', 
'Chennai', 'Tamil Nadu', '600001', 'Boat Club Road, Chennai');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Land Rover', 'Range Rover SV Autobiography', 2024, 'MH04EF1234', 'Santorini Black', 1500, 'Luxury SUV', 'Ultra Luxury', 30000, TRUE, '/images/range-rover.jpg', 
'The Range Rover SV Autobiography represents the pinnacle of luxury SUVs. With a 4.4L twin-turbo V8, semi-aniline leather, rear executive seating with massage function, and advanced off-road capabilities, it offers unmatched versatility with uncompromising luxury.', 
'Mumbai', 'Maharashtra', '400001', 'Juhu Beach Road, Mumbai');

-- Category: Sports Cars
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('BMW', 'M4 Competition', 2023, 'DL01EF9012', 'Isle of Man Green', 3500, 'Sports Car', 'Premium', 30000, TRUE, '/images/bmw-m4.jpg', 
'The BMW M4 Competition offers exhilarating performance with its 3.0L twin-turbo inline-6 engine producing 503 hp. With track-ready handling, carbon fiber components, and aggressive styling, it\'s the perfect car for enthusiasts seeking pure driving pleasure.', 
'Delhi', 'Delhi', '110001', 'Connaught Place, Delhi');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Mercedes-Benz', 'AMG GT 63 S 4-Door Coupe', 2023, 'KA02KL1234', 'Brilliant Blue Magno', 2500, 'Sports Car', 'Premium', 32000, TRUE, '/images/mercedes-amg-gt.jpg', 
'The Mercedes-AMG GT 63 S 4-Door Coupe combines supercar performance with everyday usability. Its hand-built 4.0L biturbo V8 produces 639 hp, propelling it from 0-100 km/h in just 3.2 seconds, while maintaining the comfort and luxury expected from Mercedes-Benz.', 
'Bangalore', 'Karnataka', '560001', 'Vittal Mallya Road, Bangalore');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Porsche', '911 Turbo S', 2024, 'HR12ST7890', 'GT Silver Metallic', 1200, 'Sports Car', 'Ultra Luxury', 40000, TRUE, '/images/porsche-911.jpg', 
'The legendary Porsche 911 Turbo S delivers unmatched performance with its 3.8L twin-turbo flat-six producing 640 hp. With all-wheel drive, active aerodynamics, and Porsche\'s PDK dual-clutch transmission, it achieves 0-100 km/h in just 2.7 seconds.', 
'Gurgaon', 'Haryana', '122001', 'DLF Cyber City, Gurgaon');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Ford', 'Mustang GT Fastback', 2022, 'DL05YZ9012', 'Race Red', 5000, 'Sports Car', 'Premium', 18000, TRUE, '/images/ford-mustang.jpg', 
'The iconic Ford Mustang GT delivers raw American muscle with its 5.0L V8 engine producing 450 hp. With its distinctive design, rumbling exhaust note, and modern technology, it offers a classic muscle car experience with contemporary comfort and performance.', 
'Delhi', 'Delhi', '110001', 'Rajouri Garden, Delhi');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Jaguar', 'F-Type R Coupe', 2023, 'TN11CD7890', 'Caldera Red', 2800, 'Sports Car', 'Premium', 28000, TRUE, '/images/jaguar-ftype.jpg', 
'The Jaguar F-Type R Coupe combines quintessential British elegance with ferocious performance. Its 5.0L supercharged V8 produces 575 hp, while its aluminum construction ensures agile handling. With a luxurious interior and unmistakable exhaust note, it offers a unique sporting experience.', 
'Chennai', 'Tamil Nadu', '600001', 'Poes Garden, Chennai');

-- Category: Electric & Hybrid
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Audi', 'RS e-tron GT', 2023, 'KA01QR3456', 'Daytona Gray Pearl', 1800, 'Electric Sports Car', 'Ultra Luxury', 35000, TRUE, '/images/audi-etron-gt.jpg', 
'The Audi RS e-tron GT represents the future of electric performance with dual motors producing 637 hp and 830 Nm of torque. With 800V fast charging technology, Quattro electric all-wheel drive, and a range of up to 383 km, it combines performance with sustainability.', 
'Bangalore', 'Karnataka', '560001', 'Indiranagar, Bangalore');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Porsche', 'Taycan Turbo S Cross Turismo', 2023, 'MH03WX5678', 'Frozen Blue Metallic', 2000, 'Electric Sports Car', 'Ultra Luxury', 36000, TRUE, '/images/porsche-taycan.jpg', 
'The Porsche Taycan Turbo S Cross Turismo offers electric performance with practicality. Its dual electric motors produce 750 hp, enabling 0-100 km/h in 2.9 seconds. With all-wheel drive, air suspension, and 800V charging technology, it\'s the perfect blend of luxury and innovation.', 
'Mumbai', 'Maharashtra', '400001', 'Bandra Kurla Complex, Mumbai');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Lexus', 'LC 500h', 2023, 'HR13GH5678', 'Structural Blue', 2200, 'Luxury Coupe', 'Premium', 22000, TRUE, '/images/lexus-lc.jpg', 
'The Lexus LC 500h combines avant-garde design with innovative hybrid technology. Its Multi-Stage Hybrid System pairs a 3.5L V6 with electric motors for 354 hp of total system output. With a meticulously crafted interior and exceptional build quality, it represents Japanese luxury at its finest.', 
'Gurgaon', 'Haryana', '122001', 'Sohna Road, Gurgaon');

-- Category: Exotic & Ultra Luxury
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Bentley', 'Continental GT V8', 2023, 'KA04IJ9012', 'British Racing Green', 1000, 'Luxury Grand Tourer', 'Ultra Luxury', 45000, TRUE, '/images/bentley-continental.jpg', 
'The Bentley Continental GT V8 represents the pinnacle of British grand touring luxury. Its 4.0L twin-turbo V8 produces 542 hp, while inside, handcrafted wood, leather, and metal create an atmosphere of unparalleled luxury. Perfect for cross-country journeys in ultimate comfort and style.', 
'Bangalore', 'Karnataka', '560001', 'UB City, Bangalore');

INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Maserati', 'MC20', 2023, 'DL06KL3456', 'Bianco Audace', 1500, 'Supercar', 'Ultra Luxury', 42000, TRUE, '/images/maserati-mc20.jpg', 
'The Maserati MC20 represents Italian automotive excellence with its mid-engine design and 3.0L twin-turbo "Nettuno" V6 producing 621 hp. With carbon fiber construction, butterfly doors, and race-derived technology, it delivers a pure supercar experience with distinctive Italian flair.', 
'Delhi', 'Delhi', '110001', 'Greater Kailash, Delhi');

-- Category: Compact Luxury
INSERT INTO vehicles (make, model, year, registration_number, color, mileage, vehicle_type, category, daily_rate, is_available, image_url, description, location_city, location_state, location_zip, location_address) 
VALUES ('Mini', 'Cooper S John Cooper Works', 2023, 'KA03AB3456', 'Chili Red with White Roof', 3000, 'Compact Sports Car', 'Premium', 15000, TRUE, '/images/mini-cooper-jcw.jpg', 
'The Mini Cooper S John Cooper Works offers playful performance with its 2.0L turbocharged engine producing 228 hp. With responsive handling, distinctive styling, and premium interior, it delivers a uniquely fun driving experience with British character.', 
'Bangalore', 'Karnataka', '560001', 'Koramangala, Bangalore');

-- Add pricing tiers for each vehicle
-- First, get all vehicle IDs
SET @vehicle_count = 0;
SELECT COUNT(*) INTO @vehicle_count FROM vehicles;

-- Only proceed if we have vehicles
SET @counter = 1;
WHILE @counter <= @vehicle_count DO
    SET @current_vehicle_id = 0;
    SELECT vehicle_id INTO @current_vehicle_id FROM vehicles ORDER BY vehicle_id LIMIT 1 OFFSET (@counter - 1);
    
    -- Standard rate for 1-3 days (100% of daily rate)
    INSERT INTO vehicle_pricing_tiers (vehicle_id, min_days, max_days, rate_multiplier) 
    VALUES (@current_vehicle_id, 1, 3, 1.00);
    
    -- Discounted rate for 4-7 days (90% of daily rate)
    INSERT INTO vehicle_pricing_tiers (vehicle_id, min_days, max_days, rate_multiplier) 
    VALUES (@current_vehicle_id, 4, 7, 0.90);
    
    -- Discounted rate for 8-15 days (85% of daily rate)
    INSERT INTO vehicle_pricing_tiers (vehicle_id, min_days, max_days, rate_multiplier) 
    VALUES (@current_vehicle_id, 8, 15, 0.85);
    
    -- Discounted rate for 16-30 days (80% of daily rate)
    INSERT INTO vehicle_pricing_tiers (vehicle_id, min_days, max_days, rate_multiplier) 
    VALUES (@current_vehicle_id, 16, 30, 0.80);
    
    -- Discounted rate for 30+ days (75% of daily rate)
    INSERT INTO vehicle_pricing_tiers (vehicle_id, min_days, max_days, rate_multiplier) 
    VALUES (@current_vehicle_id, 31, 365, 0.75);
    
    SET @counter = @counter + 1;
END WHILE;