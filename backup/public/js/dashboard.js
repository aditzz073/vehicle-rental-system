// Dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    
    // Tab event listeners
    document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const target = e.target.getAttribute('href');
            if (target === '#rentals') {
                loadUserRentals();
            } else if (target === '#reviews') {
                loadUserReviews();
            }
        });
    });
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            populateUserProfile(data.user);
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
        showAlert('Failed to load profile data', 'danger');
    }
}

// Populate user profile form
function populateUserProfile(user) {
    // Update sidebar info
    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('user-email').textContent = user.email;
    
    // Update form fields
    document.getElementById('full_name').value = user.full_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('date_of_birth').value = user.date_of_birth ? user.date_of_birth.split('T')[0] : '';
    document.getElementById('address').value = user.address || '';
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const profileData = {
        full_name: formData.get('full_name'),
        phone: formData.get('phone'),
        date_of_birth: formData.get('date_of_birth'),
        address: formData.get('address')
    };
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
    
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showProfileAlert('Profile updated successfully!', 'success');
            // Update sidebar info
            document.getElementById('user-name').textContent = profileData.full_name;
        } else {
            showProfileAlert(data.message || 'Failed to update profile', 'danger');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        showProfileAlert('Network error. Please try again.', 'danger');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Load user rentals
async function loadUserRentals() {
    try {
        const response = await fetch('/api/rentals/my-rentals', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUserRentals(data.rentals || []);
        } else {
            displayRentalsError();
        }
    } catch (error) {
        console.error('Failed to load rentals:', error);
        displayRentalsError();
    }
}

// Display user rentals
function displayUserRentals(rentals) {
    const container = document.getElementById('user-rentals');
    if (!container) return;
    
    if (rentals.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    You haven't made any rentals yet. 
                    <a href="/vehicles-list" class="alert-link">Browse vehicles</a> to get started.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = rentals.map(rental => `
        <div class="col-md-6 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title mb-0">${rental.vehicle_make} ${rental.vehicle_model}</h6>
                        <span class="badge bg-${getStatusBadgeColor(rental.status)}">${rental.status}</span>
                    </div>
                    
                    <p class="card-text small text-muted mb-2">
                        <i class="fas fa-calendar me-1"></i>
                        ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}
                    </p>
                    
                    <p class="card-text">
                        <strong>Total: ₹${rental.total_amount}</strong>
                    </p>
                    
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewRentalDetails(${rental.rental_id})">
                            <i class="fas fa-eye me-1"></i>View Details
                        </button>
                        ${rental.status === 'confirmed' ? 
                            `<button class="btn btn-sm btn-outline-danger" onclick="cancelRental(${rental.rental_id})">
                                <i class="fas fa-times me-1"></i>Cancel
                            </button>` : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display rentals error
function displayRentalsError() {
    const container = document.getElementById('user-rentals');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Unable to load rentals at the moment. Please try again later.
                </div>
            </div>
        `;
    }
}

// Load user reviews
async function loadUserReviews() {
    try {
        const response = await fetch('/api/reviews/my-reviews', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUserReviews(data.reviews || []);
        } else {
            displayReviewsError();
        }
    } catch (error) {
        console.error('Failed to load reviews:', error);
        displayReviewsError();
    }
}

// Display user reviews
function displayUserReviews(reviews) {
    const container = document.getElementById('user-reviews-container');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    You haven't written any reviews yet.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title mb-0">${review.vehicle_make} ${review.vehicle_model}</h6>
                    <div class="text-warning">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                
                <p class="card-text">${review.comment}</p>
                
                <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    ${new Date(review.created_at).toLocaleDateString()}
                </small>
            </div>
        </div>
    `).join('');
}

// Display reviews error
function displayReviewsError() {
    const container = document.getElementById('user-reviews-container');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Unable to load reviews at the moment. Please try again later.
                </div>
            </div>
        `;
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

// Get badge color for rental status
function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        case 'completed':
            return 'primary';
        default:
            return 'secondary';
    }
}

// View rental details
function viewRentalDetails(rentalId) {
    // You can implement a modal or redirect to a detail page
    window.location.href = `/rental/${rentalId}`;
}

// Cancel rental
async function cancelRental(rentalId) {
    if (!confirm('Are you sure you want to cancel this rental?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/rentals/${rentalId}/cancel`, {
            method: 'PUT',
            credentials: 'include'
        });
        
        if (response.ok) {
            showAlert('Rental cancelled successfully', 'success');
            loadUserRentals(); // Reload rentals
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to cancel rental', 'danger');
        }
    } catch (error) {
        console.error('Cancel rental error:', error);
        showAlert('Network error. Please try again.', 'danger');
    }
}

// Show profile alerts
function showProfileAlert(message, type = 'info') {
    const alertContainer = document.getElementById('profile-alert');
    if (alertContainer) {
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
        alertContainer.classList.remove('d-none');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            alertContainer.classList.add('d-none');
        }, 3000);
    }
}

// Show general alerts
function showAlert(message, type = 'info') {
    // Create alert if it doesn't exist
    let alertContainer = document.getElementById('dashboard-alert');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'dashboard-alert';
        alertContainer.className = 'mb-3';
        document.querySelector('.container').insertBefore(alertContainer, document.querySelector('.container').firstElementChild.nextElementSibling);
    }
    
    alertContainer.className = `alert alert-${type} alert-dismissible fade show mb-3`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
}
