const db = require('../config/db');

async function testSQL() {
  try {
    console.log('Testing SQL parameter issues...');
    
    // Test 1: Simple vehicle query (this should work)
    console.log('\n=== Test 1: Simple vehicle query ===');
    const [vehicles] = await db.execute('SELECT * FROM vehicles LIMIT 1');
    console.log('✅ Simple vehicle query successful, found:', vehicles.length, 'vehicles');
    
    // Test 2: Review query with LIMIT parameters
    console.log('\n=== Test 2: Review query with LIMIT ===');
    try {
      const query = `
        SELECT r.*, u.full_name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = ?
        ORDER BY r.created_at DESC
        LIMIT ?, ?
      `;
      
      const [reviewRows] = await db.execute(query, [1, 0, 5]);
      console.log('✅ Review query successful, found:', reviewRows.length, 'reviews');
    } catch (error) {
      console.log('❌ Review query failed:', error.message);
      
      // Try alternative LIMIT syntax
      console.log('\n=== Test 2b: Alternative LIMIT syntax ===');
      const altQuery = `
        SELECT r.*, u.full_name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.vehicle_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5 OFFSET 0
      `;
      
      const [altRows] = await db.execute(altQuery, [1]);
      console.log('✅ Alternative query successful, found:', altRows.length, 'reviews');
    }
    
    // Test 3: Vehicle search query
    console.log('\n=== Test 3: Vehicle search query ===');
    try {
      const searchQuery = 'SELECT * FROM vehicles WHERE 1=1 ORDER BY rating DESC, total_reviews DESC LIMIT ?, ?';
      const [searchRows] = await db.execute(searchQuery, [0, 10]);
      console.log('✅ Vehicle search successful, found:', searchRows.length, 'vehicles');
    } catch (error) {
      console.log('❌ Vehicle search failed:', error.message);
      
      // Try without LIMIT parameters
      console.log('\n=== Test 3b: Vehicle search without parameters ===');
      const altSearchQuery = 'SELECT * FROM vehicles WHERE 1=1 ORDER BY rating DESC, total_reviews DESC LIMIT 10';
      const [altSearchRows] = await db.execute(altSearchQuery);
      console.log('✅ Alternative vehicle search successful, found:', altSearchRows.length, 'vehicles');
    }
    
    // Test 4: Review rating summary
    console.log('\n=== Test 4: Review rating summary ===');
    try {
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating
        FROM reviews 
        WHERE vehicle_id = ?
      `;
      
      const [summaryRows] = await db.execute(summaryQuery, [1]);
      console.log('✅ Rating summary successful:', summaryRows[0]);
    } catch (error) {
      console.log('❌ Rating summary failed:', error.message);
    }
    
    console.log('\n=== Tests completed ===');
    
  } catch (error) {
    console.error('Test script error:', error);
  } finally {
    process.exit();
  }
}

testSQL();
