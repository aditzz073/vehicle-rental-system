// Update user passwords with proper bcrypt hashes
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function updateUserPasswords() {
    try {
        // Hash password123
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('Generated hash for password123:', hashedPassword);
        
        // Update all non-admin users with the proper hash
        const query = `
            UPDATE users 
            SET password = ? 
            WHERE is_admin = 0
        `;
        
        const [result] = await db.execute(query, [hashedPassword]);
        console.log('Updated', result.affectedRows, 'user passwords');
        
        // Verify the update
        const [users] = await db.execute('SELECT id, email, password FROM users WHERE is_admin = 0');
        console.log('Updated users:');
        users.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Hash: ${user.password.substring(0, 20)}...`);
        });
        
    } catch (error) {
        console.error('Error updating passwords:', error);
    } finally {
        process.exit(0);
    }
}

updateUserPasswords();
