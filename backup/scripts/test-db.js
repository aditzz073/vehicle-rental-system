#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('🔗 Testing database connection...');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'autohive',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL database successfully!');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`📊 Found ${rows[0].count} users in database`);
        
        const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        console.log(`🚗 Found ${vehicles[0].count} vehicles in database`);
        
        const [rentals] = await connection.execute('SELECT COUNT(*) as count FROM rentals');
        console.log(`📋 Found ${rentals[0].count} rentals in database`);
        
        await connection.end();
        console.log('🎉 Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();
