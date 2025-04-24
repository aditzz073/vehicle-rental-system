/**
 * Dashboard JavaScript file for the Vehicle Rental System
 * Handles user dashboard functionality, profile management, rentals, and reviews
 */

// Global variables
let currentUser = null;
let userRentals = {
  active: [],
  completed: [],
  cancelled: []
};
let userReviews = [];

document.addEventListener('DOMContentLoaded', function() {
  initDashboard();
});

/**
 * Initialize the dashboard
 */
function initDashboard() {
  // Load user data
  loadUserProfile();
  
  // Add event listeners
  addDashboardEventListeners();
  
  // Check for URL parameters
  checkUrlParameters();
}

/**
 * Add event listeners for the dashboard page
 */
function addDashboardEventListeners() {
  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  }
  
  // Rating stars in review modal
  const ratingStars = document.querySelectorAll('.rating i');
  ratingStars.forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.dataset.rating);
      document.getElementById('review-rating').value = rating;
      
      // Update star display
      ratingStars.forEach((s, index) => {
        if (index < rating) {
          s.className = 'fas fa-star';
        } else {
          s.className = 'far fa-star';
        }
      });
    });
    
    star.addEventListener('mouseover', function() {
      const rating = parseInt(this.dataset.rating);
      
      ratingStars.forEach((s, index) => {
        if (index < rating) {
          s.className = 'fas fa-star';
        } else {
          s.className = 'far fa-star';
        }
      });
    });
    
    star.addEventListener('mouseout', function() {
      const currentRating = parseInt(document.getElementById('review-rating').value);
      
      ratingStars.forEach((s, index) => {
        if (index < currentRating) {
          s.className = 'fas fa-star';
        } else {
          s.className = 'far fa-star';
        }
      });
    });
  });
  
  // Submit review button
  const submitReviewButton = document.getElementById('submit-review');
  if (submitReviewButton) {
    submitReviewButton.addEventListener('click', submitReview);
  }
  
  // Submit payment button
  const submitPaymentButton = document.getElementById('submit-payment');
  if (submitPaymentButton) {
    submitPaymentButton.addEventListener('click', submitPayment);
  }
  
  // Tab switching - load data when tab is activated
  document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function(e) {
      const targetId = e.target.getAttribute('href');
      
      if (targetId === '#rentals') {
        loadUserRentals();
      } else if (targetId === '#reviews') {
        loadUserReviews();
      }
    });
  });
}

/**
 * Check for URL parameters to show alerts or messages
 */
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for rental success message
  if (urlParams.get('rentalSuccess') === 'true') {
    const rentalId = urlParams.get('rentalId');
    showSuccess(`Rental #${rentalId} created successfully! Please proceed with payment.`, 'profile-alert');
    
    // Navigate to rentals tab
    const rentalsTab = document.querySelector('a[href="#rentals"]');
    if (rentalsTab) {
      const tab = new bootstrap.Tab(rentalsTab);
      tab.show();
    }
  }
  
  // Check for payment success message
  if (urlParams.get('paymentSuccess') === 'true') {
    showSuccess('Payment completed successfully!', 'profile-alert');
  }
  
  // Check for review success message
  if (urlParams.get('reviewSuccess') === 'true') {
    showSuccess('Review submitted successfully!', 'profile-alert');
  }
}

/**
 * Load the user's profile data
 */
function loadUserProfile() {
  fetch('/auth/profile')
    .then(response => {
      if (!response.ok) {
        window.location.href = '/login';
        throw new Error('Not authenticated');
      }
      return response.json();
    })
    .then(user => {
      currentUser = user;
      
      // Update user name in sidebar
      document.getElementById('user-name').textContent = `${user.first_name} ${user.last_name}`;
      document.getElementById('user-email').textContent = user.email;
      
      // Fill profile form
      document.getElementById('first_name').value = user.first_name || '';
      document.getElementById('last_name').value = user.last_name || '';
      document.getElementById('username').value = user.username || '';
      document.getElementById('email').value = user.email || '';
      document.getElementById('phone').value = user.phone || '';
      document.getElementById('address').value = user.address || '';
      
      // Load rentals
      loadUserRentals();
    })
    .catch(error => {
      console.error('Error loading user profile:', error);
    });
}

/**
 * Load the user's rental history
 */
function loadUserRentals() {
  fetch('/rentals/user')
    .then(response => response.json())
    .then(rentals => {
      // Group rentals by status
      userRentals.active = rentals.filter(r => r.status === 'active' || r.status === 'pending');
      userRentals.completed = rentals.filter(r => r.status === 'completed');
      userRentals.cancelled = rentals.filter(r => r.status === 'cancelled');
      
      // Render rentals
      renderRentals('active', userRentals.active);
      renderRentals('completed', userRentals.completed);
      renderRentals('cancelled', userRentals.cancelled);
    })
    .catch(error => {
      console.error('Error loading user rentals:', error);
      
      document.getElementById('active-rentals-container').innerHTML = `
        <div class="alert alert-danger">Failed to load rentals. Please try again later.</div>
      `;
      document.getElementById('completed-rentals-container').innerHTML = `
        <div class="alert alert-danger">Failed to load rentals. Please try again later.</div>
      `;
      document.getElementById('cancelled-rentals-container').innerHTML = `
        <div class="alert alert-danger">Failed to load rentals. Please try again later.</div>
      `;
    });
}

