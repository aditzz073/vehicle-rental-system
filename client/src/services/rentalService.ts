import api from './api';

// Types
export interface Rental {
  rental_id: number;
  user_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_image?: string;
}

export interface RentalCreateData {
  vehicle_id: number;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  dropoff_location?: string;
  special_requests?: string;
}

export interface PaymentData {
  rental_id: number;
  amount: number;
  payment_method: string;
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
}

// Rental Service
export const RentalService = {
  // Get user rentals
  getUserRentals: async () => {
    const response = await api.get('/rentals/my-rentals');
    return response.data;
  },

  // Get rental by ID
  getRentalById: async (id: number | string) => {
    const response = await api.get(`/rentals/${id}`);
    return response.data;
  },

  // Create a new rental
  createRental: async (rentalData: RentalCreateData) => {
    const response = await api.post('/rentals', rentalData);
    return response.data;
  },

  // Cancel a rental
  cancelRental: async (rentalId: number | string) => {
    const response = await api.put(`/rentals/${rentalId}/cancel`);
    return response.data;
  },

  // Process payment for a rental
  processPayment: async (paymentData: PaymentData) => {
    const response = await api.post(`/rentals/${paymentData.rental_id}/payment`, paymentData);
    return response.data;
  },

  // Get upcoming rentals
  getUpcomingRentals: async () => {
    const response = await api.get('/rentals/upcoming');
    return response.data;
  },

  // Get rental history
  getRentalHistory: async () => {
    const response = await api.get('/rentals/history');
    return response.data;
  },

  // Extend a rental
  extendRental: async (rentalId: number | string, endDate: string) => {
    const response = await api.post(`/rentals/${rentalId}/extend`, { end_date: endDate });
    return response.data;
  }
};

export default RentalService;
