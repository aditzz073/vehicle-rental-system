import api from './api';

// Types
export interface Vehicle {
  vehicle_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  seats: number;
  fuel_type: string;
  transmission: string;
  daily_rate: number;
  rating?: number;
  image_url: string;
  description: string;
  is_available: boolean;
  features?: string[];
  location?: string;
}

export interface VehicleFilters {
  make?: string;
  vehicle_type?: string;
  transmission?: string;
  min_price?: number;
  max_price?: number;
  min_seats?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// Vehicle Service
export const VehicleService = {
  // Get all vehicles with optional filters
  getVehicles: async (filters?: VehicleFilters) => {
    const response = await api.get('/vehicles', { params: filters });
    return response.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id: number | string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Get featured vehicles
  getFeaturedVehicles: async () => {
    const response = await api.get('/vehicles/featured');
    return response.data;
  },

  // Get vehicle types for filtering
  getVehicleTypes: async () => {
    const response = await api.get('/vehicles/types');
    return response.data;
  },

  // Check vehicle availability for given dates
  checkAvailability: async (vehicleId: number | string, startDate: string, endDate: string) => {
    const response = await api.get('/rentals/availability', {
      params: { vehicle_id: vehicleId, start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
};

export default VehicleService;
