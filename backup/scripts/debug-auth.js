// Debug authentication flow
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function testAuthentication() {
    console.log('🔍 Testing authentication flow...\n');
    
    try {
        // Test user login
        console.log('1. Testing user login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'john@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Token:', token);
        
        // Decode token to check format
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        console.log('Decoded token:', decoded);
        const parts = decoded.split(':');
        console.log('Token parts:', parts);
        console.log('User ID:', parts[0]);
        console.log('Email:', parts[1]);
        console.log('Timestamp:', parts[2]);
        
        // Test authenticated endpoint
        console.log('\n2. Testing authenticated endpoint...');
        const authResponse = await axios.get(`${baseURL}/rentals`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Authenticated request successful');
        console.log('Response:', authResponse.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
        }
    }
}

// Test admin authentication
async function testAdminAuth() {
    console.log('\n🔍 Testing admin authentication...\n');
    
    try {
        // Test admin login
        console.log('1. Testing admin login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@autohive.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Admin login successful');
        console.log('Token:', token);
        
        // Test admin endpoint
        console.log('\n2. Testing admin endpoint...');
        const adminResponse = await axios.get(`${baseURL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Admin request successful');
        console.log('Response:', adminResponse.data);
        
    } catch (error) {
        console.error('❌ Admin auth error:', error.response?.data || error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
        }
    }
}

if (require.main === module) {
    testAuthentication()
        .then(() => testAdminAuth())
        .then(() => {
            console.log('\n🎉 Authentication debug completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}
