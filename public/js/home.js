/**
 * Home page JavaScript for the Vehicle Rental System
 * Handles featured vehicles and testimonials loading
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize home page functionality
  loadFeaturedVehicles();
  loadTestimonials();
});

/**
 * Load featured vehicles on the home page
 */
function loadFeaturedVehicles() {
  fetch('/vehicles/featured')
    .then(response => response.json())
    .then(vehicles => {
      const featuredContainer = document.querySelector('.featured-vehicles');
      
      if (!featuredContainer) return;
      
      if (!vehicles || vehicles.length === 0) {
        featuredContainer.innerHTML = '<div class="col-12"><p class="text-center">No featured vehicles available at the moment.</p></div>';
        return;
      }
      
      let html = '';
      
      vehicles.forEach(vehicle => {
        html += `
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${vehicle.image_url || '/images/default-vehicle.jpg'}" class="card-img-top" alt="${vehicle.make} ${vehicle.model}">
              <div class="card-body">
                <h5 class="card-title">${vehicle.make} ${vehicle.model} (${vehicle.year})</h5>
                <div class="mb-2">
                  ${generateStarRating(vehicle.rating || 0)}
                </div>
                <p class="card-text">${vehicle.description?.substring(0, 100)}...</p>
                <p class="card-text text-primary fw-bold">${formatCurrency(vehicle.daily_rate)} / day</p>
              </div>
              <div class="card-footer bg-transparent">
                <a href="/vehicles-list?id=${vehicle.vehicle_id}" class="btn btn-primary w-100">View Details</a>
              </div>
            </div>
          </div>
        `;
      });
      
      featuredContainer.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading featured vehicles:', error);
      
      const featuredContainer = document.querySelector('.featured-vehicles');
      if (featuredContainer) {
        featuredContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Failed to load featured vehicles. Please try again later.</p></div>';
      }
    });
}

/**
 * Load testimonials on the home page
 */
function loadTestimonials() {
  fetch('/reviews/featured')
    .then(response => response.json())
    .then(testimonials => {
      const testimonialsContainer = document.querySelector('.testimonials');
      
      if (!testimonialsContainer) return;
      
      if (!testimonials || testimonials.length === 0) {
        testimonialsContainer.innerHTML = '<div class="col-12"><p class="text-center">No testimonials available at the moment.</p></div>';
        return;
      }
      
      let html = '';
      
      testimonials.forEach(testimonial => {
        html += `
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <div class="mb-3">
                  ${generateStarRating(testimonial.rating)}
                </div>
                <p class="card-text">"${testimonial.comment}"</p>
                <div class="d-flex align-items-center mt-3">
                  <div class="avatar me-3">
                    <i class="fas fa-user-circle fa-2x text-primary"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">${testimonial.user_name}</h6>
                    <small class="text-muted">${formatDate(testimonial.created_at)}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });
      
      testimonialsContainer.innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading testimonials:', error);
      
      const testimonialsContainer = document.querySelector('.testimonials');
      if (testimonialsContainer) {
        testimonialsContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Failed to load testimonials. Please try again later.</p></div>';
      }
    });
}