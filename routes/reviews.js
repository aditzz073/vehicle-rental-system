const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.get('/recent', ReviewController.getRecentReviews);
router.get('/top-rated-vehicles', ReviewController.getTopRatedVehicles);
router.get('/rating-distribution', ReviewController.getRatingDistribution);
router.get('/platform-stats', ReviewController.getPlatformStats);
router.get('/vehicle/:vehicle_id', ReviewController.getVehicleReviews);
router.get('/vehicle/:vehicle_id/summary', ReviewController.getVehicleRatingSummary);
router.get('/:id', ReviewController.getReviewById);

// Protected routes - user must be authenticated
router.use(isAuthenticated);

// Review management
router.post('/', ReviewController.createReview);
router.get('/', ReviewController.getAllReviews);
router.get('/user/reviews', ReviewController.getUserReviews);
router.get('/user/reviewable', ReviewController.getReviewableRentals);
router.put('/:id', ReviewController.updateReview);
router.delete('/:id', ReviewController.deleteReview);

// Check review eligibility
router.get('/rental/:rental_id/eligibility', ReviewController.checkReviewEligibility);

module.exports = router;
