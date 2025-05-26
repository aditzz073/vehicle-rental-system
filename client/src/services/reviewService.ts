import api from './api';

// Types
export interface Review {
  review_id: number;
  user_id: number;
  vehicle_id: number;
  rental_id?: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

export interface ReviewCreateData {
  vehicle_id: number;
  rental_id?: number;
  rating: number;
  comment: string;
}

// Review Service
export const ReviewService = {
  // Get user reviews
  getUserReviews: async () => {
    const response = await api.get('/reviews/user/reviews');
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData: ReviewCreateData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update an existing review
  updateReview: async (reviewId: number, reviewData: Partial<ReviewCreateData>) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: number) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get reviews for a specific vehicle
  getVehicleReviews: async (vehicleId: number) => {
    const response = await api.get(`/reviews/vehicle/${vehicleId}`);
    return response.data;
  },

  // Get rating summary for a vehicle
  getVehicleRatingSummary: async (vehicleId: number) => {
    const response = await api.get(`/reviews/vehicle/${vehicleId}/summary`);
    return response.data;
  },

  // Get recent reviews (for homepage, etc.)
  getRecentReviews: async (limit = 5) => {
    const response = await api.get('/reviews/recent', { params: { limit } });
    return response.data;
  },

  // Get top-rated vehicles
  getTopRatedVehicles: async (limit = 5) => {
    const response = await api.get('/reviews/top-rated-vehicles', { params: { limit } });
    return response.data;
  },

  // Check if user can review a specific rental
  checkReviewEligibility: async (rentalId: number) => {
    const response = await api.get(`/reviews/rental/${rentalId}/eligibility`);
    return response.data;
  },

  // Get list of rentals that can be reviewed
  getReviewableRentals: async () => {
    const response = await api.get('/reviews/user/reviewable');
    return response.data;
  }
};

export default ReviewService;
