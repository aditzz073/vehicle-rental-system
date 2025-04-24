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
let sortBy = 'price_asc';
let searchCriteria = {};

document.addEventListener('DOMContentLoaded', function() {
  initVehiclesPage();
});

/**
 * Initialize the vehicles page
 */
function initVehiclesPage() {
  // Load vehicle types for filter dropdown
  loadVehicleTypes();
  
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
  fetch('/api/vehicles/types')
    .then(response => response.json())
    .then(types => {
      vehicleTypes = types;
      const dropdown = document.getElementById('vehicle-type');
      
      if (dropdown) {
        types.forEach(type => {
          const option = document.createElement('option');
          option.value = type.type_id || type.name;
          option.textContent = type.name;
          dropdown.appendChild(option);
        });
      }
    })
    .catch(error => {
      console.error('Error loading vehicle types:', error);
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
    if (value) queryParams.append(key, value);
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
  fetch(`/api/vehicles/search?${queryParams.toString()}`)
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
    
    html += `
      <div class="col">
        <div class="card vehicle-card shadow-sm h-100">
          <img src="${vehicleImageUrl}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}">
          <div class="card-body">
            <h5 class="card-title">${vehicle.make} ${vehicle.model} (${vehicle.year})</h5>
            <div class="mb-2">
              ${generateStarRating(rating)}
            </div>
            <p class="card-text text-muted">
              <i class="fas fa-car me-1"></i> ${vehicle.vehicle_type}<br>
              <i class="fas fa-palette me-1"></i> ${vehicle.color}
            </p>
            <p class="vehicle-price">${formatCurrency(vehicle.daily_rate)}/day</p>
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
  document.getElementById('modal-mileage').textContent = `${vehicle.mileage} miles`;
  document.getElementById('modal-rate').textContent = formatCurrency(vehicle.daily_rate) + '/day';
  document.getElementById('modal-rating').innerHTML = generateStarRating(vehicle.rating_stats ? vehicle.rating_stats.average_rating : 0);
  
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
  
  fetch(`/api/vehicles/${vehicleId}/reviews`)
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
  
  fetch('/api/rentals/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vehicle_id: vehicleId, start_date: startDate, end_date: endDate }),
  })
    .then(response => response.json())
    .then(data => {
      costContainer.innerHTML = `
        <strong>Rental Period:</strong> ${formatDate(startDate)} - ${formatDate(endDate)}<br>
        <strong>Days:</strong> ${data.days}<br>
        <strong>Daily Rate:</strong> ${formatCurrency(data.daily_rate)}<br>
        <strong>Total Cost:</strong> ${formatCurrency(data.total_cost)}
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
  fetch('/api/auth/profile')
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
      fetch('/api/rentals', {
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