/**
 * Render rentals based on status
 * @param {string} status - The rental status ('active', 'completed', 'cancelled')
 * @param {Array} rentals - Array of rental objects
 */
function renderRentals(status, rentals) {
  const containerId = `${status}-rentals-container`;
  const container = document.getElementById(containerId);
  
  if (!container) return;
  
  if (!rentals || rentals.length === 0) {
    container.innerHTML = `<div class="alert alert-info">No ${status} rentals found.</div>`;
    return;
  }
  
  let html = '';
  
  rentals.forEach(rental => {
    const vehicle = rental.vehicle;
    const statusClass = getStatusClass(rental.status);
    const isPending = rental.status === 'pending';
    const isCompleted = rental.status === 'completed';
    const hasReview = rental.has_review;
    
    html += `
      <div class="card mb-3 rental-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Rental #${rental.rental_id}</h6>
          <span class="badge ${statusClass}">${rental.status.toUpperCase()}</span>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-2">
              <img src="${vehicle.image_url || '/images/default-vehicle.jpg'}" class="img-fluid rounded" alt="${vehicle.make} ${vehicle.model}">
            </div>
            <div class="col-md-6">
              <h5>${vehicle.make} ${vehicle.model} (${vehicle.year})</h5>
              <p class="mb-1"><i class="fas fa-calendar-alt me-2"></i> ${formatDate(rental.start_date)} - ${formatDate(rental.end_date)}</p>
              <p class="mb-1"><i class="fas fa-car me-2"></i> ${vehicle.vehicle_type}</p>
              <p class="mb-0"><i class="fas fa-money-bill-wave me-2"></i> Total: ${formatCurrency(rental.total_cost)}</p>
            </div>
            <div class="col-md-4 text-end d-flex flex-column justify-content-between">
              <div class="payment-status mb-2">
                ${rental.payment_status ? `<span class="badge bg-success">Paid</span>` : `<span class="badge bg-warning text-dark">Payment Pending</span>`}
              </div>
              <div class="action-buttons">
                ${isPending && !rental.payment_status ? `<button class="btn btn-primary btn-sm" onclick="openPaymentModal(${rental.rental_id}, ${rental.total_cost})">Pay Now</button>` : ''}
                ${isPending ? `<button class="btn btn-danger btn-sm ms-2" onclick="cancelRental(${rental.rental_id})">Cancel</button>` : ''}
                ${isCompleted && !hasReview ? `<button class="btn btn-outline-primary btn-sm" onclick="openReviewModal(${rental.rental_id}, '${vehicle.make} ${vehicle.model}')">Write Review</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Get the status badge class based on rental status
 * @param {string} status - The rental status
 * @returns {string} The CSS class for the status badge
 */
function getStatusClass(status) {
  switch (status) {
    case 'active':
      return 'bg-success';
    case 'pending':
      return 'bg-warning text-dark';
    case 'completed':
      return 'bg-info';
    case 'cancelled':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

/**
 * Load the user's reviews
 */
function loadUserReviews() {
  fetch('/reviews/user')
    .then(response => response.json())
    .then(reviews => {
      userReviews = reviews;
      renderUserReviews(reviews);
    })
    .catch(error => {
      console.error('Error loading user reviews:', error);
      
      document.getElementById('user-reviews-container').innerHTML = `
        <div class="alert alert-danger">Failed to load reviews. Please try again later.</div>
      `;
    });
}

/**
 * Render the user's reviews
 * @param {Array} reviews - Array of review objects
 */
function renderUserReviews(reviews) {
  const container = document.getElementById('user-reviews-container');
  
  if (!container) return;
  
  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<div class="alert alert-info">You haven\'t written any reviews yet.</div>';
    return;
  }
  
  let html = '';
  
  reviews.forEach(review => {
    const vehicle = review.vehicle;
    
    html += `
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">${vehicle.make} ${vehicle.model} (${vehicle.year})</h6>
          <small class="text-muted">${formatDate(review.created_at)}</small>
        </div>
        <div class="card-body">
          <div class="mb-3">
            ${generateStarRating(review.rating)}
          </div>
          <p class="card-text">${review.comment || 'No comment provided.'}</p>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteReview(${review.review_id})">
            <i class="fas fa-trash-alt me-1"></i> Delete
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Handle profile form submission
 * @param {Event} e - The form submission event
 */
function handleProfileUpdate(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = Object.fromEntries(formData.entries());
  
  fetch('/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      address: userData.address
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to update profile');
        });
      }
      return response.json();
    })
    .then(data => {
      showSuccess('Profile updated successfully', 'profile-alert');
      
      // Update user name in sidebar
      document.getElementById('user-name').textContent = `${userData.first_name} ${userData.last_name}`;
    })
    .catch(error => {
      showError(error.message, 'profile-alert');
    });
}

/**
 * Open the payment modal for a rental
 * @param {number} rentalId - The ID of the rental
 * @param {number} amount - The payment amount
 */
function openPaymentModal(rentalId, amount) {
  const modal = new bootstrap.Modal(document.getElementById('payment-modal'));
  
  document.getElementById('payment-rental-id').value = rentalId;
  document.getElementById('payment-amount').value = amount.toFixed(2);
  document.getElementById('payment-alert').classList.add('d-none');
  
  modal.show();
}

/**
 * Submit a payment
 */
function submitPayment() {
  const rentalId = document.getElementById('payment-rental-id').value;
  const paymentMethod = document.getElementById('payment-method').value;
  
  // Additional validation for credit card details
  if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
    const cardNumber = document.getElementById('card-number').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    
    if (!cardNumber || !expiryDate || !cvv) {
      document.getElementById('payment-alert').textContent = 'Please fill in all card details';
      document.getElementById('payment-alert').classList.remove('d-none');
      return;
    }
  }
  
  // Send payment request
  fetch('/rentals/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rental_id: rentalId,
      payment_method: paymentMethod
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Payment failed');
        });
      }
      return response.json();
    })
    .then(data => {
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('payment-modal'));
      modal.hide();
      
      // Reload rentals
      loadUserRentals();
      
      // Show success message
      showSuccess('Payment completed successfully', 'profile-alert');
    })
    .catch(error => {
      document.getElementById('payment-alert').textContent = error.message;
      document.getElementById('payment-alert').classList.remove('d-none');
    });
}

/**
 * Cancel a rental
 * @param {number} rentalId - The ID of the rental
 */
function cancelRental(rentalId) {
  if (!confirm('Are you sure you want to cancel this rental?')) {
    return;
  }
  
  fetch(`/rentals/${rentalId}/cancel`, {
    method: 'PUT',
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to cancel rental');
        });
      }
      return response.json();
    })
    .then(data => {
      showSuccess(data.message || 'Rental cancelled successfully', 'profile-alert');
      loadUserRentals();
    })
    .catch(error => {
      showError(error.message, 'profile-alert');
    });
}

/**
 * Open the review modal
 * @param {number} rentalId - The ID of the rental
 * @param {string} vehicleName - The name of the vehicle
 */
function openReviewModal(rentalId, vehicleName) {
  const modal = new bootstrap.Modal(document.getElementById('review-modal'));
  
  document.getElementById('review-rental-id').value = rentalId;
  document.getElementById('review-vehicle').value = vehicleName;
  document.getElementById('review-rating').value = 0;
  document.getElementById('review-comment').value = '';
  document.getElementById('review-alert').classList.add('d-none');
  
  // Reset star rating
  document.querySelectorAll('.rating i').forEach(star => {
    star.className = 'far fa-star';
  });
  
  modal.show();
}

/**
 * Submit a review
 */
function submitReview() {
  const rentalId = document.getElementById('review-rental-id').value;
  const rating = document.getElementById('review-rating').value;
  const comment = document.getElementById('review-comment').value;
  
  if (!rating || rating === '0') {
    document.getElementById('review-alert').textContent = 'Please select a rating';
    document.getElementById('review-alert').classList.remove('d-none');
    return;
  }
  
  // Send review request
  fetch('/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rental_id: rentalId,
      rating: parseInt(rating),
      comment: comment
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to submit review');
        });
      }
      return response.json();
    })
    .then(data => {
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('review-modal'));
      modal.hide();
      
      // Reload rentals and reviews
      loadUserRentals();
      loadUserReviews();
      
      // Show success message
      showSuccess('Review submitted successfully', 'profile-alert');
    })
    .catch(error => {
      document.getElementById('review-alert').textContent = error.message;
      document.getElementById('review-alert').classList.remove('d-none');
    });
}

/**
 * Delete a review
 * @param {number} reviewId - The ID of the review
 */
function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review?')) {
    return;
  }
  
  fetch(`/reviews/${reviewId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Failed to delete review');
        });
      }
      return response.json();
    })
    .then(data => {
      showSuccess(data.message || 'Review deleted successfully', 'profile-alert');
      loadUserReviews();
    })
    .catch(error => {
      showError(error.message, 'profile-alert');
    });
}

/**
 * Handle user logout
 */
function handleLogout() {
  fetch('/auth/logout')
    .then(response => {
      if (response.ok) {
        // Redirect to homepage after successful logout
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => {
      console.error('Error during logout:', error);
    });
}