// Script to debug review model issues
require('dotenv').config();
const db = require('../config/db');
const Review = require('../models/Review');

async function debugReview() {
  try {
    console.log('🔍 Debug: Testing Review model methods...');
    
    // Test basic query first
    console.log('\n--- Testing basic query ---');
    const [basicRows] = await db.execute('SELECT * FROM reviews WHERE vehicle_id = ?', [1]);
    console.log('Basic query result:', basicRows.length, 'reviews found');
    
    // Test with explicit parameters
    console.log('\n--- Testing with explicit parameters ---');
    const query = `
      SELECT r.*, u.full_name as user_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.vehicle_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    console.log('Query:', query);
    console.log('Parameters:', [1, 5, 0]);
    
    const [explicitRows] = await db.execute(query, [1, 5, 0]);
    console.log('Explicit query result:', explicitRows.length, 'reviews found');
    
    // Test Review model method
    console.log('\n--- Testing Review.findByVehicleId method ---');
    try {
      const reviews = await Review.findByVehicleId(1, 5, 0);
      console.log('Review.findByVehicleId result:', reviews.length, 'reviews found');
    } catch (error) {
      console.error('Error in Review.findByVehicleId:', error.message);
    }
    
    // Test rating summary
    console.log('\n--- Testing Review.getVehicleRatingSummary ---');
    try {
      const summary = await Review.getVehicleRatingSummary(1);
      console.log('Rating summary:', summary);
    } catch (error) {
      console.error('Error in getVehicleRatingSummary:', error.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugReview();
