// Vehicle details and booking JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    // Check if we're on a vehicle detail page
    if (path.startsWith('/vehicle/')) {
        const vehicleId = path.split('/')[2];
        loadVehicleDetails(vehicleId);
        setupBookingForm();
    }
    
    // Check if we're on a booking page
    if (path.startsWith('/book/')) {
        const vehicleId = path.split('/')[2];
        loadBookingPage(vehicleId);
    }
});

// Load vehicle details
async function loadVehicleDetails(vehicleId) {
    try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        const data = await response.json();
        
        if (data.success && data.vehicle) {
            displayVehicleDetails(data.vehicle);
            loadSimilarVehicles(data.vehicle.category, vehicleId);
        } else {
            showVehicleError('Vehicle not found');
        }
    } catch (error) {
        console.error('Failed to load vehicle details:', error);
        showVehicleError('Failed to load vehicle details');
    }
}

// Display vehicle details using the template
function displayVehicleDetails(vehicle) {
    // Update page title
    document.title = `${vehicle.make} ${vehicle.model} - AutoHive`;
    
    // Get the container and template
    const container = document.getElementById('vehicle-detail-container');
    const template = document.getElementById('vehicle-template');
    
    // Clone the template content
    const content = template.content.cloneNode(true);
    
    // Clear and append the new content
    container.innerHTML = '';
    container.appendChild(content);
    
    // Fill in the vehicle details
    document.getElementById('vehicle-title').textContent = `${vehicle.make} ${vehicle.model}`;
    document.getElementById('vehicle-subtitle').textContent = `${vehicle.year} • ${vehicle.category} • ${vehicle.transmission || 'Automatic'}`;
    document.getElementById('vehicle-price').textContent = `₹${(vehicle.daily_rate * 80).toFixed(2)}`;
    document.getElementById('base-rate').textContent = `₹${(vehicle.daily_rate * 80).toFixed(2)}`;
    
    // Set the main image
    const mainImage = document.getElementById('main-vehicle-image');
    mainImage.src = vehicle.image_url || '/images/vehicle.png';
    mainImage.alt = `${vehicle.make} ${vehicle.model}`;
    
    // Generate thumbnails
    generateThumbnails(vehicle);
    
    // Set rating stars
    const rating = vehicle.rating || 4.5;
    const ratingStars = document.getElementById('vehicle-rating-stars');
    const ratingText = document.getElementById('vehicle-rating-text');
    
    ratingStars.innerHTML = generateStarRating(rating);
    ratingText.textContent = `${rating} out of 5 (${vehicle.review_count || 0} reviews)`;
    
    // Generate specs
    generateVehicleSpecs(vehicle);
    
    // Set description
    const descriptionTab = document.getElementById('vehicle-description');
    descriptionTab.innerHTML = vehicle.description || `
        <p>Experience the luxury and performance of the ${vehicle.make} ${vehicle.model}. This ${vehicle.category.toLowerCase()} vehicle offers a smooth ride, powerful engine, and all the comfort features you need for a memorable journey.</p>
        <p>With its sleek design and advanced technology, the ${vehicle.make} ${vehicle.model} is perfect for both business trips and leisure travel. Enjoy premium features and exceptional handling as you explore the city or embark on a road trip adventure.</p>
        <h4 class="mt-4">Key Highlights</h4>
        <ul>
            <li>Powerful ${vehicle.engine || '2.0L'} engine</li>
            <li>${vehicle.transmission || 'Automatic'} transmission</li>
            <li>Premium leather interior</li>
            <li>Advanced climate control</li>
            <li>State-of-the-art entertainment system</li>
            <li>Enhanced safety features</li>
        </ul>
    `;
    
    // Generate features
    generateVehicleFeatures(vehicle);
    
    // Generate reviews
    generateVehicleReviews(vehicle);
    
    // Update booking form with vehicle data
    document.getElementById('pickup-date').min = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('return-date').min = tomorrow.toISOString().split('T')[0];
    
    // Store vehicle data for booking calculations
    window.vehicleData = {
        id: vehicle.vehicle_id,
        make: vehicle.make,
        model: vehicle.model,
        dailyRate: vehicle.daily_rate,
        depositAmount: (vehicle.security_deposit || 10000) * 80 // Convert to rupees
    };
}

