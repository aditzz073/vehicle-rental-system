/**
 * Vehicles JavaScript file for the Vehicle Rental System
 * Handles displaying vehicle listings, search, and booking functionality
 */

// Global variables
let currentPage = 1;
let totalPages = 1;
let pageSize = 9;
let vehicles = [];
let vehicleTypes = [];
let vehicleCategories = [];
let sortBy = 'price_asc';
let searchCriteria = {};

document.addEventListener('DOMContentLoaded', function() {
  initVehiclesPage();
});

/**
 * Initialize the vehicles page
 */
function initVehiclesPage() {
  // Load vehicle types and categories for filter dropdowns
  loadVehicleTypes();
  loadVehicleCategories();
  
  // Set today's date as the minimum for date inputs
  setMinDates();
  
  // Add event listeners
  addVehiclePageEventListeners();
  
  // Load vehicles
  loadVehicles();
}

/**
 * Load vehicle types for the filter dropdown
 */
function loadVehicleTypes() {
  fetch('/vehicles/types')
    .then(response => response.json())
    .then(types => {
      vehicleTypes = types;
      const dropdown = document.getElementById('vehicle-type');
      
      if (dropdown) {
        dropdown.innerHTML = '<option value="">All Types</option>';
        types.forEach(type => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          dropdown.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error loading vehicle types:', error);
    });
}

/**
 * Load vehicle categories for the filter dropdown
 */
function loadVehicleCategories() {
  fetch('/vehicles/categories')
    .then(response => response.json())
    .then(categories => {
      vehicleCategories = categories;
      const dropdown = document.getElementById('vehicle-category');
      
      if (dropdown) {
        dropdown.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          dropdown.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error loading vehicle categories:', error);
    });
}

/**
 * Set minimum dates for date inputs to prevent selecting past dates
 */
function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  const startDateInputs = document.querySelectorAll('[name="start_date"]');
  const endDateInputs = document.querySelectorAll('[name="end_date"]');
  
  startDateInputs.forEach(input => {
    input.min = today;
    input.addEventListener('change', function() {
      // When start date changes, end date minimum should be the start date
      const correspondingEndDate = this.closest('form').querySelector('[name="end_date"]');
      if (correspondingEndDate) {
        correspondingEndDate.min = this.value;
        if (correspondingEndDate.value && correspondingEndDate.value < this.value) {
          correspondingEndDate.value = this.value;
        }
      }
    });
  });
  
  endDateInputs.forEach(input => {
    input.min = today;
  });
}

/**
 * Add event listeners for the vehicles page
 */
function addVehiclePageEventListeners() {
  // Search form
  const searchForm = document.getElementById('vehicle-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      currentPage = 1;
      const formData = new FormData(searchForm);
      searchCriteria = Object.fromEntries(formData.entries());
      loadVehicles();
    });
    
    searchForm.addEventListener('reset', function() {
      setTimeout(() => {
        currentPage = 1;
        searchCriteria = {};
        loadVehicles();
      }, 10);
    });
  }
  
  // Sort dropdown
  const sortDropdown = document.getElementById('sort-by');
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
      sortBy = this.value;
      loadVehicles();
    });
  }
  
  // Cost calculation in modal
  const calculateCostButton = document.getElementById('calculate-cost');
  if (calculateCostButton) {
    calculateCostButton.addEventListener('click', calculateRentalCost);
  }
  
  // Date change listeners for automatic cost calculation
  const modalStartDate = document.getElementById('modal-start-date');
  const modalEndDate = document.getElementById('modal-end-date');
  
  if (modalStartDate && modalEndDate) {
    modalStartDate.addEventListener('change', function() {
      if (modalEndDate.value) calculateRentalCost();
    });
    
    modalEndDate.addEventListener('change', function() {
      if (modalStartDate.value) calculateRentalCost();
    });
  }
  
  // Booking form
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmission);
  }
}

/**
 * Load vehicles based on current filters, sorting, and pagination
 */
