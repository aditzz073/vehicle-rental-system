const Vehicle = require('../models/Vehicle');

// Mapping of vehicle database IDs to uploaded image files
const vehicleImageMapping = {
  1: '/images/vehicles/bmwx5.jpg',              // BMW X5
  2: '/images/vehicles/audiA4.jpg',             // Audi A4  
  3: '/images/vehicles/mercedes-benz.webp',     // Mercedes-Benz C-Class
  4: '/images/vehicles/HondaCity.webp',         // Honda City
  5: '/images/vehicles/toyota-fortuner.webp',   // Toyota Fortuner
  6: '/images/vehicles/Hyundai-i20.jpg',        // Hyundai i20
  7: '/images/vehicles/swift.webp',             // Maruti Suzuki Swift
  8: '/images/vehicles/Mahindra-Thar.webp'      // Mahindra Thar
};

async function updateVehicleImages() {
  try {
    console.log('Starting vehicle image updates...\n');
    
    for (const [vehicleId, imageUrl] of Object.entries(vehicleImageMapping)) {
      try {
        // Get the current vehicle data
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
          console.log(`❌ Vehicle ID ${vehicleId} not found`);
          continue;
        }
        
        // Update the vehicle with the image URL
        const updateData = {
          ...vehicle,
          image_url: imageUrl
        };
        
        const success = await Vehicle.update(vehicleId, updateData);
        
        if (success) {
          console.log(`✅ Updated ${vehicle.make} ${vehicle.model} with image: ₹{(imageUrl * 80).toFixed(2)}`);
        } else {
          console.log(`❌ Failed to update ${vehicle.make} ${vehicle.model}`);
        }
      } catch (error) {
        console.error(`❌ Error updating vehicle ID ${vehicleId}:`, error.message);
      }
    }
    
    console.log('\n🎉 Vehicle image updates completed!');
    
    // Verify the updates
    console.log('\n📋 Verification - Updated vehicles:');
    const updatedVehicles = await Vehicle.getAllVehicles();
    updatedVehicles.forEach(v => {
      console.log(`   ${v.make} ${v.model}: ${v.image_url || 'No image'}`);
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
  
  process.exit(0);
}

// Run the update
updateVehicleImages();
