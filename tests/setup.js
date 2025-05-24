// Test setup file
require('dotenv').config({ path: '.env.test' });

// Mock console methods to reduce test output noise
if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
}

// Global test helpers
global.testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890'
};

global.testVehicle = {
    name: 'Test BMW',
    category: 'luxury_sedans',
    description: 'Test luxury sedan',
    daily_rate: 100.00,
    doors: 4,
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'gasoline',
    year: 2023,
    color: 'black'
};
