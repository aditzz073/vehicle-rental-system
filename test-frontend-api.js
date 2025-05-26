const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('Testing API connection from frontend perspective...');
    
    // Test the vehicles endpoint
    const response = await axios.get('http://localhost:8000/api/vehicles');
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Success:', response.data.success);
    console.log('✅ Number of vehicles:', response.data.vehicles?.length || 0);
    console.log('✅ Pagination pages:', response.data.pagination?.pages || 'N/A');
    
    if (response.data.vehicles && response.data.vehicles.length > 0) {
      const firstVehicle = response.data.vehicles[0];
      console.log('✅ First vehicle:', {
        id: firstVehicle.id,
        make: firstVehicle.make,
        model: firstVehicle.model,
        daily_rate: firstVehicle.daily_rate,
        category: firstVehicle.category
      });
    }
    
    console.log('\n🎉 Frontend API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendAPI();
