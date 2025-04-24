/**
 * Main JavaScript file for the Vehicle Rental System
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

/**
 * Initialize the application
 */
function initApp() {
  // Check authentication status and update UI
  checkAuthStatus();
  
  // Add event listeners
  addEventListeners();
}

/**
 * Check if the user is authenticated and update the UI accordingly
 */
function checkAuthStatus() {
  fetch('/auth/profile')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject('Not authenticated');
    })
    .then(user => {
      // User is authenticated
      updateNavForAuthenticatedUser(user);
    })
    .catch(error => {
      // User is not authenticated
      updateNavForGuestUser();
    });
}

/**
 * Update the navigation for an authenticated user
 * @param {Object} user - The user object
 */
function updateNavForAuthenticatedUser(user) {
  // Hide auth buttons
  const authButtons = document.getElementById('auth-buttons');
  if (authButtons) {
    authButtons.classList.add('d-none');
  }
  
  // Show user nav
  const userNav = document.getElementById('user-nav');
  if (!userNav) return;
  
  userNav.classList.remove('d-none');
  
  // Add event listener for logout
  const logoutButton = document.getElementById('nav-logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Update the navigation for a guest user
 */
function updateNavForGuestUser() {
  // Show auth buttons
  const authButtons = document.getElementById('auth-buttons');
  if (authButtons) {
    authButtons.classList.remove('d-none');
  }
  
  // Hide user nav
  const userNav = document.getElementById('user-nav');
  if (userNav) {
    userNav.classList.add('d-none');
  }
}

/**
 * Add global event listeners
 */
function addEventListeners() {
  // Example: Close alerts when the close button is clicked
  document.querySelectorAll('.alert .btn-close').forEach(button => {
    button.addEventListener('click', function() {
      this.parentElement.classList.add('d-none');
    });
  });
}

/**
 * Logout the user
 */
function logout() {
  fetch('/auth/logout')
    .then(response => {
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    })
    .catch(error => {
      console.error('Error during logout:', error);
    });
}

/**
 * Display an error message
 * @param {string} message - The error message
 * @param {string} elementId - The ID of the element to display the error in
 */
function showError(message, elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.remove('d-none');
  }
}

/**
 * Display a success message
 * @param {string} message - The success message
 * @param {string} elementId - The ID of the element to display the message in
 */
function showSuccess(message, elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = 'alert alert-success';
    element.classList.remove('d-none');
  }
}

/**
 * Format a date to a readable string
 * @param {string} dateString - The date string
 * @returns {string} The formatted date string
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Format a currency amount
 * @param {number} amount - The amount to format
 * @returns {string} The formatted amount
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Generate star rating HTML
 * @param {number} rating - The rating value (0-5)
 * @returns {string} HTML for the star rating display
 */
function generateStarRating(rating) {
  let starsHTML = '';
  const roundedRating = Math.round(rating * 2) / 2;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      starsHTML += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 === roundedRating) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHTML += '<i class="far fa-star"></i>';
    }
  }
  
  return `<div class="rating" data-rating="${rating}">${starsHTML} <span class="rating-value">(${rating})</span></div>`;
}