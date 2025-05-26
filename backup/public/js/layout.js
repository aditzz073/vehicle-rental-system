// Layout JavaScript for AutoHive
document.addEventListener('DOMContentLoaded', function() {
    loadHeader();
    loadFooter();
    initializeNavbarScrollEffect();
    initializeScrollAnimations();
    initializePageAnimations();
});

// Initialize navbar scroll effect
function initializeNavbarScrollEffect() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Initialize scroll-triggered animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });
}

// Initialize page animations
function initializePageAnimations() {
    // Add scroll-animate class to main content sections
    const sections = document.querySelectorAll('section, .card, .hero-section > .container > .row');
    sections.forEach(section => {
        section.classList.add('scroll-animate');
    });

    // Reinitialize scroll animations after adding classes
    setTimeout(() => {
        initializeScrollAnimations();
    }, 100);
}

// Load header navigation
function loadHeader() {
    const header = document.querySelector('header');
    if (!header) {
        // Create header if it doesn't exist
        const headerElement = document.createElement('header');
        document.body.insertBefore(headerElement, document.body.firstChild);
        loadHeaderContent(headerElement);
    } else {
        loadHeaderContent(header);
    }
}

// Load header content
function loadHeaderContent(headerElement) {
    headerElement.innerHTML = `
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand" href="/">
                    <i class="fas fa-car me-2"></i>
                    AutoHive
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${isCurrentPage('/') ? 'active' : ''}" href="/">
                                <i class="fas fa-home me-1"></i> Home
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${isCurrentPage('/vehicles-list') ? 'active' : ''}" href="/vehicles-list">
                                <i class="fas fa-car me-1"></i> Vehicles
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${isCurrentPage('/about') ? 'active' : ''}" href="/about">
                                <i class="fas fa-info-circle me-1"></i> About
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${isCurrentPage('/contact') ? 'active' : ''}" href="/contact">
                                <i class="fas fa-envelope me-1"></i> Contact
                            </a>
                        </li>
                    </ul>
                    <div class="navbar-nav" id="user-nav">
                        <!-- Will be populated by main.js based on authentication status -->
                        <li class="nav-item">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </li>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// Load footer
function loadFooter() {
    const footer = document.querySelector('footer');
    if (!footer) {
        // Create footer if it doesn't exist
        const footerElement = document.createElement('footer');
        footerElement.className = 'bg-dark text-white py-5 mt-5';
        document.body.appendChild(footerElement);
        loadFooterContent(footerElement);
    } else {
        loadFooterContent(footer);
    }
}

// Load footer content
function loadFooterContent(footerElement) {
    footerElement.innerHTML = `
        <div class="container">
            <div class="row mb-4">
                <!-- AutoHive Column -->
                <div class="col-md-4">
                    <h5><i class="fas fa-car text-primary me-2"></i>AutoHive</h5>
                    <p class="mt-3">Your trusted partner for premium vehicle rentals. Experience luxury, comfort, and reliability with every ride.</p>
                    <div class="social-links mt-3">
                        <a href="#" class="text-white me-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="text-white me-3"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-white me-3"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-white me-3"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                
                <!-- Quick Links Column -->
                <div class="col-md-4">
                    <h5>Quick Links</h5>
                    <ul class="nav flex-column mt-3">
                        <li class="nav-item mb-2">
                            <a href="/" class="text-white text-decoration-none">
                                <i class="fas fa-home me-2"></i>Home
                            </a>
                        </li>
                        <li class="nav-item mb-2">
                            <a href="/vehicles-list" class="text-white text-decoration-none">
                                <i class="fas fa-car me-2"></i>Browse Vehicles
                            </a>
                        </li>
                        <li class="nav-item mb-2">
                            <a href="/about" class="text-white text-decoration-none">
                                <i class="fas fa-info-circle me-2"></i>About Us
                            </a>
                        </li>
                        <li class="nav-item mb-2">
                            <a href="/contact" class="text-white text-decoration-none">
                                <i class="fas fa-envelope me-2"></i>Contact
                            </a>
                        </li>
                        <li class="nav-item mb-2">
                            <a href="/terms" class="text-white text-decoration-none">
                                <i class="fas fa-file-contract me-2"></i>Terms & Conditions
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- Contact Column -->
                <div class="col-md-4">
                    <h5>Contact Info</h5>
                    <ul class="nav flex-column mt-3">
                        <li class="nav-item mb-2">
                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                            <span>Kumaraswamy Layout, Bengaluru, Karnataka 560078</span>
                        </li>
                        <li class="nav-item mb-2">
                            <i class="fas fa-phone text-primary me-2"></i>
                            <span>+91 7204318980</span>
                        </li>
                        <li class="nav-item mb-2">
                            <i class="fas fa-envelope text-primary me-2"></i>
                            <span>info.autohive@gmail.com</span>
                        </li>
                        <li class="nav-item mb-2">
                            <i class="fas fa-clock text-primary me-2"></i>
                            <span>24/7 Customer Support</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Copyright -->
            <div class="text-center border-top border-secondary pt-3">
                <p class="mb-0">&copy; 2025 AutoHive. All rights reserved. | Made with <i class="fas fa-heart text-danger"></i> in India</p>
            </div>
        </div>
    `;
}

// Check if current page matches the given path
function isCurrentPage(path) {
    return window.location.pathname === path || 
           (path === '/' && (window.location.pathname === '/index.html' || window.location.pathname === '/'));
}

// Initialize page-specific functionality
function initializePage() {
    const path = window.location.pathname;
    
    // Add page-specific classes to body
    document.body.className = document.body.className.replace(/page-\w+/g, '');
    
    if (path === '/' || path === '/index.html') {
        document.body.classList.add('page-home');
    } else if (path === '/vehicles-list' || path === '/vehicles') {
        document.body.classList.add('page-vehicles');
    } else if (path === '/login') {
        document.body.classList.add('page-login');
    } else if (path === '/register') {
        document.body.classList.add('page-register');
    } else if (path === '/dashboard') {
        document.body.classList.add('page-dashboard');
    } else if (path === '/about') {
        document.body.classList.add('page-about');
    } else if (path === '/contact') {
        document.body.classList.add('page-contact');
    }
}

// Initialize layout when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add loading animation for navigation
function showPageLoading() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div class="d-flex justify-content-center align-items-center position-fixed w-100 h-100" 
             style="top: 0; left: 0; background: rgba(255,255,255,0.9); z-index: 9999;">
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading...</p>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
}

function hidePageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
}

// Export functions for use in other scripts
window.AutoHiveLayout = {
    showPageLoading,
    hidePageLoading,
    isCurrentPage,
    addLoadingState,
    removeLoadingState,
    showToast
};

// Add loading state to button
function addLoadingState(button) {
    if (button) {
        button.classList.add('loading');
        button.disabled = true;
    }
}

// Remove loading state from button
function removeLoadingState(button) {
    if (button) {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getToastIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    // Add toast styles if not exists
    if (!document.querySelector('#toast-styles')) {
        const toastStyles = document.createElement('style');
        toastStyles.id = 'toast-styles';
        toastStyles.textContent = `
            .toast-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: var(--box-shadow-lg);
                border-left: 4px solid var(--primary-color);
                z-index: 1050;
                min-width: 300px;
                animation: slideInRight 0.3s ease-out;
            }
            .toast-success { border-left-color: var(--success-color); }
            .toast-warning { border-left-color: var(--warning-color); }
            .toast-error { border-left-color: var(--danger-color); }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(toastStyles);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}
