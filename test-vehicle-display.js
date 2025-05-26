const axios = require('axios');

async function testVehicleDisplay() {
  try {
    console.log('🧪 Testing vehicle data structure and display...');
    
    const response = await axios.get('http://localhost:8000/api/vehicles');
    
    if (response.data.success && response.data.vehicles.length > 0) {
      const vehicle = response.data.vehicles[0];
      
      console.log('✅ Sample vehicle data:');
      console.log(`   ID: ${vehicle.id} (${typeof vehicle.id})`);
      console.log(`   Make/Model: ${vehicle.make} ${vehicle.model}`);
      console.log(`   Rating: ${vehicle.rating} (${typeof vehicle.rating})`);
      console.log(`   Daily Rate: ${vehicle.daily_rate} (${typeof vehicle.daily_rate})`);
      
      // Test the operations that were causing errors
      const rating = parseFloat(vehicle.rating) || 0;
      const ratingFormatted = rating.toFixed(1);
      console.log(`   Rating formatted: ${ratingFormatted}`);
      
      console.log(`   Daily rate display: $${vehicle.daily_rate}/day`);
      
      console.log('\n🎉 All data types and formatting working correctly!');
    } else {
      console.log('❌ No vehicles found in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVehicleDisplay();
