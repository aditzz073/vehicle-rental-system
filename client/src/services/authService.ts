import api from './api';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface UserProfile {
  user_id?: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

// Auth Service
export const AuthService = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    console.log('AuthService: Login attempt with credentials:', credentials);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('AuthService: Login successful:', response.data);
      
      // Store the token if provided
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('AuthService: Login failed:', error);
      throw error;
    }
  },

  // Register new user
  register: async (userData: RegisterData) => {
    console.log('AuthService: Registering user with data:', userData);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('AuthService: Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Registration failed:', error);
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: PasswordChangeData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      // Clear stored token
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      // Clear token even if logout request fails
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Check if user is authenticated
  checkAuth: async () => {
    console.log('AuthService: Checking authentication status');
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('AuthService: No token found');
        return { isAuthenticated: false, user: null };
      }
      
      const response = await api.get('/auth/check');
      console.log('AuthService: Authentication check response:', response.data);
      return { isAuthenticated: response.data.success, user: response.data.user };
    } catch (error) {
      console.error('AuthService: Authentication check failed:', error);
      // Remove invalid token
      localStorage.removeItem('authToken');
      return { isAuthenticated: false, user: null };
    }
  },

  // Request password reset
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

export default AuthService;
