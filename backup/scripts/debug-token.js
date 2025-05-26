// Simple authentication debug script
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function debugAuth() {
    console.log('🔍 Debugging authentication flow...\n');
    
    try {
        // Step 1: Test admin login
        console.log('1. Testing admin login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'admin@autohive.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('Raw token:', token);
        
        // Step 2: Decode and analyze token
        console.log('\n2. Analyzing token...');
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        console.log('Decoded token:', decoded);
        
        const parts = decoded.split(':');
        console.log('Token parts:', parts);
        console.log('- User ID:', parts[0]);
        console.log('- Email:', parts[1]);
        console.log('- Timestamp:', parts[2]);
        
        // Step 3: Test simple authenticated endpoint (health check with auth header)
        console.log('\n3. Testing authentication header format...');
        console.log('Authorization header will be:', `Bearer ${token}`);
        
        // Step 4: Test admin endpoint with detailed logging
        console.log('\n4. Testing admin dashboard endpoint...');
        
        const config = {
            method: 'GET',
            url: `${baseURL}/admin/dashboard`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        console.log('Request config:', JSON.stringify(config, null, 2));
        
        const adminResponse = await axios(config);
        console.log('✅ Admin request successful');
        console.log('Response data keys:', Object.keys(adminResponse.data));
        
    } catch (error) {
        console.error('❌ Error occurred:');
        console.error('Status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Error message:', error.message);
        
        if (error.response?.data) {
            console.log('\nDetailed error analysis:');
            console.log('- Success:', error.response.data.success);
            console.log('- Message:', error.response.data.message);
            console.log('- Error code:', error.response.data.error_code);
        }
    }
}

// Test a regular user too
async function debugUserAuth() {
    console.log('\n🔍 Testing user authentication...\n');
    
    try {
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            email: 'john@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ User login successful');
        
        const rentalResponse = await axios.get(`${baseURL}/rentals`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ User rental request successful');
        console.log('Found', rentalResponse.data.rentals?.length || 0, 'rentals');
        
    } catch (error) {
        console.error('❌ User auth error:', error.response?.data || error.message);
    }
}

if (require.main === module) {
    debugAuth()
        .then(() => debugUserAuth())
        .then(() => {
            console.log('\n🎉 Debug completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error.message);
            process.exit(1);
        });
}