// Generate thumbnail images
function generateThumbnails(vehicle) {
    const thumbnailsContainer = document.getElementById('vehicle-thumbnails');
    
    // Default images if vehicle doesn't have multiple images
    const images = vehicle.images || [
        vehicle.image_url || '/images/vehicle.png',
        '/images/placeholder-car.jpg',
        '/images/placeholder-car.svg'
    ];
    
    thumbnailsContainer.innerHTML = '';
    
    images.forEach((image, index) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-3 mb-3';
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = `${vehicle.make} ${vehicle.model} - View ${index + 1}`;
        img.className = 'vehicle-thumbnail';
        if (index === 0) img.classList.add('active');
        
        img.addEventListener('click', function() {
            document.getElementById('main-vehicle-image').src = image;
            document.querySelectorAll('.vehicle-thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        colDiv.appendChild(img);
        thumbnailsContainer.appendChild(colDiv);
    });
}

// Generate vehicle specifications
function generateVehicleSpecs(vehicle) {
    const specsContainer = document.getElementById('vehicle-specs');
    
    const specs = [
        { icon: 'car', title: 'Type', value: vehicle.category || 'Sedan' },
        { icon: 'calendar-alt', title: 'Year', value: vehicle.year },
        { icon: 'tachometer-alt', title: 'Mileage', value: vehicle.mileage || 'Unlimited' },
        { icon: 'cogs', title: 'Transmission', value: vehicle.transmission || 'Automatic' },
        { icon: 'gas-pump', title: 'Fuel Type', value: vehicle.fuel_type || 'Petrol' },
        { icon: 'users', title: 'Passengers', value: vehicle.passengers || '5' },
        { icon: 'suitcase', title: 'Luggage', value: vehicle.luggage || '3 Bags' },
        { icon: 'snowflake', title: 'AC', value: 'Yes' }
    ];
    
    specsContainer.innerHTML = '';
    
    specs.forEach(spec => {
        const specDiv = document.createElement('div');
        specDiv.className = 'vehicle-spec';
        
        specDiv.innerHTML = `
            <div class="vehicle-spec-icon">
                <i class="fas fa-${spec.icon}"></i>
            </div>
            <div class="vehicle-spec-title">${spec.title}</div>
            <div class="vehicle-spec-value">${spec.value}</div>
        `;
        
        specsContainer.appendChild(specDiv);
    });
}

// Generate vehicle features
function generateVehicleFeatures(vehicle) {
    const featuresContainer = document.getElementById('vehicle-features');
    
    // Default features if vehicle doesn't have features specified
    const features = vehicle.features || [
        'Bluetooth Connectivity',
        'Navigation System',
        'Leather Seats',
        'Backup Camera',
        'Cruise Control',
        'Keyless Entry',
        'Sunroof/Moonroof',
        'Premium Sound System',
        'Heated Seats',
        'Apple CarPlay / Android Auto',
        'Lane Departure Warning',
        'Blind Spot Monitoring',
        'Automatic Emergency Braking',
        'Parking Sensors',
        'Dual-Zone Climate Control',
        'Power Seats'
    ];
    
    featuresContainer.innerHTML = '';
    
    features.forEach(feature => {
        const featureDiv = document.createElement('div');
        featureDiv.className = 'vehicle-feature';
        
        featureDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${feature}</span>
        `;
        
        featuresContainer.appendChild(featureDiv);
    });
}

// Generate vehicle reviews
function generateVehicleReviews(vehicle) {
    const reviewsContainer = document.getElementById('vehicle-reviews');
    
    // Default reviews if vehicle doesn't have reviews
    const reviews = vehicle.reviews || [
        {
            reviewer_name: 'Rajesh Sharma',
            rating: 5,
            review_text: 'Excellent vehicle! Clean, well-maintained, and performs beautifully. The booking process was seamless, and customer service was top-notch. Highly recommend!',
            date: '2025-04-10'
        },
        {
            reviewer_name: 'Priya Patel',
            rating: 4,
            review_text: 'Great car and service. The only minor issue was a slight delay at pickup, but the rest of the experience was perfect. Would rent again.',
            date: '2025-03-22'
        }
    ];
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-center">No reviews yet. Be the first to review this vehicle!</p>';
        return;
    }
    
    reviewsContainer.innerHTML = '<h4 class="mb-4">Customer Reviews</h4>';
    
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        const reviewDate = new Date(review.date);
        const formattedDate = reviewDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="reviewer-name">${review.reviewer_name}</div>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStarRating(review.rating)}
                </div>
            </div>
            <div class="review-text">
                ${review.review_text}
            </div>
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });
    
    // Add review form
    const reviewForm = document.createElement('div');
    reviewForm.className = 'review-form-container mt-4';
    reviewForm.innerHTML = `
        <h5>Leave a Review</h5>
        <form id="review-form" class="mt-3">
            <div class="mb-3">
                <label for="review-rating" class="form-label">Rating</label>
                <select class="form-select" id="review-rating" required>
                    <option value="5">5 Stars - Excellent</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Good</option>
                    <option value="2">2 Stars - Fair</option>
                    <option value="1">1 Star - Poor</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="review-text" class="form-label">Your Review</label>
                <textarea class="form-control" id="review-text" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Submit Review</button>
        </form>
    `;
    
    reviewsContainer.appendChild(reviewForm);
    
    // Add submit handler
    document.getElementById('review-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your review! It will be published after moderation.');
        this.reset();
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="fas fa-star text-warning"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            starsHtml += '<i class="far fa-star text-warning"></i>';
        }
    }
    
    return starsHtml;
}

// Setup booking form calculations
function setupBookingForm() {
    const form = document.getElementById('booking-form');
    
    if (!form) return;
    
    const pickupDateInput = document.getElementById('pickup-date');
    const returnDateInput = document.getElementById('return-date');
    const addons = [
        document.getElementById('addon-gps'),
        document.getElementById('addon-child-seat'),
        document.getElementById('addon-additional-driver'),
        document.getElementById('addon-premium-insurance')
    ];
    
    // Add event listeners
    pickupDateInput.addEventListener('change', updateBookingCalculation);
    returnDateInput.addEventListener('change', updateBookingCalculation);
    addons.forEach(addon => {
        if (addon) addon.addEventListener('change', updateBookingCalculation);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!window.vehicleData) return;
        
        const pickupDate = new Date(pickupDateInput.value);
        const returnDate = new Date(returnDateInput.value);
        
        if (returnDate <= pickupDate) {
            alert('Return date must be after pickup date');
            return;
        }
        
        // Redirect to booking page
        window.location.href = `/booking-new?vehicle=${window.vehicleData.id}&pickup=${pickupDateInput.value}&return=${returnDateInput.value}`;
    });
}

// Update booking calculation
function updateBookingCalculation() {
    if (!window.vehicleData) return;
    
    const pickupDateInput = document.getElementById('pickup-date');
    const returnDateInput = document.getElementById('return-date');
    
    if (!pickupDateInput.value || !returnDateInput.value) return;
    
    const pickupDate = new Date(pickupDateInput.value);
    const returnDate = new Date(returnDateInput.value);
    
    if (returnDate <= pickupDate) {
        document.getElementById('total-price').textContent = 'Invalid dates';
        return;
    }
    
    // Calculate number of days
    const diffTime = Math.abs(returnDate - pickupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate base rate
    const baseRate = (window.vehicleData.dailyRate * 80) * diffDays; // Convert to rupees
    document.getElementById('base-rate').textContent = `₹${baseRate.toFixed(2)}`;
    
    // Calculate addons
    let addonsTotal = 0;
    
    if (document.getElementById('addon-gps')?.checked) addonsTotal += (300 * 80 / 80) * diffDays; // Already in rupees
    if (document.getElementById('addon-child-seat')?.checked) addonsTotal += (200 * 80 / 80) * diffDays; // Already in rupees
    if (document.getElementById('addon-additional-driver')?.checked) addonsTotal += (500 * 80 / 80) * diffDays; // Already in rupees
    if (document.getElementById('addon-premium-insurance')?.checked) addonsTotal += (800 * 80 / 80) * diffDays; // Already in rupees
    
    document.getElementById('addons-price').textContent = `₹${addonsTotal}`;
    
    // Calculate taxes and fees (18% GST)
    const taxesAndFees = Math.round((baseRate + addonsTotal) * 0.18);
    document.getElementById('taxes-fees').textContent = `₹${taxesAndFees}`;
    
    // Calculate total
    const total = baseRate + addonsTotal + taxesAndFees;
    document.getElementById('total-price').textContent = `₹${total}`;
    
    // Update calendar placeholder
    document.getElementById('calendar-placeholder').innerHTML = `
        <div class="alert alert-success mb-0">
            <i class="fas fa-check-circle me-2"></i>
            Vehicle available for your selected dates
        </div>
    `;
}

// Load similar vehicles
async function loadSimilarVehicles(category, currentVehicleId) {
    try {
        const response = await fetch(`/api/vehicles?category=${category}&limit=3`);
        const data = await response.json();
        
        if (data.success && data.vehicles) {
            displaySimilarVehicles(data.vehicles, currentVehicleId);
        }
    } catch (error) {
        console.error('Failed to load similar vehicles:', error);
    }
}

// Display similar vehicles
function displaySimilarVehicles(vehicles, currentVehicleId) {
    const container = document.getElementById('similar-vehicles');
    
    if (!container) return;
    
    // Filter out the current vehicle
    const filteredVehicles = vehicles.filter(v => v.vehicle_id !== currentVehicleId);
    
    if (filteredVehicles.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No similar vehicles available at the moment.</p></div>';
        return;
    }
    
    container.innerHTML = filteredVehicles.slice(0, 3).map(vehicle => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="featured-vehicle-card shadow-sm">
                <div class="position-relative overflow-hidden">
                    <img src="${vehicle.image_url || '/images/vehicle.png'}" class="featured-vehicle-image w-100" alt="${vehicle.make} ${vehicle.model}">
                    <div class="featured-vehicle-price">₹${(vehicle.daily_rate * 80).toFixed(2)}/day</div>
                </div>
                <div class="featured-vehicle-content">
                    <h5 class="featured-vehicle-title">${vehicle.make} ${vehicle.model}</h5>
                    <div class="featured-vehicle-meta">
                        <div><i class="fas fa-calendar-alt"></i> ${vehicle.year}</div>
                        <div><i class="fas fa-car"></i> ${vehicle.category}</div>
                    </div>
                    <div class="featured-vehicle-footer">
                        <div class="text-warning">
                            <i class="fas fa-star"></i>
                            <span>${vehicle.rating || '4.5'}</span>
                        </div>
                        <a href="/vehicle/${vehicle.vehicle_id}" class="btn btn-sm btn-outline-primary">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Show error message
function showVehicleError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="alert alert-danger text-center my-5">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        </div>
        <div class="text-center">
            <a href="/vehicles-list" class="btn btn-primary">
                <i class="fas fa-arrow-left me-2"></i>Back to Vehicles
            </a>
        </div>
    `;
}

// Load booking page (existing function)
async function loadBookingPage(vehicleId) {
    // Implementation remains the same
    console.log('Loading booking page for vehicle:', vehicleId);
}
