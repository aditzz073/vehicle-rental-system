#!/usr/bin/env node

const axios = require('axios');
const mysql = require('mysql2/promise');

// Configuration
const API_BASE = 'http://localhost:3000';
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'autohive'
};

class TokenDebugger {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      this.db = await mysql.createConnection(DB_CONFIG);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.db) {
      await this.db.end();
    }
  }

  async testDatabaseUsers() {
    console.log('\n🔍 Testing Database Users:');
    try {
      const [users] = await this.db.execute('SELECT id, email, full_name, is_admin FROM users LIMIT 5');
      console.log('Database users found:', users.length);
      users.forEach(user => {
        const role = user.is_admin ? 'admin' : 'user';
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${role}`);
      });
      return users.map(user => ({
        ...user,
        role: user.is_admin ? 'admin' : 'user'
      }));
    } catch (error) {
      console.error('❌ Error fetching users:', error.message);
      return [];
    }
  }

  async testLogin(email, password) {
    console.log(`\n🔐 Testing Login for: ${email}`);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });

      console.log('✅ Login successful');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ Login failed');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      return null;
    }
  }

  async testTokenAuthentication(token, endpoint = '/api/rentals') {
    console.log(`\n🎫 Testing Token Authentication for: ${endpoint}`);
    console.log('Token:', token);
    
    // Parse token to understand its format
    if (token && token.includes(':')) {
      const parts = token.split(':');
      console.log('Token parts:', parts.length);
      console.log('  - Part 1 (User ID):', parts[0]);
      console.log('  - Part 2 (Email):', parts[1]);
      console.log('  - Part 3 (Timestamp):', parts[2]);
      
      if (parts[2]) {
        const timestamp = parseInt(parts[2]);
        const date = new Date(timestamp);
        console.log('  - Token created:', date.toISOString());
        console.log('  - Hours ago:', ((Date.now() - timestamp) / (1000 * 60 * 60)).toFixed(2));
      }
    }

    try {
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Token authentication successful');
      console.log('Response status:', response.status);
      console.log('Response data keys:', Object.keys(response.data));
      
      return response.data;
    } catch (error) {
      console.error('❌ Token authentication failed');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
      return null;
    }
  }

  async testAdminEndpoints(token) {
    console.log('\n👑 Testing Admin Endpoints:');
    
    const adminEndpoints = [
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/vehicles',
      '/api/admin/rentals'
    ];

    for (const endpoint of adminEndpoints) {
      console.log(`\nTesting: ${endpoint}`);
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        if (endpoint === '/api/admin/dashboard') {
          console.log('Dashboard data keys:', Object.keys(response.data));
        }
      } catch (error) {
        if (error.response) {
          console.error(`❌ ${endpoint} - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
        } else {
          console.error(`❌ ${endpoint} - Error: ${error.message}`);
        }
      }
    }
  }

  async testUserEndpoints(token) {
    console.log('\n👤 Testing User Endpoints:');
    
    const userEndpoints = [
      '/api/rentals',
      '/api/vehicles',
      '/api/reviews'
    ];

    for (const endpoint of userEndpoints) {
      console.log(`\nTesting: ${endpoint}`);
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        if (Array.isArray(response.data)) {
          console.log(`  - Records returned: ${response.data.length}`);
        } else {
          console.log('  - Response data keys:', Object.keys(response.data));
        }
      } catch (error) {
        if (error.response) {
          console.error(`❌ ${endpoint} - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
        } else {
          console.error(`❌ ${endpoint} - Error: ${error.message}`);
        }
      }
    }
  }

  async checkServerHealth() {
    console.log('\n🏥 Checking Server Health:');
    try {
      const response = await axios.get(`${API_BASE}/api/vehicles`);
      console.log('✅ Server is responding');
      console.log('Status:', response.status);
      return true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('❌ Server is not running on port 3000');
        console.log('💡 Please start the server with: npm start');
        return false;
      } else {
        console.error('❌ Server health check failed:', error.message);
        return false;
      }
    }
  }

  async fullDebugSession() {
    console.log('🚀 Starting Full Token Debug Session');
    console.log('=====================================');

    // Check server health
    const serverRunning = await this.checkServerHealth();
    if (!serverRunning) {
      return;
    }

    // Connect to database
    await this.connect();

    // Test database users
    const users = await this.testDatabaseUsers();
    if (users.length === 0) {
      console.log('❌ No users found in database');
      await this.disconnect();
      return;
    }

    // Test regular user login and endpoints
    const regularUser = users.find(u => u.role === 'user') || users[0];
    if (regularUser) {
      console.log(`\n📧 Testing with user: ${regularUser.email}`);
      
      // Try common passwords
      const passwords = ['password123', 'password', 'test123', 'user123'];
      let userLoginData = null;
      
      for (const password of passwords) {
        userLoginData = await this.testLogin(regularUser.email, password);
        if (userLoginData && userLoginData.token) break;
      }

      if (userLoginData && userLoginData.token) {
        await this.testTokenAuthentication(userLoginData.token);
        await this.testUserEndpoints(userLoginData.token);
      }
    }

    // Test admin user login and endpoints
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      console.log(`\n👑 Testing with admin: ${adminUser.email}`);
      
      const passwords = ['admin123', 'password', 'admin', 'test123'];
      let adminLoginData = null;
      
      for (const password of passwords) {
        adminLoginData = await this.testLogin(adminUser.email, password);
        if (adminLoginData && adminLoginData.token) break;
      }

      if (adminLoginData && adminLoginData.token) {
        await this.testTokenAuthentication(adminLoginData.token, '/api/admin/dashboard');
        await this.testAdminEndpoints(adminLoginData.token);
      }
    }

    await this.disconnect();
    console.log('\n✅ Debug session completed');
  }
}

// Run the debug session
async function main() {
  const tokenDebugger = new TokenDebugger();
  
  try {
    await tokenDebugger.fullDebugSession();
  } catch (error) {
    console.error('💥 Debug session failed:', error.message);
    console.error(error.stack);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
AutoHive Token Debug Script
==========================

Usage: node comprehensive-debug.js [options]

Options:
  --help, -h     Show this help message
  
This script will:
1. Check if the server is running
2. Connect to the database
3. Test user authentication
4. Test token-based API access
5. Test both user and admin endpoints
6. Provide detailed debugging information

Make sure your server is running on port 3000 before running this script.
  `);
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TokenDebugger;
