#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugAPI() {
    console.log('🔍 Debugging AutoHive API endpoints...\n');
    
    try {
        // Test health check
        console.log('1. Testing health check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', health.status === 200 ? 'PASSED' : 'FAILED');
        
        // Test simple vehicles endpoint with no parameters
        console.log('\n2. Testing vehicles endpoint (no params)...');
        try {
            const vehicles = await axios.get(`${BASE_URL}/vehicles`);
            console.log('✅ Vehicles endpoint status:', vehicles.status);
            console.log('📊 Response data keys:', Object.keys(vehicles.data));
            if (vehicles.data.vehicles) {
                console.log(`📊 Found ${vehicles.data.vehicles.length} vehicles`);
            }
        } catch (error) {
            console.error('❌ Vehicles endpoint error:', error.response?.data || error.message);
        }
        
        // Test vehicles search endpoint
        console.log('\n3. Testing search endpoint...');
        try {
            const search = await axios.get(`${BASE_URL}/vehicles/search`);
            console.log('✅ Search endpoint status:', search.status);
            console.log('📊 Search response data keys:', Object.keys(search.data));
        } catch (error) {
            console.error('❌ Search endpoint error:', error.response?.data || error.message);
        }
        
        // Test categories endpoint
        console.log('\n4. Testing categories endpoint...');
        try {
            const categories = await axios.get(`${BASE_URL}/vehicles/categories`);
            console.log('✅ Categories endpoint status:', categories.status);
            console.log('📊 Categories:', categories.data);
        } catch (error) {
            console.error('❌ Categories endpoint error:', error.response?.data || error.message);
        }
        
        // Test featured vehicles
        console.log('\n5. Testing featured vehicles endpoint...');
        try {
            const featured = await axios.get(`${BASE_URL}/vehicles/featured`);
            console.log('✅ Featured endpoint status:', featured.status);
            console.log('📊 Featured vehicles:', featured.data);
        } catch (error) {
            console.error('❌ Featured endpoint error:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ General error:', error.message);
        
        // Check if server is running
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running with: npm start');
        }
    }
}

debugAPI();