function loadVehicles() {
  // Build query string
  const queryParams = new URLSearchParams();
  
  // Add search criteria
  Object.entries(searchCriteria).forEach(([key, value]) => {
    if (!value) return; // Skip empty values
    
    // Map form field names to API parameter names
    switch(key) {
      case 'search':
        queryParams.append('search', value);
        break;
      case 'vehicle_type':
        queryParams.append('vehicle_type', value);
        break;
      case 'category':
        queryParams.append('category', value);
        break;
      case 'start_date':
        queryParams.append('start_date', value);
        break;
      case 'end_date':
        queryParams.append('end_date', value);
        break;
      case 'price_min':
      case 'daily_rate_min': // Handle both possible names
        queryParams.append('daily_rate_min', value);
        break;
      case 'price_max':
      case 'daily_rate_max': // Handle both possible names
        queryParams.append('daily_rate_max', value);
        break;
      default:
        queryParams.append(key, value);
    }
  });
  
  // Add pagination
  queryParams.append('page', currentPage);
  queryParams.append('limit', pageSize);
  
  // Add sorting
  queryParams.append('sort', sortBy);
  
  // Show loading state
  document.getElementById('vehicles-container').innerHTML = `
    <div class="text-center w-100 py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
  
  // Fetch vehicles
  fetch(`/vehicles/search?${queryParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      vehicles = data.vehicles || [];
      totalPages = data.pagination ? Math.ceil(data.pagination.total / pageSize) : 1;
      
      // Update results count
      document.getElementById('results-count').textContent = data.pagination ? data.pagination.total : 0;
      
      // Render vehicles
      renderVehicles(vehicles);
      
      // Update pagination
      renderPagination();
    })
    .catch(error => {
      console.error('Error loading vehicles:', error);
      document.getElementById('vehicles-container').innerHTML = `
        <div class="alert alert-danger w-100 text-center">
          Failed to load vehicles. Please try again later.
        </div>
      `;
    });
}

/**
 * Render vehicles to the container
 * @param {Array} vehicles - Array of vehicle objects to display
 */
