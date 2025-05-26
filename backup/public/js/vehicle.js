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
    document.getElementById('vehicle-price').textContent = `₹${vehicle.daily_rate}`;
    document.getElementById('base-rate').textContent = `₹${vehicle.daily_rate}`;
    
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
        depositAmount: vehicle.security_deposit || 10000
    };
    // The HTML block above was invalid JavaScript and has been removed.
    // If you want to render this HTML, assign it to a variable as a template string and inject it into the DOM as needed.
    
    // Find main content area or create one
    let mainContent = document.querySelector('main .container');
    if (!mainContent) {
        mainContent = document.querySelector('.container');
    }
    if (!mainContent) {
        mainContent = document.createElement('main');
        document.body.appendChild(mainContent);
    }
    
    mainContent.innerHTML = detailHTML;
}

// Show vehicle error
function showVehicleError(message) {
    const errorHTML = `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-6 text-center">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <h4>${message}</h4>
                        <p>The vehicle you're looking for could not be found.</p>
                        <a href="/vehicles-list" class="btn btn-primary">
                            <i class="fas fa-arrow-left me-2"></i>Back to Vehicles
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.innerHTML = errorHTML;
}

// Initiate booking process
async function initiateBooking(vehicleId) {
    // Check if user is authenticated
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            // Not logged in, redirect to login
            window.location.href = `/login?redirect=/vehicle/${vehicleId}`;
            return;
        }
        
        // User is logged in, show booking modal or redirect to booking page
        showBookingModal(vehicleId);
        
    } catch (error) {
        console.error('Error checking auth status:', error);
        window.location.href = `/login?redirect=/vehicle/${vehicleId}`;
    }
}

// Show booking modal
function showBookingModal(vehicleId) {
    const modalHTML = `
        <div class="modal fade" id="bookingModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Book Vehicle</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="booking-form">
                            <div class="mb-3">
                                <label for="start_date" class="form-label">Start Date</label>
                                <input type="date" class="form-control" id="start_date" name="start_date" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="end_date" class="form-label">End Date</label>
                                <input type="date" class="form-control" id="end_date" name="end_date" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="pickup_location" class="form-label">Pickup Location</label>
                                <input type="text" class="form-control" id="pickup_location" name="pickup_location" 
                                       placeholder="Enter pickup location" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="return_location" class="form-label">Return Location</label>
                                <input type="text" class="form-control" id="return_location" name="return_location" 
                                       placeholder="Enter return location" required>
                            </div>
                            
                            <div id="booking-summary" class="alert alert-info d-none">
                                <h6>Booking Summary</h6>
                                <p id="summary-details"></p>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="calculateBooking(${vehicleId})">
                            Calculate Cost
                        </button>
                        <button type="button" class="btn btn-success d-none" id="confirm-booking-btn" 
                                onclick="confirmBooking(${vehicleId})">
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('bookingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start_date').min = today;
    document.getElementById('end_date').min = today;
    
    // Update end date minimum when start date changes
    document.getElementById('start_date').addEventListener('change', function() {
        document.getElementById('end_date').min = this.value;
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
}

// Calculate booking cost
async function calculateBooking(vehicleId) {
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    
    const bookingData = {
        vehicle_id: vehicleId,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        pickup_location: formData.get('pickup_location'),
        return_location: formData.get('return_location')
    };
    
    // Validate dates
    if (!bookingData.start_date || !bookingData.end_date) {
        alert('Please select both start and end dates');
        return;
    }
    
    if (new Date(bookingData.start_date) >= new Date(bookingData.end_date)) {
        alert('End date must be after start date');
        return;
    }
    
    try {
        const response = await fetch('/api/rentals/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayBookingSummary(data.calculation);
            document.getElementById('confirm-booking-btn').classList.remove('d-none');
        } else {
            alert(data.message || 'Failed to calculate booking cost');
        }
        
    } catch (error) {
        console.error('Calculation error:', error);
        alert('Network error. Please try again.');
    }
}

// Display booking summary
function displayBookingSummary(calculation) {
    const summaryContainer = document.getElementById('booking-summary');
    const summaryDetails = document.getElementById('summary-details');
    
    summaryDetails.innerHTML = `
        <strong>Duration:</strong> ${calculation.days} days<br>
        <strong>Daily Rate:</strong> ₹${calculation.daily_rate}<br>
        <strong>Subtotal:</strong> ₹${calculation.subtotal}<br>
        <strong>Tax:</strong> ₹${calculation.tax}<br>
        <strong>Total Amount:</strong> ₹${calculation.total_amount}
    `;
    
    summaryContainer.classList.remove('d-none');
}

// Confirm booking
async function confirmBooking(vehicleId) {
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    
    const bookingData = {
        vehicle_id: vehicleId,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        pickup_location: formData.get('pickup_location'),
        return_location: formData.get('return_location')
    };
    
    const confirmBtn = document.getElementById('confirm-booking-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Booking...';
    
    try {
        const response = await fetch('/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(bookingData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            modal.hide();
            
            // Show success message
            showAlert('Booking confirmed successfully!', 'success');
            
            // Redirect to dashboard or booking confirmation page
            setTimeout(() => {
                window.location.href = `/rental/${data.rental.rental_id}`;
            }, 2000);
            
        } else {
            alert(data.message || 'Failed to confirm booking');
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('Network error. Please try again.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Show general alerts
function showAlert(message, type = 'info') {
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHTML);
    }
}
