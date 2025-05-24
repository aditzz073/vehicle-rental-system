// Fix all req.session.user references in rental controller
const fs = require('fs');

const filePath = '/Users/aditya/Documents/AutoHive/controllers/rentalController.js';

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

// Replace all instances
content = content.replace(/req\.session\.user\.id/g, 'req.user?.id || req.session?.user?.id');
content = content.replace(/req\.session\.user\.is_admin/g, 'req.user?.is_admin || req.session?.user?.is_admin');

// Write back to file
fs.writeFileSync(filePath, content);

console.log('✅ Fixed all req.session.user references in rental controller');
