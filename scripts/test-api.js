#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing AutoHive API endpoints...\n');
    
    try {
        // Test health check
        console.log('1. Testing health check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', health.status === 200 ? 'PASSED' : 'FAILED');
        
        // Test vehicles endpoint
        console.log('\n2. Testing vehicles endpoint...');
        const vehicles = await axios.get(`${BASE_URL}/vehicles`);
        console.log('✅ Vehicles endpoint:', vehicles.status === 200 ? 'PASSED' : 'FAILED');
        console.log(`📊 Found ${vehicles.data.vehicles?.length || 0} vehicles`);
        
        // Test specific vehicle
        if (vehicles.data.vehicles && vehicles.data.vehicles.length > 0) {
            const vehicleId = vehicles.data.vehicles[0].id;
            console.log('\n3. Testing single vehicle endpoint...');
            const vehicle = await axios.get(`${BASE_URL}/vehicles/${vehicleId}`);
            console.log('✅ Single vehicle endpoint:', vehicle.status === 200 ? 'PASSED' : 'FAILED');
        }
        
        // Test search endpoint
        console.log('\n4. Testing vehicle search...');
        const search = await axios.get(`${BASE_URL}/vehicles/search?location=Bangalore`);
        console.log('✅ Vehicle search:', search.status === 200 ? 'PASSED' : 'FAILED');
        console.log(`🔍 Search results: ${search.data.vehicles?.length || 0} vehicles`);
        
        console.log('\n🎉 All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.response?.data || error.message);
        
        // Check if server is running
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running with: npm start');
        }
    }
}

testAPI();
