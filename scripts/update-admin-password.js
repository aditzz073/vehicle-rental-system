const bcrypt = require('bcrypt');
const db = require('../config/db');

async function updateAdminPassword() {
    try {
        const password = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'admin@autohive.com']
        );
        
        console.log('✅ Admin password updated successfully');
        console.log('Email: admin@autohive.com');
        console.log('Password: admin123');
        console.log('Hash:', hashedPassword);
        
    } catch (error) {
        console.error('❌ Error updating admin password:', error);
    } finally {
        process.exit();
    }
}

updateAdminPassword();
