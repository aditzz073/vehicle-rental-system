// Main JavaScript file for AutoHive
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

async function initializeApp() {
    // Check authentication status
    await checkAuthStatus();
    
    // Load featured vehicles on homepage
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadFeaturedVehicles();
    }
    
    // Load vehicles list page
    if (window.location.pathname === '/vehicles-list' || window.location.pathname === '/vehicles') {
        loadVehiclesList();
        initializeVehicleFilters();
    }
    
    // Load dashboard if on dashboard page
    if (window.location.pathname === '/dashboard') {
        loadDashboard();
    }
}

// Authentication status check
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            updateNavbarForLoggedInUser(data.user);
        } else {
            updateNavbarForGuest();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateNavbarForGuest();
    }
}

// Update navbar for logged in user
function updateNavbarForLoggedInUser(user) {
    const userNav = document.getElementById('user-nav');
    if (userNav) {
        userNav.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user"></i> ${user.full_name}
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><a class="dropdown-item" href="/profile"><i class="fas fa-user-edit"></i> Profile</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </li>
        `;
    }
}

// Update navbar for guest user
function updateNavbarForGuest() {
    const userNav = document.getElementById('user-nav');
    if (userNav) {
        userNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/login"><i class="fas fa-sign-in-alt"></i> Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/register"><i class="fas fa-user-plus"></i> Register</a>
            </li>
        `;
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Load featured vehicles for homepage
async function loadFeaturedVehicles() {
    try {
        const response = await fetch('/api/vehicles?limit=6&sort_by=rating&sort_order=DESC');
        const data = await response.json();
        
        if (data.success && data.vehicles) {
            displayFeaturedVehicles(data.vehicles);
        }
    } catch (error) {
        console.error('Failed to load featured vehicles:', error);
        displayFeaturedVehiclesError();
    }
}

// Display featured vehicles
function displayFeaturedVehicles(vehicles) {
    const container = document.querySelector('.featured-vehicles');
    if (!container) return;
    
    if (vehicles.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No vehicles available at the moment.</p></div>';
        return;
    }
    
    container.innerHTML = vehicles.map(vehicle => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <img src="${vehicle.image_url || '/images/vehicle.png'}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${vehicle.make} ${vehicle.model}</h5>
                    <p class="card-text">${vehicle.year} • ${vehicle.category}</p>
                    <p class="card-text">
                        <span class="text-primary fw-bold">₹${(vehicle.daily_rate * 80).toFixed(2)}/day</span>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-star text-warning"></i>
                            ${vehicle.rating || 'New'}
                        </small>
                        <a href="/vehicle/${vehicle.vehicle_id}" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display error when loading featured vehicles fails
function displayFeaturedVehiclesError() {
    const container = document.querySelector('.featured-vehicles');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Unable to load vehicles at the moment. Please try again later.
                </div>
            </div>
        `;
    }
}

// Load vehicles list page
async function loadVehiclesList() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchCriteria = {
        page: urlParams.get('page') || 1,
        limit: 12,
        search: urlParams.get('search') || '',
        category: urlParams.get('category') || '',
        min_price: urlParams.get('min_price') || '',
        max_price: urlParams.get('max_price') || '',
        location: urlParams.get('location') || ''
    };
    
    try {
        const queryString = new URLSearchParams(searchCriteria).toString();
        const response = await fetch(`/api/vehicles?${queryString}`);
        const data = await response.json();
        
        if (data.success) {
            displayVehiclesList(data.vehicles);
            displayPagination(data.pagination);
        }
    } catch (error) {
        console.error('Failed to load vehicles:', error);
        displayVehiclesListError();
    }
}

// Display vehicles list
function displayVehiclesList(vehicles) {
    const container = document.getElementById('vehicles-container');
    if (!container) return;
    
    if (vehicles.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    No vehicles found matching your criteria.
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = vehicles.map(vehicle => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm vehicle-card">
                <img src="${vehicle.image_url || '/images/vehicle.png'}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title">${vehicle.make} ${vehicle.model}</h6>
                    <p class="card-text small">${vehicle.year} • ${vehicle.category}</p>
                    <p class="card-text">
                        <span class="text-primary fw-bold">₹${(vehicle.daily_rate * 80).toFixed(2)}/day</span>
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-star text-warning"></i>
                            ${vehicle.rating || 'New'}
                        </small>
                        <div class="btn-group" role="group">
                            <a href="/vehicle/${vehicle.vehicle_id}" class="btn btn-outline-primary btn-sm">View</a>
                            <button onclick="bookVehicle(${vehicle.vehicle_id})" class="btn btn-primary btn-sm">Book</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Display pagination
function displayPagination(pagination) {
    const container = document.getElementById('pagination-container');
    if (!container || !pagination) return;
    
    const { current_page, total_pages } = pagination;
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    // Previous button
    if (current_page > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="?page=${current_page - 1}">Previous</a></li>`;
    }
    
    // Page numbers
    for (let i = Math.max(1, current_page - 2); i <= Math.min(total_pages, current_page + 2); i++) {
        paginationHTML += `<li class="page-item ${i === current_page ? 'active' : ''}">
            <a class="page-link" href="?page=${i}">${i}</a>
        </li>`;
    }
    
    // Next button
    if (current_page < total_pages) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="?page=${current_page + 1}">Next</a></li>`;
    }
    
    paginationHTML += '</ul></nav>';
    container.innerHTML = paginationHTML;
}

// Initialize vehicle filters
function initializeVehicleFilters() {
    const filterForm = document.getElementById('vehicle-filters');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(filterForm);
            const params = new URLSearchParams();
            
            for (let [key, value] of formData.entries()) {
                if (value.trim()) {
                    params.append(key, value);
                }
            }
            
            window.location.search = params.toString();
        });
    }
}

// Book vehicle function
async function bookVehicle(vehicleId) {
    // Check if user is logged in
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            // Not logged in, redirect to login
            window.location.href = `/login?redirect=/vehicle/${vehicleId}`;
            return;
        }
        
        // User is logged in, proceed to booking
        window.location.href = `/book/${vehicleId}`;
        
    } catch (error) {
        console.error('Error checking auth status:', error);
        window.location.href = `/login?redirect=/vehicle/${vehicleId}`;
    }
}

// Load dashboard
async function loadDashboard() {
    try {
        // Load user's rentals
        const rentalsResponse = await fetch('/api/rentals/my-rentals', {
            credentials: 'include'
        });
        
        if (rentalsResponse.ok) {
            const rentalsData = await rentalsResponse.json();
            displayUserRentals(rentalsData.rentals);
        }
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Display user rentals in dashboard
function displayUserRentals(rentals) {
    const container = document.getElementById('user-rentals');
    if (!container) return;
    
    if (rentals.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                You haven't made any rentals yet. <a href="/vehicles-list">Browse vehicles</a> to get started.
            </div>
        `;
        return;
    }
    
    container.innerHTML = rentals.map(rental => `
        <div class="col-md-6 mb-3">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">${rental.vehicle_make} ${rental.vehicle_model}</h6>
                    <p class="card-text">
                        <strong>Dates:</strong> ${new Date(rental.start_date).toLocaleDateString()} - ${new Date(rental.end_date).toLocaleDateString()}<br>
                        <strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(rental.status)}">${rental.status}</span><br>
                        <strong>Total:</strong> ₹${(rental.total_amount * 80).toFixed(2)}
                    </p>
                    <a href="/rental/${rental.rental_id}" class="btn btn-sm btn-outline-primary">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
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

// Utility function to show alerts
function showAlert(message, type = 'info') {
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Try to find a container for alerts
    const alertContainer = document.getElementById('alert-container') || document.querySelector('.container').firstElementChild;
    if (alertContainer) {
        alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
    }
}
