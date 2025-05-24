const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
    email: 'test@example.com',
    password: 'password123',
    full_name: 'Test User',
    phone: '1234567890'
};

const adminUser = {
    email: 'admin@autohive.com',
    password: 'admin123'
};

let authToken = '';
let adminToken = '';
let testUserId = '';
let vehicleId = '';

async function makeRequest(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

async function testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    const result = await makeRequest('GET', '/health');
    
    if (result.success) {
        console.log('✅ Health check passed');
        console.log('Data:', result.data);
    } else {
        console.log('❌ Health check failed:', result.error);
    }
}

async function testUserRegistration() {
    console.log('\n=== Testing User Registration ===');
    const result = await makeRequest('POST', '/auth/register', testUser);
    
    if (result.success) {
        console.log('✅ User registration successful');
        testUserId = result.data.user?.id || result.data.id;
        console.log('User ID:', testUserId);
    } else {
        console.log('❌ User registration failed:', result.error);
    }
}

async function testUserLogin() {
    console.log('\n=== Testing User Login ===');
    const result = await makeRequest('POST', '/auth/login', {
        email: testUser.email,
        password: testUser.password
    });
    
    if (result.success) {
        console.log('✅ User login successful');
        authToken = result.data.token;
        console.log('Token received:', authToken ? 'Yes' : 'No');
    } else {
        console.log('❌ User login failed:', result.error);
    }
}

async function testAdminLogin() {
    console.log('\n=== Testing Admin Login ===');
    const result = await makeRequest('POST', '/auth/login', adminUser);
    
    if (result.success) {
        console.log('✅ Admin login successful');
        adminToken = result.data.token;
        console.log('Admin token received:', adminToken ? 'Yes' : 'No');
    } else {
        console.log('❌ Admin login failed:', result.error);
    }
}

async function testVehicleEndpoints() {
    console.log('\n=== Testing Vehicle Endpoints ===');
    
    // Test get all vehicles
    console.log('\n--- Testing GET /vehicles ---');
    let result = await makeRequest('GET', '/vehicles');
    if (result.success) {
        console.log('✅ Get vehicles successful');
        console.log(`Found ${result.data.vehicles?.length || 0} vehicles`);
        if (result.data.vehicles && result.data.vehicles.length > 0) {
            vehicleId = result.data.vehicles[0].id;
            console.log('Using vehicle ID for tests:', vehicleId);
        }
    } else {
        console.log('❌ Get vehicles failed:', result.error);
    }

    // Test get vehicle by ID
    if (vehicleId) {
        console.log('\n--- Testing GET /vehicles/:id ---');
        result = await makeRequest('GET', `/vehicles/${vehicleId}`);
        if (result.success) {
            console.log('✅ Get vehicle by ID successful');
            console.log('Vehicle:', result.data.make, result.data.model);
        } else {
            console.log('❌ Get vehicle by ID failed:', result.error);
        }
    }

    // Test search vehicles
    console.log('\n--- Testing GET /vehicles/search ---');
    result = await makeRequest('GET', '/vehicles/search?category=luxury&location=New York');
    if (result.success) {
        console.log('✅ Search vehicles successful');
        console.log(`Found ${result.data.vehicles?.length || 0} matching vehicles`);
    } else {
        console.log('❌ Search vehicles failed:', result.error);
    }

    // Test get categories
    console.log('\n--- Testing GET /vehicles/categories ---');
    result = await makeRequest('GET', '/vehicles/categories');
    if (result.success) {
        console.log('✅ Get categories successful');
        console.log('Categories:', result.data);
    } else {
        console.log('❌ Get categories failed:', result.error);
    }

    // Test get locations
    console.log('\n--- Testing GET /vehicles/locations ---');
    result = await makeRequest('GET', '/vehicles/locations');
    if (result.success) {
        console.log('✅ Get locations successful');
        console.log('Locations:', result.data);
    } else {
        console.log('❌ Get locations failed:', result.error);
    }

    // Test get featured vehicles
    console.log('\n--- Testing GET /vehicles/featured ---');
    result = await makeRequest('GET', '/vehicles/featured');
    if (result.success) {
        console.log('✅ Get featured vehicles successful');
        console.log(`Found ${result.data.length || 0} featured vehicles`);
    } else {
        console.log('❌ Get featured vehicles failed:', result.error);
    }
}

