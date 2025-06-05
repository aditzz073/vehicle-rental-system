// Booking page functionality
document.addEventListener('DOMContentLoaded', function() {
    initBookingPage();
});

let vehicleData = null;
let bookingData = null;

async function initBookingPage() {
    // Get vehicle ID from URL
    const pathParts = window.location.pathname.split('/');
    const vehicleId = pathParts[pathParts.length - 1];
    
    if (!vehicleId || vehicleId === 'book') {
        showError('Invalid vehicle ID');
        return;
    }
    
    // Check authentication
    const isAuth = await checkAuthentication();
    if (!isAuth) {
        // Redirect to login with return URL
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
    }
    
    // Load vehicle data
    await loadVehicleData(vehicleId);
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Set default dates (today and tomorrow)
    setDefaultDates();
}

async function loadVehicleData(vehicleId) {
    try {
        const response = await fetch(`/api/vehicles/${vehicleId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            vehicleData = data.vehicle;
            populateVehicleDetails();
            updatePricing();
            showBookingContent();
        } else {
            throw new Error(data.message || 'Failed to load vehicle');
        }
    } catch (error) {
        console.error('Error loading vehicle:', error);
        showError(error.message);
    }
}

function populateVehicleDetails() {
    document.getElementById('vehicle-image').src = vehicleData.image_url || '/images/placeholder-car.jpg';
    document.getElementById('vehicle-image').alt = vehicleData.model;
    document.getElementById('vehicle-name').textContent = `${vehicleData.brand} ${vehicleData.model}`;
    document.getElementById('vehicle-category').textContent = vehicleData.category;
    document.getElementById('vehicle-year').textContent = vehicleData.year;
    document.getElementById('vehicle-capacity').textContent = vehicleData.capacity;
    document.getElementById('daily-rate').textContent = `₹${(vehicleData.daily_rate * 80).toFixed(2)}`;
}

function initializeFormHandlers() {
    // Date change handlers
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    
    startDateInput.addEventListener('change', updatePricing);
    endDateInput.addEventListener('change', updatePricing);
    
    // Additional services handlers
    const serviceCheckboxes = document.querySelectorAll('input[name="additional_services"]');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePricing);
    });
    
    // Confirm booking button
    document.getElementById('confirm-booking-btn').addEventListener('click', showConfirmationModal);
    
    // Final confirmation button
    document.getElementById('final-confirm-btn').addEventListener('click', submitBooking);
    
    // Form validation
    const form = document.getElementById('booking-form');
    form.addEventListener('input', validateForm);
}

function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startDate = document.getElementById('start_date');
    const endDate = document.getElementById('end_date');
    
    startDate.value = today.toISOString().split('T')[0];
    startDate.min = today.toISOString().split('T')[0];
    
    endDate.value = tomorrow.toISOString().split('T')[0];
    endDate.min = tomorrow.toISOString().split('T')[0];
    
    // Update end date minimum when start date changes
    startDate.addEventListener('change', function() {
        const selectedStart = new Date(this.value);
        const minEnd = new Date(selectedStart);
        minEnd.setDate(minEnd.getDate() + 1);
        endDate.min = minEnd.toISOString().split('T')[0];
        
        if (new Date(endDate.value) <= selectedStart) {
            endDate.value = minEnd.toISOString().split('T')[0];
        }
    });
}

function updatePricing() {
    if (!vehicleData) return;
    
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    
    if (!startDate || !endDate) {
        resetPricing();
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) {
        resetPricing();
        return;
    }
    
    const dailyRate = parseFloat(vehicleData.daily_rate);
    const subtotal = (dailyRate * 80) * daysDiff; // Convert to rupees
    
    // Calculate additional services cost
    let servicesCost = 0;
    const selectedServices = document.querySelectorAll('input[name="additional_services"]:checked');
    
    selectedServices.forEach(service => {
        switch(service.value) {
            case 'insurance':
                servicesCost += (25 * 80) * daysDiff; // Convert to rupees
                break;
            case 'gps':
                servicesCost += (10 * 80) * daysDiff; // Convert to rupees
                break;
            case 'driver':
                servicesCost += (100 * 80) * daysDiff; // Convert to rupees
                break;
            case 'delivery':
                servicesCost += (50 * 80); // One-time fee in rupees
                break;
        }
    });
    
    const subtotalWithServices = subtotal + servicesCost;
    const tax = subtotalWithServices * 0.1; // 10% tax
    const total = subtotalWithServices + tax;
    
    // Update display
    document.getElementById('num-days').textContent = daysDiff;
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('services-cost').textContent = `₹${servicesCost.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
    document.getElementById('modal-total').textContent = `₹${total.toFixed(2)}`;
    
    // Store booking data
    bookingData = {
        vehicle_id: vehicleData.vehicle_id,
        start_date: startDate,
        end_date: endDate,
        days: daysDiff,
        daily_rate: dailyRate,
        subtotal: subtotal,
        services_cost: servicesCost,
        tax: tax,
        total_amount: total,
        additional_services: Array.from(selectedServices).map(s => s.value)
    };
}

function resetPricing() {
    document.getElementById('num-days').textContent = '0';
    document.getElementById('subtotal').textContent = '₹0';
    document.getElementById('services-cost').textContent = '₹0';
    document.getElementById('tax-amount').textContent = '₹0';
    document.getElementById('total-amount').textContent = '₹0';
    document.getElementById('modal-total').textContent = '₹0';
    bookingData = null;
}

function validateForm() {
    const form = document.getElementById('booking-form');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    const termsCheckbox = document.getElementById('terms');
    
    const isValid = form.checkValidity() && 
                   termsCheckbox.checked && 
                   bookingData && 
                   bookingData.total_amount > 0;
    
    confirmBtn.disabled = !isValid;
}

function showConfirmationModal() {
    if (!bookingData) {
        showAlert('Please select valid dates', 'warning');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

async function submitBooking() {
    if (!bookingData) return;
    
    const finalConfirmBtn = document.getElementById('final-confirm-btn');
    const originalText = finalConfirmBtn.innerHTML;
    
    // Show loading state
    finalConfirmBtn.disabled = true;
    finalConfirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Collect form data
        const formData = new FormData(document.getElementById('booking-form'));
        
        const rentalData = {
            ...bookingData,
            pickup_location: formData.get('pickup_location'),
            return_location: formData.get('return_location'),
            special_requirements: formData.get('special_requirements')
        };
        
        const response = await fetch('/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(rentalData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
            modal.hide();
            
            showAlert('Booking confirmed successfully!', 'success');
            
            // Redirect to rental details page
            setTimeout(() => {
                window.location.href = `/rental/${data.rental.rental_id}`;
            }, 2000);
            
        } else {
            throw new Error(data.message || 'Booking failed');
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        showAlert(error.message, 'danger');
    } finally {
        finalConfirmBtn.disabled = false;
        finalConfirmBtn.innerHTML = originalText;
    }
}

async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function showBookingContent() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('booking-content').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
}

function showError(message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('booking-content').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('error-message').textContent = message;
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
            const alert = new bootstrap.Alert(alertElement);
            alert.close();
        }
    }, 5000);
}
