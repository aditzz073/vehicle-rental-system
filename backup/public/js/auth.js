// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth forms
    initializeLoginForm();
    initializeRegisterForm();
});

// Initialize login form
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Initialize register form
function initializeRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get email field (could be username or email)
    const emailField = form.querySelector('#username') || form.querySelector('#email');
    const passwordField = form.querySelector('#password');
    
    if (!emailField || !passwordField) {
        showAuthAlert('Form fields not found', 'danger');
        return;
    }
    
    const loginData = {
        email: emailField.value.trim(),
        password: passwordField.value
    };
    
    // Validate inputs
    if (!loginData.email || !loginData.password) {
        showAuthAlert('Please fill in all fields', 'danger');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAuthAlert('Login successful! Redirecting...', 'success');
            
            // Check for redirect URL in query params
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || '/dashboard';
            
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            
        } else {
            showAuthAlert(data.message || 'Login failed', 'danger');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAuthAlert('Network error. Please try again.', 'danger');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const registerData = {
        full_name: formData.get('full_name')?.trim(),
        email: formData.get('email')?.trim(),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password'),
        phone: formData.get('phone')?.trim(),
        date_of_birth: formData.get('date_of_birth'),
        address: formData.get('address')?.trim()
    };
    
    // Validate inputs
    if (!registerData.full_name || !registerData.email || !registerData.password) {
        showAuthAlert('Please fill in all required fields', 'danger');
        return;
    }
    
    if (registerData.password !== registerData.confirm_password) {
        showAuthAlert('Passwords do not match', 'danger');
        return;
    }
    
    if (registerData.password.length < 6) {
        showAuthAlert('Password must be at least 6 characters long', 'danger');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
        showAuthAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    // Remove confirm_password from data sent to server
    delete registerData.confirm_password;
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAuthAlert('Registration successful! Please log in.', 'success');
            
            // Clear form
            form.reset();
            
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
            
        } else {
            showAuthAlert(data.message || 'Registration failed', 'danger');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showAuthAlert('Network error. Please try again.', 'danger');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Show authentication alerts
function showAuthAlert(message, type = 'info') {
    // Try to find existing alert container
    let alertContainer = document.getElementById('login-alert') || 
                        document.getElementById('register-alert') ||
                        document.getElementById('auth-alert');
    
    if (!alertContainer) {
        // Create a new alert container if none exists
        alertContainer = document.createElement('div');
        alertContainer.id = 'auth-alert';
        alertContainer.className = 'mb-3';
        
        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(alertContainer, form);
        }
    }
    
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (alertContainer && alertContainer.parentNode) {
                alertContainer.remove();
            }
        }, 3000);
    }
}

// Check if user is authenticated
async function isAuthenticated() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Get current user profile
async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/profile', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.user;
        }
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
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
            showAuthAlert('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showAuthAlert('Logout failed', 'danger');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAuthAlert('Network error during logout', 'danger');
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('At least 8 characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('Lowercase letter');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('Uppercase letter');
    
    if (/[0-9]/.test(password)) strength++;
    else feedback.push('Number');
    
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('Special character');
    
    return {
        strength,
        feedback,
        isStrong: strength >= 3
    };
}

// Initialize password strength indicator if exists
document.addEventListener('DOMContentLoaded', function() {
    const passwordField = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');
    
    if (passwordField && strengthIndicator) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            const result = checkPasswordStrength(password);
            
            let strengthClass = 'text-danger';
            let strengthText = 'Weak';
            
            if (result.strength >= 3) {
                strengthClass = 'text-success';
                strengthText = 'Strong';
            } else if (result.strength >= 2) {
                strengthClass = 'text-warning';
                strengthText = 'Medium';
            }
            
            strengthIndicator.className = `small ${strengthClass}`;
            strengthIndicator.textContent = password ? `Password strength: ${strengthText}` : '';
        });
    }
});
