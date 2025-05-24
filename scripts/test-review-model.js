const Review = require('../models/Review');

async function testReviewModel() {
  try {
    console.log('Testing Review model methods...');
    
    // Test findByVehicleId method
    console.log('\n=== Testing findByVehicleId ===');
    const reviews = await Review.findByVehicleId(1, 5, 0);
    console.log('✅ findByVehicleId successful, found:', reviews.length, 'reviews');
    
    // Test getVehicleRatingSummary method
    console.log('\n=== Testing getVehicleRatingSummary ===');
    const summary = await Review.getVehicleRatingSummary(1);
    console.log('✅ getVehicleRatingSummary successful:', summary);
    
  } catch (error) {
    console.error('❌ Review model test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit();
  }
}

testReviewModel();
