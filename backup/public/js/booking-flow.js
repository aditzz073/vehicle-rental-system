// Booking Flow JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initBookingFlow();
});

// Global variables
let vehicleData = null;
let availableVehicles = [];
let selectedVehicle = null;
let bookingData = null;
let currentStep = 1;
let preselectedVehicleId = null;

function initBookingFlow() {
    // Check for preselected vehicle from URL
    const urlParams = new URLSearchParams(window.location.search);
    preselectedVehicleId = urlParams.get('vehicle');
    
    // Set default dates
    setDefaultDates();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Check authentication status
    checkAuthenticationStatus();

    // Update progress bar
    updateProgressBar(1);
    
    // If vehicle is preselected, auto-fill the form
    if (preselectedVehicleId) {
        loadPreselectedVehicle(preselectedVehicleId);
    }
}

function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    
    // Set minimum dates
    pickupDate.min = formatDate(today);
    returnDate.min = formatDate(tomorrow);
    
    // Set default values
    pickupDate.value = formatDate(today);
    returnDate.value = formatDate(tomorrow);
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function initFormHandlers() {
    // Step 1: Search form submission
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateSearchForm()) {
            searchVehicles();
        }
    });
    
    // Date change handlers
    const pickupDate = document.getElementById('pickup-date');
    const returnDate = document.getElementById('return-date');
    
    pickupDate.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        returnDate.min = formatDate(nextDay);
        
        if (new Date(returnDate.value) <= selectedDate) {
            returnDate.value = formatDate(nextDay);
        }
    });
    
    // Step 2: Back to search button
    document.getElementById('back-to-search').addEventListener('click', function() {
        goToStep(1);
    });
    
    document.getElementById('modify-search').addEventListener('click', function() {
        goToStep(1);
    });
    
    // Step 3: Back to vehicles button
    document.getElementById('back-to-vehicles').addEventListener('click', function() {
        goToStep(2);
    });
    
    // Additional services handlers
    const serviceCheckboxes = document.querySelectorAll('input[name="additional_services"]');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePricing);
    });
    
    // Complete booking button
    document.getElementById('complete-booking-btn').addEventListener('click', function() {
        if (validateBookingForm()) {
            submitBooking();
        } else {
            const bookingForm = document.getElementById('booking-form');
            bookingForm.classList.add('was-validated');
        }
    });
    
    // Payment form validation
    initPaymentValidation();
}

function validateSearchForm() {
    const searchForm = document.getElementById('search-form');
    searchForm.classList.add('was-validated');
    return searchForm.checkValidity();
}

function validateBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    return bookingForm.checkValidity();
}

function initPaymentValidation() {
    // Card number formatting and validation
    const cardNumber = document.getElementById('card-number');
    cardNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        e.target.value = formattedValue.trim();
    });
    
    // Expiry date formatting
    const expiryDate = document.getElementById('expiry-date');
    expiryDate.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    });
}

async function checkAuthenticationStatus() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            showAlert('Please log in to make a booking', 'warning');
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAlert('Please log in to make a booking', 'warning');
    }
}

