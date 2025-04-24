/**
 * Layout loader for Vehicle Rental System
 * This script loads the header and footer from layout.html into the current page
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load the layout components
  loadLayout();
});

/**
 * Load layout components (header and footer) from layout.html
 */
function loadLayout() {
  // Fetch the layout.html file
  fetch('/views/layout-components.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load layout components');
      }
      return response.text();
    })
    .then(html => {
      // Create a temporary container to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract header and footer
      const header = tempDiv.querySelector('header').outerHTML;
      const footer = tempDiv.querySelector('footer').outerHTML;
      
      // Insert header at the beginning of the body
      document.body.insertAdjacentHTML('afterbegin', header);
      
      // Insert footer before the scripts at the end
      document.body.insertAdjacentHTML('beforeend', footer);
      
      // Initialize the navigation highlighting
      highlightCurrentPage();
    })
    .catch(error => {
      console.error('Error loading layout:', error);
    });
}

/**
 * Highlight the current page in the navigation
 */
function highlightCurrentPage() {
  // Get the current page path
  const currentPath = window.location.pathname;
  
  // Find the matching nav link and add the active class
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if the href matches the current path
    if (href === currentPath || 
        (href !== '/' && currentPath.startsWith(href)) ||
        (href === '/' && currentPath === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}