function renderVehicles(vehicles) {
  const container = document.getElementById('vehicles-container');
  
  if (!vehicles || vehicles.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          No vehicles found matching your criteria. Try adjusting your filters.
        </div>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  vehicles.forEach(vehicle => {
    const vehicleImageUrl = vehicle.image_url || '/images/default-vehicle.jpg';
    const rating = vehicle.rating_stats ? vehicle.rating_stats.average_rating : 0;
    const categoryBadge = getCategoryBadgeHtml(vehicle.category);
    
    html += `
      <div class="col">
        <div class="card vehicle-card shadow-sm h-100">
          <div class="position-relative">
            <img src="${vehicleImageUrl}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}">
            ${categoryBadge}
          </div>
          <div class="card-body">
            <h5 class="card-title">${vehicle.make} ${vehicle.model} (${vehicle.year})</h5>
            <div class="mb-2">
              ${generateStarRating(rating)}
            </div>
            <p class="card-text text-muted">
              <i class="fas fa-car me-1"></i> ${vehicle.vehicle_type}<br>
              <i class="fas fa-palette me-1"></i> ${vehicle.color}
            </p>
            <p class="vehicle-price">
              ${formatCurrency(vehicle.daily_rate)}/day
              <small class="text-success d-block">Save up to 25% on longer rentals</small>
            </p>
          </div>
          <div class="card-footer bg-white border-top-0">
            <div class="d-grid">
              <button class="btn btn-primary" onclick="openVehicleModal(${vehicle.vehicle_id})">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/**
 * Generate HTML for category badge
 * @param {string} category - Vehicle category
 * @returns {string} - HTML for badge
 */
function getCategoryBadgeHtml(category) {
  if (!category) return '';
  
  let badgeClass = 'bg-secondary';
  
  switch(category) {
    case 'Standard':
      badgeClass = 'bg-secondary';
      break;
    case 'Premium':
      badgeClass = 'bg-primary';
      break;
    case 'Ultra Luxury':
      badgeClass = 'bg-danger';
      break;
  }
  
  return `<span class="position-absolute top-0 end-0 badge ${badgeClass} m-2">${category}</span>`;
}

/**
 * Render pagination controls
 */
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  let html = '';
  
  // Previous button
  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" aria-label="Previous" onclick="changePage(${currentPage - 1})">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;
  
  // Page numbers
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }
  
  // Next button
  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" aria-label="Next" onclick="changePage(${currentPage + 1})">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;
  
  pagination.innerHTML = html;
}

/**
 * Change the current page
 * @param {number} page - The page number to go to
 */
function changePage(page) {
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  loadVehicles();
  
  // Scroll to top of vehicles container
  document.getElementById('vehicles-container').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Open the vehicle detail modal
 * @param {number} vehicleId - The ID of the vehicle to display
 */
function openVehicleModal(vehicleId) {
  const vehicle = vehicles.find(v => v.vehicle_id === vehicleId);
  if (!vehicle) return;
  
  const modal = new bootstrap.Modal(document.getElementById('vehicle-modal'));
  
  // Set vehicle data in the modal
  document.getElementById('modal-title').textContent = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  document.getElementById('modal-name').textContent = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  document.getElementById('modal-image').src = vehicle.image_url || '/images/default-vehicle.jpg';
  document.getElementById('modal-description').textContent = vehicle.description || 'No description available';
  document.getElementById('modal-type').textContent = vehicle.vehicle_type;
  document.getElementById('modal-year').textContent = vehicle.year;
  document.getElementById('modal-color').textContent = vehicle.color;
  document.getElementById('modal-mileage').textContent = `${vehicle.mileage || 0} km`;
  document.getElementById('modal-rate').innerHTML = `
    ${formatCurrency(vehicle.daily_rate)}/day
    <span class="badge bg-success ms-2">Discounts available for longer rentals</span>
  `;
  document.getElementById('modal-category').textContent = vehicle.category || 'Standard';
  document.getElementById('modal-rating').innerHTML = generateStarRating(vehicle.rating_stats ? vehicle.rating_stats.average_rating : 0);
  
  // Load pricing tiers
  loadVehiclePricingTiers(vehicleId);
  
  // Set vehicle ID for booking form
  document.getElementById('vehicle-id').value = vehicle.vehicle_id;
  
  // Reset booking form
  document.getElementById('booking-cost').classList.add('d-none');
  
  // Get reviews for this vehicle
  loadVehicleReviews(vehicleId);
  
  // Show the modal
  modal.show();
}

/**
 * Load pricing tiers for a specific vehicle
 * @param {number} vehicleId - The ID of the vehicle
 */
function loadVehiclePricingTiers(vehicleId) {
  const tiersContainer = document.getElementById('pricing-tiers');
  if (!tiersContainer) return;
  
  tiersContainer.innerHTML = `
    <div class="text-center">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading pricing tiers...</span>
      </div>
      Loading pricing options...
    </div>
  `;
  
  fetch(`/vehicles/${vehicleId}/pricing-tiers`)
    .then(response => response.json())
    .then(tiers => {
      if (!tiers || tiers.length === 0) {
        tiersContainer.innerHTML = '<p>Standard daily rate applies to all rental durations.</p>';
        return;
      }
      
      let html = `
        <div class="table-responsive">
          <table class="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Rental Duration</th>
                <th>Rate</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      tiers.forEach(tier => {
        const discountPercent = ((1 - tier.rate_multiplier) * 100).toFixed(0);
        const durationText = tier.min_days === tier.max_days 
          ? `${tier.min_days} days` 
          : tier.max_days < 365 
            ? `${tier.min_days}-${tier.max_days} days`
            : `${tier.min_days}+ days`;
            
        html += `
          <tr>
            <td>${durationText}</td>
            <td>${tier.rate_multiplier * 100}% of daily rate</td>
            <td>${discountPercent > 0 ? `-${discountPercent}%` : 'None'}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
        <p class="small text-muted mb-0">Rent for longer periods to enjoy better rates!</p>
      `;
      
      tiersContainer.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading pricing tiers:', error);
      tiersContainer.innerHTML = '<p class="text-danger">Failed to load pricing information.</p>';
    });
}

/**
 * Load reviews for a specific vehicle
 * @param {number} vehicleId - The ID of the vehicle
 */
function loadVehicleReviews(vehicleId) {
  const reviewsContainer = document.getElementById('vehicle-reviews');
  
  reviewsContainer.innerHTML = `
    <div class="text-center py-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading reviews...</span>
      </div>
    </div>
  `;
  
  fetch(`/vehicles/${vehicleId}/reviews`)
    .then(response => response.json())
    .then(reviews => {
      if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="text-center">No reviews yet for this vehicle.</p>';
        return;
      }
      
      let html = '<div class="row">';
      
      reviews.forEach(review => {
        html += `
          <div class="col-md-6 mb-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <h6 class="card-subtitle text-muted">${review.username}</h6>
                  <small class="text-muted">${formatDate(review.created_at)}</small>
                </div>
                <div class="mb-2">
                  ${generateStarRating(review.rating)}
                </div>
                <p class="card-text">${review.comment || 'No comment provided.'}</p>
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      reviewsContainer.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading reviews:', error);
      reviewsContainer.innerHTML = '<p class="text-center text-danger">Failed to load reviews.</p>';
    });
}

/**
 * Calculate the rental cost
 */
function calculateRentalCost() {
  const vehicleId = document.getElementById('vehicle-id').value;
  const startDate = document.getElementById('modal-start-date').value;
  const endDate = document.getElementById('modal-end-date').value;
  const costContainer = document.getElementById('booking-cost');
  
  if (!startDate || !endDate) {
    costContainer.innerHTML = 'Please select start and end dates.';
    costContainer.className = 'alert alert-warning';
    costContainer.classList.remove('d-none');
    return;
  }
  
  costContainer.innerHTML = 'Calculating...';
  costContainer.className = 'alert alert-info';
  costContainer.classList.remove('d-none');
  
  fetch(`/rentals/calculate?vehicle_id=${vehicleId}&start_date=${startDate}&end_date=${endDate}`)
    .then(response => response.json())
    .then(data => {
      let discountHtml = '';
      
      // Show discount information if applicable
      if (data.discountPercentage && data.discountPercentage > 0) {
        discountHtml = `
          <div class="text-success mt-2">
            <strong>Discount:</strong> ${data.discountPercentage}% off (Saved ${formatCurrency(data.discountAmount)})
          </div>
        `;
      }
      
      costContainer.innerHTML = `
        <div>
          <strong>Rental Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}<br>
          <strong>Duration:</strong> ${data.duration} day${data.duration !== 1 ? 's' : ''}<br>
          <strong>Daily Rate:</strong> ${formatCurrency(data.dailyRate)}<br>
          <strong>Base Total:</strong> ${formatCurrency(data.baseTotal)}
          ${discountHtml}
          <div class="mt-2 pt-2 border-top">
            <strong>Final Total:</strong> <span class="fs-5">${formatCurrency(data.discountedTotal)}</span>
          </div>
        </div>
      `;
      costContainer.className = 'alert alert-info';
    })
    .catch(error => {
      console.error('Error calculating cost:', error);
      costContainer.innerHTML = 'Error calculating cost. Please try again.';
      costContainer.className = 'alert alert-danger';
    });
}

/**
 * Handle booking form submission
 * @param {Event} e - The form submission event
 */
function handleBookingSubmission(e) {
  e.preventDefault();
  
  // Check if user is logged in
  fetch('/auth/profile')
    .then(response => {
      if (!response.ok) {
        throw new Error('Please log in to book a vehicle');
      }
      return response.json();
    })
    .then(() => {
      // User is logged in, proceed with booking
      const vehicleId = document.getElementById('vehicle-id').value;
      const startDate = document.getElementById('modal-start-date').value;
      const endDate = document.getElementById('modal-end-date').value;
      
      if (!startDate || !endDate) {
        alert('Please select start and end dates.');
        return;
      }
      
      // Create rental
      fetch('/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicle_id: vehicleId, start_date: startDate, end_date: endDate }),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(data => {
              throw new Error(data.message || 'Failed to create rental');
            });
          }
          return response.json();
        })
        .then(data => {
          // Redirect to dashboard with rental success message
          window.location.href = `/dashboard?rentalSuccess=true&rentalId=${data.rental.rental_id}`;
        })
        .catch(error => {
          alert(error.message);
        });
    })
    .catch(error => {
      window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
    });
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date string as a readable date
 * @param {string} dateString - The date string to format (YYYY-MM-DD)
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

/**
 * Generate HTML for star rating
 * @param {number} rating - The rating value (0-5)
 * @returns {string} - HTML for star rating
 */
function generateStarRating(rating) {
  if (!rating) rating = 0;
  
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  let html = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star text-warning"></i> ';
  }
  
  // Half star
  if (halfStar) {
    html += '<i class="fas fa-star-half-alt text-warning"></i> ';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star text-warning"></i> ';
  }
  
  // Add rating number
  html += `<small class="text-muted ms-1">(${rating.toFixed(1)})</small>`;
  
  return html;
}