async function searchVehicles() {
    // Show loading state
    document.getElementById('vehicles-loading').style.display = 'block';
    document.getElementById('vehicles-container').innerHTML = '';
    document.getElementById('vehicles-error').style.display = 'none';
    document.getElementById('no-vehicles').style.display = 'none';
    
    // Get search parameters
    const vehicleType = document.getElementById('vehicle-type').value;
    const location = document.getElementById('location').value;
    const pickupDate = document.getElementById('pickup-date').value;
    const returnDate = document.getElementById('return-date').value;
    
    // Store the dates for later use
    bookingData = {
        pickup_date: pickupDate,
        return_date: returnDate,
        location: location
    };
    
    try {
        // API call to get available vehicles
        const response = await fetch(`/api/vehicles/available?category=${vehicleType}&location=${encodeURIComponent(location)}&start_date=${pickupDate}&end_date=${returnDate}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load vehicles');
        }
        
        availableVehicles = data.vehicles || [];
        
        // If we have a preselected vehicle ID, make sure it appears at the top
        if (preselectedVehicleId && availableVehicles.length > 0) {
            availableVehicles.sort((a, b) => {
                if (a.vehicle_id.toString() === preselectedVehicleId) return -1;
                if (b.vehicle_id.toString() === preselectedVehicleId) return 1;
                return 0;
            });
        }
        
        // Show step 2
        goToStep(2);
        
        // Display vehicles or empty state
        if (availableVehicles.length === 0) {
            document.getElementById('no-vehicles').style.display = 'block';
        } else {
            renderVehicleCards(availableVehicles);
            
            // If we have a preselected vehicle, highlight it
            if (preselectedVehicleId) {
                const preselectedVehicle = availableVehicles.find(v => v.vehicle_id.toString() === preselectedVehicleId);
                if (preselectedVehicle) {
                    setTimeout(() => {
                        const vehicleCard = document.querySelector(`.vehicle-card[data-vehicle-id="${preselectedVehicleId}"]`);
                        if (vehicleCard) {
                            vehicleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            vehicleCard.classList.add('selected');
                            vehicleCard.style.animation = 'pulse 2s';
                        }
                    }, 500);
                }
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        document.getElementById('vehicles-error').style.display = 'block';
        document.getElementById('error-message').textContent = error.message;
    } finally {
        document.getElementById('vehicles-loading').style.display = 'none';
    }
}

function renderVehicleCards(vehicles) {
    const container = document.getElementById('vehicles-container');
    container.innerHTML = '';
    
    vehicles.forEach(vehicle => {
        const card = createVehicleCard(vehicle);
        container.appendChild(card);
    });
}

function createVehicleCard(vehicle) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const rating = vehicle.rating || 4.5;
    const ratingStars = generateRatingStars(rating);
    
    col.innerHTML = `
        <div class="vehicle-card" data-vehicle-id="${vehicle.vehicle_id}">
            <img src="${vehicle.image_url || '/images/placeholder-car.jpg'}" alt="${vehicle.brand} ${vehicle.model}" class="vehicle-card-image">
            <div class="vehicle-card-body">
                <h5 class="vehicle-card-title">${vehicle.brand} ${vehicle.model}</h5>
                <div class="vehicle-card-rating">
                    ${ratingStars}
                    <span class="rating-text">${rating.toFixed(1)}/5</span>
                </div>
                <div class="vehicle-card-details">
                    <div class="vehicle-detail">
                        <i class="fas fa-calendar"></i> ${vehicle.year}
                    </div>
                    <div class="vehicle-detail">
                        <i class="fas fa-users"></i> ${vehicle.capacity} passengers
                    </div>
                    <div class="vehicle-detail">
                        <i class="fas fa-tag"></i> ${vehicle.category}
                    </div>
                </div>
                <div class="vehicle-card-price">
                    <div>
                        <span class="price-amount">₹${(vehicle.daily_rate * 80).toFixed(2)}</span>
                        <span class="price-period">/ day</span>
                    </div>
                    <button class="btn btn-sm btn-primary select-vehicle-btn">
                        <i class="fas fa-check me-1"></i>Select
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add click event to the card
    const card = col.querySelector('.vehicle-card');
    card.addEventListener('click', function() {
        selectVehicle(vehicle);
    });
    
    return col;
}

function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function selectVehicle(vehicle) {
    selectedVehicle = vehicle;
    
    // Highlight selected card
    const cards = document.querySelectorAll('.vehicle-card');
    cards.forEach(card => {
        if (card.dataset.vehicleId === vehicle.vehicle_id.toString()) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
    
    // Update booking data
    bookingData = {
        ...bookingData,
        vehicle_id: vehicle.vehicle_id,
        daily_rate: vehicle.daily_rate
    };
    
    // Populate confirmation step
    populateVehicleDetails(vehicle);
    
    // Set location values
    document.getElementById('pickup-location').value = bookingData.location;
    document.getElementById('return-location').value = bookingData.location;
    
    // Set dates
    document.getElementById('confirm-pickup-date').value = bookingData.pickup_date;
    document.getElementById('confirm-return-date').value = bookingData.return_date;
    
    // Update pricing
    updatePricing();
    
    // Go to step 3
    setTimeout(() => {
        goToStep(3);
    }, 300);
}

function populateVehicleDetails(vehicle) {
    document.getElementById('summary-vehicle-image').src = vehicle.image_url || '/images/placeholder-car.jpg';
    document.getElementById('summary-vehicle-image').alt = `${vehicle.brand} ${vehicle.model}`;
    document.getElementById('summary-vehicle-name').textContent = `${vehicle.brand} ${vehicle.model}`;
    document.getElementById('summary-vehicle-category').textContent = vehicle.category;
    document.getElementById('summary-vehicle-year').textContent = vehicle.year;
    document.getElementById('summary-vehicle-capacity').textContent = vehicle.capacity;
}

function updatePricing() {
    if (!selectedVehicle || !bookingData) return;
    
    const startDate = new Date(bookingData.pickup_date);
    const endDate = new Date(bookingData.return_date);
    
    // Calculate number of days
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 0) return;
    
    const dailyRate = parseFloat(selectedVehicle.daily_rate);
    const subtotal = dailyRate * daysDiff;
    
    // Calculate additional services cost
    let servicesCost = 0;
    const selectedServices = document.querySelectorAll('input[name="additional_services"]:checked');
    
    selectedServices.forEach(service => {
        switch(service.value) {
            case 'insurance':
                servicesCost += 25 * daysDiff;
                break;
            case 'gps':
                servicesCost += 10 * daysDiff;
                break;
            case 'driver':
                servicesCost += 100 * daysDiff;
                break;
            case 'delivery':
                servicesCost += 50; // One-time fee
                break;
        }
    });
    
    const subtotalWithServices = subtotal + servicesCost;
    const tax = subtotalWithServices * 0.1; // 10% tax
    const total = subtotalWithServices + tax;
     // Update display
    document.getElementById('daily-rate').textContent = `₹${(dailyRate * 80).toFixed(2)}`;
    document.getElementById('num-days').textContent = daysDiff;
    document.getElementById('subtotal').textContent = `₹${(subtotal * 80).toFixed(2)}`;
    document.getElementById('services-cost').textContent = `₹${(servicesCost * 80).toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${(tax * 80).toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${(total * 80).toFixed(2)}`;

    // Update booking data
    bookingData = {
        ...bookingData,
        days: daysDiff,
        subtotal: subtotal * 80,
        services_cost: servicesCost * 80,
        tax: tax * 80,
        total_amount: total * 80,
        additional_services: Array.from(selectedServices).map(s => s.value)
    };
}

async function submitBooking() {
    if (!bookingData || !selectedVehicle) {
        showAlert('Missing booking information', 'danger');
        return;
    }
    
    // Get button and show loading state
    const button = document.getElementById('complete-booking-btn');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    
    try {
        // Collect form data
        const pickupLocation = document.getElementById('pickup-location').value;
        const returnLocation = document.getElementById('return-location').value;
        const specialRequirements = document.getElementById('special-requirements').value;
        
        const rentalData = {
            ...bookingData,
            pickup_location: pickupLocation,
            return_location: returnLocation,
            special_requirements: specialRequirements
        };
        
        // API call to create booking
        const response = await fetch('/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(rentalData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Booking failed');
        }
        
        // Show confirmation screen
        showConfirmation(data.rental);
    } catch (error) {
        console.error('Booking error:', error);
        showAlert(error.message, 'danger');
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

function showConfirmation(rental) {
    // Hide step 3
    document.getElementById('step-3').style.display = 'none';
    
    // Show confirmation screen
    document.getElementById('booking-confirmation').style.display = 'block';
    
    // Update confirmation details
    document.getElementById('booking-id').textContent = rental.rental_id;
    document.getElementById('booking-vehicle').textContent = `${selectedVehicle.brand} ${selectedVehicle.model}`;
    document.getElementById('booking-pickup').textContent = formatDisplayDate(new Date(rental.start_date));
    document.getElementById('booking-return').textContent = formatDisplayDate(new Date(rental.end_date));
    
    // Hide progress bar
    document.querySelector('.booking-progress').style.display = 'none';
}

function formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.booking-step').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show requested step
    document.getElementById(`step-${step}`).style.display = 'block';
    
    // Update progress bar
    updateProgressBar(step);
    
    // Update current step
    currentStep = step;
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateProgressBar(step) {
    // Update progress bar width
    const progress = document.getElementById('progress-bar');
    const percentage = (step - 1) * 50; // 0%, 50%, 100%
    progress.style.width = `${percentage}%`;
    
    // Update step indicators
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        stepEl.classList.remove('active', 'completed');
        
        if (stepNum === step) {
            stepEl.classList.add('active');
        } else if (stepNum < step) {
            stepEl.classList.add('completed');
        }
    });
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertId = 'alert-' + Date.now();
    
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement);
            bsAlert.close();
        }
    }, 5000);
}

// Load preselected vehicle
async function loadPreselectedVehicle(vehicleId) {
    try {
        showAlert('Loading your selected vehicle...', 'info');
        
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            // If the vehicle exists, set the vehicle type in the form
            const vehicleTypeSelect = document.getElementById('vehicle-type');
            const category = data.vehicle.category.toLowerCase();
            
            // Set the vehicle type
            if (Array.from(vehicleTypeSelect.options).some(option => option.value === category)) {
                vehicleTypeSelect.value = category;
            }
            
            // Set focus on the location field
            document.getElementById('location').focus();
            
            showAlert('Vehicle type set! Please complete the search form to continue.', 'success');
        } else {
            console.error('Failed to load preselected vehicle:', data.message);
        }
    } catch (error) {
        console.error('Error loading preselected vehicle:', error);
    }
}
