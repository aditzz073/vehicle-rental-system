// Rental detail page functionality
document.addEventListener('DOMContentLoaded', function() {
    initRentalDetailPage();
});

let rentalData = null;

async function initRentalDetailPage() {
    // Get rental ID from URL
    const pathParts = window.location.pathname.split('/');
    const rentalId = pathParts[pathParts.length - 1];
    
    if (!rentalId || rentalId === 'rental') {
        showError('Invalid rental ID');
        return;
    }
    
    // Check authentication
    const isAuth = await checkAuthentication();
    if (!isAuth) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
    }
    
    // Load rental data
    await loadRentalData(rentalId);
    
    // Initialize action handlers
    initializeActionHandlers();
}

async function loadRentalData(rentalId) {
    try {
        const response = await fetch(`/api/rentals/${rentalId}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            rentalData = data.rental;
            populateRentalDetails();
            showRentalContent();
        } else {
            throw new Error(data.message || 'Failed to load rental details');
        }
    } catch (error) {
        console.error('Error loading rental:', error);
        showError(error.message);
    }
}

function populateRentalDetails() {
    if (!rentalData) return;
    
    // Rental header
    document.getElementById('rental-id').textContent = `#${rentalData.rental_id}`;
    document.getElementById('rental-status').textContent = rentalData.status;
    document.getElementById('rental-status').className = `badge ${getStatusBadgeClass(rentalData.status)}`;
    
    // Vehicle information
    document.getElementById('vehicle-image').src = rentalData.vehicle.image_url || '/images/placeholder-car.jpg';
    document.getElementById('vehicle-image').alt = rentalData.vehicle.model;
    document.getElementById('vehicle-name').textContent = `${rentalData.vehicle.brand} ${rentalData.vehicle.model}`;
    document.getElementById('vehicle-category').textContent = rentalData.vehicle.category;
    document.getElementById('vehicle-year').textContent = rentalData.vehicle.year;
    document.getElementById('vehicle-capacity').textContent = rentalData.vehicle.capacity;
    document.getElementById('vehicle-fuel').textContent = rentalData.vehicle.fuel_type || 'Gasoline';
    document.getElementById('vehicle-transmission').textContent = rentalData.vehicle.transmission || 'Automatic';
    document.getElementById('vehicle-rate').textContent = `$${rentalData.vehicle.daily_rate}/day`;
    
    // Rental information
    document.getElementById('pickup-date').textContent = formatDate(rentalData.start_date);
    document.getElementById('return-date').textContent = formatDate(rentalData.end_date);
    document.getElementById('rental-duration').textContent = calculateDays(rentalData.start_date, rentalData.end_date);
    document.getElementById('pickup-location').textContent = rentalData.pickup_location || 'Not specified';
    document.getElementById('return-location').textContent = rentalData.return_location || 'Not specified';
    document.getElementById('booking-date').textContent = formatDateTime(rentalData.created_at);
    
    // Special requirements
    if (rentalData.special_requirements) {
        document.getElementById('special-requirements-section').style.display = 'block';
        document.getElementById('special-requirements').textContent = rentalData.special_requirements;
    }
    
    // Additional services
    if (rentalData.additional_services && rentalData.additional_services.length > 0) {
        populateAdditionalServices(rentalData.additional_services);
    }
    
    // Payment summary
    document.getElementById('payment-subtotal').textContent = `$${(rentalData.total_amount - rentalData.tax - (rentalData.services_cost || 0)).toFixed(2)}`;
    document.getElementById('payment-services').textContent = `$${(rentalData.services_cost || 0).toFixed(2)}`;
    document.getElementById('payment-tax').textContent = `$${(rentalData.tax || 0).toFixed(2)}`;
    document.getElementById('payment-total').textContent = `$${rentalData.total_amount}`;
    
    // Customer information
    document.getElementById('customer-name').textContent = rentalData.user.full_name;
    document.getElementById('customer-email').textContent = rentalData.user.email;
    document.getElementById('customer-phone').textContent = rentalData.user.phone || 'Not provided';
    
    // Show appropriate action buttons based on status
    showActionButtons(rentalData.status);
}

function populateAdditionalServices(services) {
    const servicesSection = document.getElementById('services-section');
    const servicesList = document.getElementById('services-list');
    
    const serviceNames = {
        insurance: 'Comprehensive Insurance',
        gps: 'GPS Navigation',
        driver: 'Professional Driver',
        delivery: 'Vehicle Delivery'
    };
    
    const serviceIcons = {
        insurance: 'fas fa-shield-alt',
        gps: 'fas fa-map-marked-alt',
        driver: 'fas fa-user-tie',
        delivery: 'fas fa-truck'
    };
    
    servicesList.innerHTML = '';
    
    services.forEach(service => {
        const serviceHtml = `
            <div class="col-md-6 mb-2">
                <div class="d-flex align-items-center">
                    <i class="${serviceIcons[service] || 'fas fa-check'} text-primary me-2"></i>
                    <span>${serviceNames[service] || service}</span>
                </div>
            </div>
        `;
        servicesList.insertAdjacentHTML('beforeend', serviceHtml);
    });
    
    servicesSection.style.display = 'block';
}

function showActionButtons(status) {
    const cancelBtn = document.getElementById('cancel-rental-btn');
    const modifyBtn = document.getElementById('modify-rental-btn');
    const extendBtn = document.getElementById('extend-rental-btn');
    
    // Hide all buttons initially
    cancelBtn.style.display = 'none';
    modifyBtn.style.display = 'none';
    extendBtn.style.display = 'none';
    
    // Show buttons based on rental status
    switch (status.toLowerCase()) {
        case 'confirmed':
        case 'pending':
            cancelBtn.style.display = 'inline-block';
            modifyBtn.style.display = 'inline-block';
            break;
        case 'active':
            extendBtn.style.display = 'inline-block';
            break;
        case 'completed':
        case 'cancelled':
            // No action buttons for completed/cancelled rentals
            break;
    }
}

function initializeActionHandlers() {
    // Cancel rental
    document.getElementById('cancel-rental-btn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('cancelModal'));
        modal.show();
    });
    
    document.getElementById('confirm-cancel-btn').addEventListener('click', cancelRental);
    
    // Modify rental (placeholder)
    document.getElementById('modify-rental-btn').addEventListener('click', function() {
        showAlert('Rental modification feature coming soon!', 'info');
    });
    
    // Extend rental (placeholder)
    document.getElementById('extend-rental-btn').addEventListener('click', function() {
        showAlert('Rental extension feature coming soon!', 'info');
    });
}

async function cancelRental() {
    if (!rentalData) return;
    
    const confirmBtn = document.getElementById('confirm-cancel-btn');
    const originalText = confirmBtn.innerHTML;
    
    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
    
    try {
        const response = await fetch(`/api/rentals/${rentalData.rental_id}/cancel`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('cancelModal'));
            modal.hide();
            
            showAlert('Rental cancelled successfully', 'success');
            
            // Reload page to show updated status
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            throw new Error(data.message || 'Failed to cancel rental');
        }
        
    } catch (error) {
        console.error('Cancel rental error:', error);
        showAlert(error.message, 'danger');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
    }
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning';
        case 'active':
            return 'bg-primary';
        case 'completed':
            return 'bg-info';
        case 'cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return daysDiff;
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

function showRentalContent() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('rental-content').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
}

function showError(message) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('rental-content').style.display = 'none';
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