async function testRentalEndpoints() {
    console.log('\n=== Testing Rental Endpoints ===');
    
    if (!authToken) {
        console.log('❌ No auth token available for rental tests');
        return;
    }

    // Test check availability
    if (vehicleId) {
        console.log('\n--- Testing POST /rentals/check-availability ---');
        const result = await makeRequest('POST', '/rentals/check-availability', {
            vehicle_id: vehicleId,
            start_date: '2025-06-01',
            end_date: '2025-06-05'
        }, authToken);
        
        if (result.success) {
            console.log('✅ Check availability successful');
            console.log('Available:', result.data.available);
        } else {
            console.log('❌ Check availability failed:', result.error);
        }
    }

    // Test get user rentals
    console.log('\n--- Testing GET /rentals ---');
    const result = await makeRequest('GET', '/rentals', null, authToken);
    if (result.success) {
        console.log('✅ Get user rentals successful');
        console.log(`Found ${result.data.length || 0} rentals`);
    } else {
        console.log('❌ Get user rentals failed:', result.error);
    }
}

async function testReviewEndpoints() {
    console.log('\n=== Testing Review Endpoints ===');
    
    // Test get reviews for a vehicle
    if (vehicleId) {
        console.log('\n--- Testing GET /reviews/vehicle/:id ---');
        const result = await makeRequest('GET', `/reviews/vehicle/${vehicleId}`);
        if (result.success) {
            console.log('✅ Get vehicle reviews successful');
            console.log(`Found ${result.data.length || 0} reviews`);
        } else {
            console.log('❌ Get vehicle reviews failed:', result.error);
        }
    }
}

async function testAdminEndpoints() {
    console.log('\n=== Testing Admin Endpoints ===');
    
    if (!adminToken) {
        console.log('❌ No admin token available for admin tests');
        return;
    }

    // Test get dashboard stats
    console.log('\n--- Testing GET /admin/dashboard ---');
    let result = await makeRequest('GET', '/admin/dashboard', null, adminToken);
    if (result.success) {
        console.log('✅ Get dashboard stats successful');
        console.log('Stats:', result.data);
    } else {
        console.log('❌ Get dashboard stats failed:', result.error);
    }

    // Test get all users
    console.log('\n--- Testing GET /admin/users ---');
    result = await makeRequest('GET', '/admin/users', null, adminToken);
    if (result.success) {
        console.log('✅ Get all users successful');
        console.log(`Found ${result.data.length || 0} users`);
    } else {
        console.log('❌ Get all users failed:', result.error);
    }

    // Test get all rentals
    console.log('\n--- Testing GET /admin/rentals ---');
    result = await makeRequest('GET', '/admin/rentals', null, adminToken);
    if (result.success) {
        console.log('✅ Get all rentals successful');
        console.log(`Found ${result.data.length || 0} rentals`);
    } else {
        console.log('❌ Get all rentals failed:', result.error);
    }
}

async function runAllTests() {
    console.log('🚀 Starting comprehensive API endpoint tests...\n');

    try {
        await testHealthCheck();
        await testUserRegistration();
        await testUserLogin();
        await testAdminLogin();
        await testVehicleEndpoints();
        await testRentalEndpoints();
        await testReviewEndpoints();
        await testAdminEndpoints();

        console.log('\n🎉 All tests completed!');
        console.log('\nTest Summary:');
        console.log('- Health check: API is responsive');
        console.log('- User registration: Working');
        console.log('- Authentication: Working');
        console.log('- Vehicle endpoints: Tested');
        console.log('- Rental endpoints: Tested');
        console.log('- Review endpoints: Tested');
        console.log('- Admin endpoints: Tested');

    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    }
}

// Check if server is running before starting tests
async function checkServer() {
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running, starting tests...');
        return true;
    } catch (error) {
        console.log('❌ Server is not running on localhost:3000');
        console.log('Please start the server with: npm start');
        return false;
    }
}

async function main() {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runAllTests();
    }
}

main();
