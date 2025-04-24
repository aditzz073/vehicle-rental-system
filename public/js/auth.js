/**
 * Authentication-related JavaScript for the Vehicle Rental System
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize authentication-related elements
  initAuth();
});

/**
 * Initialize authentication functionality
 */
function initAuth() {
  // Initialize login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Initialize registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }

  // Initialize password form
  const passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }

  // Initialize forgot password form
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }
}

/**
 * Handle login form submission
 * @param {Event} e - The form submission event
 */
function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('remember-me')?.checked || false;
  
  // Validate form
  if (!username || !password) {
    showError('Please enter both username and password', 'login-alert');
    return;
  }
  
  console.log('Attempting login for:', username);
  
  // Send login request
  fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, remember_me: rememberMe }),
  })
    .then(response => {
      console.log('Login response status:', response.status);
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Invalid username or password');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful, redirecting to dashboard...', data);
      // Redirect to dashboard on successful login
      window.location.href = '/dashboard';
    })
    .catch(error => {
      console.error('Login error:', error);
      showError(error.message, 'login-alert');
    });
}

/**
 * Handle registration form submission
 * @param {Event} e - The form submission event
 */
function handleRegistration(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = Object.fromEntries(formData.entries());
  
  // Basic form validation
  if (!userData.username || !userData.email || !userData.password) {
    showError('Please fill in all required fields', 'register-alert');
    return;
  }
  
  if (userData.password !== userData.confirm_password) {
    showError('Passwords do not match', 'register-alert');
    return;
  }
  
  // Terms and conditions check
  if (!userData.terms) {
    showError('You must agree to the Terms and Conditions', 'register-alert');
    return;
  }
  
  // Send registration request
  fetch('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      address: userData.address
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Registration failed');
        });
      }
      return response.json();
    })
    .then(data => {
      // Redirect to login page with success message
      window.location.href = '/login?registered=true';
    })
    .catch(error => {
      showError(error.message, 'register-alert');
    });
}

/**
 * Handle password change form submission
 * @param {Event} e - The form submission event
 */
function handlePasswordChange(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validate form
  if (!currentPassword || !newPassword || !confirmPassword) {
    showError('Please fill in all password fields', 'password-alert');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showError('New passwords do not match', 'password-alert');
    return;
  }
  
  // Send password change request
  fetch('/auth/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || 'Password change failed');
        });
      }
      return response.json();
    })
    .then(data => {
      showSuccess('Password changed successfully', 'password-alert');
      document.getElementById('password-form').reset();
    })
    .catch(error => {
      showError(error.message, 'password-alert');
    });
}

/**
 * Handle forgot password form submission
 * @param {Event} e - The form submission event
 */
function handleForgotPassword(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  
  // Validate form
  if (!email) {
    showError('Please enter your email address', 'forgot-password-alert');
    return;
  }
  
  // Send forgot password request
  fetch('/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then(response => response.json())
    .then(data => {
      showSuccess(data.message || 'Password reset email sent. Please check your inbox.', 'forgot-password-alert');
      document.getElementById('forgot-password-form').reset();
    })
    .catch(error => {
      showError('Error processing your request. Please try again.', 'forgot-password-alert');
    });
}

/**
 * Check if the URL contains a registered=true parameter and show a success message
 */
function checkRegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    const loginAlert = document.getElementById('login-alert');
    if (loginAlert) {
      loginAlert.textContent = 'Registration successful! Please log in with your credentials.';
      loginAlert.className = 'alert alert-success';
      loginAlert.classList.remove('d-none');
    }
  }
}

// Check for registration success on page load
checkRegistrationSuccess();

/**
 * Show error message in specified alert element
 * @param {string} message - Error message to display
 * @param {string} alertId - ID of the alert element to show the message in
 */
function showError(message, alertId) {
  const alertElement = document.getElementById(alertId);
  if (alertElement) {
    alertElement.textContent = message;
    alertElement.classList.remove('d-none');
    alertElement.classList.add('alert-danger');
    alertElement.classList.remove('alert-success');
  }
}

/**
 * Show success message in specified alert element
 * @param {string} message - Success message to display
 * @param {string} alertId - ID of the alert element to show the message in
 */
function showSuccess(message, alertId) {
  const alertElement = document.getElementById(alertId);
  if (alertElement) {
    alertElement.textContent = message;
    alertElement.classList.remove('d-none');
    alertElement.classList.add('alert-success');
    alertElement.classList.remove('alert-danger');
  }
}