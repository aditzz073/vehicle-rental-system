// Debug User.findById method
const User = require('../models/User');

async function testFindById() {
    try {
        console.log('Testing User.findById...');
        
        // Test finding user ID 2 (john@example.com)
        const user = await User.findById(2);
        console.log('User found:', user);
        
        if (user) {
            console.log('User properties:');
            console.log('- ID:', user.id);
            console.log('- Email:', user.email);
            console.log('- Full name:', user.full_name);
            console.log('- Is admin:', user.is_admin);
        } else {
            console.log('No user found with ID 2');
        }
        
        // Test finding admin user ID 1
        const admin = await User.findById(1);
        console.log('\nAdmin found:', admin);
        
        if (admin) {
            console.log('Admin properties:');
            console.log('- ID:', admin.id);
            console.log('- Email:', admin.email);
            console.log('- Full name:', admin.full_name);
            console.log('- Is admin:', admin.is_admin);
        }
        
    } catch (error) {
        console.error('Error testing User.findById:', error);
    } finally {
        process.exit(0);
    }
}

testFindById();
