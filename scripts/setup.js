#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🔗 Connecting to MySQL server...');
        connection = await mysql.createConnection(dbConfig);
        
        // Create database if it doesn't exist
        console.log('📊 Creating database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        // Read and execute schema
        console.log('🏗️  Setting up database schema...');
        const schemaPath = path.join(__dirname, '../config/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split schema into individual statements and execute them
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement.trim());
            }
        }
        
        // Insert sample data
        console.log('📦 Inserting sample data...');
        await insertSampleData(connection);
        
        console.log('✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function insertSampleData(connection) {
    // Insert sample users
    const users = [
        ['john_doe', 'john@example.com', '$2a$10$rOmE.sKfM8cSbC/xGT.aXe4KgLbz8fKQ7Y9Z2xS5xR1mE2tK8xD9e', 'John', 'Doe', '1234567890', 'user'],
        ['admin_user', 'admin@autohive.com', '$2a$10$rOmE.sKfM8cSbC/xGT.aXe4KgLbz8fKQ7Y9Z2xS5xR1mE2tK8xD9e', 'Admin', 'User', '0987654321', 'admin']
    ];
    
    const userQuery = `
        INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    for (const user of users) {
        await connection.execute(userQuery, user);
    }
    
    // Insert sample vehicle categories
    const categories = [
        ['luxury_sedans', 'Luxury Sedans', 'Premium sedans for executive travel'],
        ['sports_cars', 'Sports Cars', 'High-performance sports vehicles'],
        ['luxury_suvs', 'Luxury SUVs', 'Spacious luxury SUVs for family trips'],
        ['convertibles', 'Convertibles', 'Open-top vehicles for scenic drives'],
        ['exotic_cars', 'Exotic Cars', 'Ultra-luxury and rare vehicles']
    ];
    
    const categoryQuery = `
        INSERT INTO vehicle_categories (slug, name, description)
        VALUES (?, ?, ?)
    `;
    
    for (const category of categories) {
        await connection.execute(categoryQuery, category);
    }
    
    // Insert sample vehicles
    const vehicles = [
        ['BMW 7 Series', 'luxury_sedans', 'Executive luxury sedan with premium features', 150.00, 5, 4, 'automatic', 'gasoline', 2023, 'black', 'available', 4.8, 15, '["leather_seats", "navigation", "bluetooth", "climate_control"]'],
        ['Mercedes S-Class', 'luxury_sedans', 'Ultimate luxury and comfort', 180.00, 5, 4, 'automatic', 'gasoline', 2023, 'silver', 'available', 4.9, 12, '["massage_seats", "panoramic_roof", "premium_sound", "driver_assistance"]'],
        ['Porsche 911', 'sports_cars', 'Iconic sports car performance', 300.00, 2, 2, 'manual', 'gasoline', 2023, 'red', 'available', 4.7, 8, '["sport_seats", "performance_package", "carbon_fiber", "racing_stripes"]'],
        ['Range Rover Vogue', 'luxury_suvs', 'Premium SUV with off-road capability', 200.00, 5, 7, 'automatic', 'gasoline', 2023, 'white', 'available', 4.6, 20, '["air_suspension", "terrain_response", "premium_interior", "tow_package"]'],
        ['Ferrari F8 Tributo', 'exotic_cars', 'Exotic supercar experience', 800.00, 2, 2, 'automatic', 'gasoline', 2023, 'yellow', 'available', 4.9, 3, '["carbon_fiber", "racing_package", "premium_leather", "performance_exhaust"]']
    ];
    
    const vehicleQuery = `
        INSERT INTO vehicles (name, category, description, daily_rate, doors, seats, transmission, fuel_type, year, color, status, rating, total_reviews, features, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    for (const vehicle of vehicles) {
        await connection.execute(vehicleQuery, vehicle);
    }
    
    console.log('Sample data inserted successfully');
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
