import React, { useEffect, useState } from 'react';
import { Tab, Nav, Card, Alert, Form, Button, Badge } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faCar, faStar, faLock, faCalendar, 
  faEye, faTimes, faSave, faInfoCircle, faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

// Import services
import { AuthService, UserProfile as AuthUserProfile } from '../services/authService';
import { RentalService, Rental } from '../services/rentalService';
import { ReviewService, Review } from '../services/reviewService';

import '../styles/style.css';

// Type definitions for our data
interface UserProfile extends AuthUserProfile {}

// No need to redefine Rental and Review types as we're importing them from services

// Validation schemas
const ProfileSchema = Yup.object().shape({
  full_name: Yup.string().required('Full name is required'),
  phone: Yup.string(),
  date_of_birth: Yup.date(),
  address: Yup.string()
});

const PasswordSchema = Yup.object().shape({
  current_password: Yup.string().required('Current password is required'),
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Password confirmation is required')
});

const Dashboard: React.FC = () => {
  // State hooks
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileAlert, setProfileAlert] = useState<{message: string, type: string} | null>(null);
  const [securityAlert, setSecurityAlert] = useState<{message: string, type: string} | null>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Fetch tab specific data when tab changes
  useEffect(() => {
    if (activeTab === 'rentals') {
      fetchUserRentals();
    } else if (activeTab === 'reviews') {
      fetchUserReviews();
    }
  }, [activeTab]);

  // API calls
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.getProfile();
      setUserProfile(response.user);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError('Failed to load profile data');
      setIsLoading(false);
      
      // Redirect to login if unauthorized
      if (err instanceof Error && (err as any).response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  const fetchUserRentals = async () => {
    try {
      const response = await RentalService.getUserRentals();
      setRentals(response.rentals || []);
    } catch (err) {
      console.error('Failed to load rentals:', err);
      setError('Failed to load rentals');
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await ReviewService.getUserReviews();
      setReviews(response.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to load reviews');
    }
  };

  const handleProfileUpdate = async (values: any, { setSubmitting }: any) => {
    try {
      const response = await AuthService.updateProfile(values);
      if (response.success) {
        setProfileAlert({ message: 'Profile updated successfully!', type: 'success' });
        setUserProfile({...userProfile, ...values} as UserProfile);
        
        // Auto-hide the alert after 3 seconds
        setTimeout(() => {
          setProfileAlert(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileAlert({ message: 'Failed to update profile. Please try again.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const response = await AuthService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password
      });
      
      if (response.success) {
        setSecurityAlert({ message: 'Password changed successfully!', type: 'success' });
        resetForm();
        
        // Auto-hide the alert after 3 seconds
        setTimeout(() => {
          setSecurityAlert(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Password change error:', err);
      const errorMessage = err instanceof Error && (err as any).response?.data?.message 
        ? (err as any).response.data.message 
        : 'Failed to change password. Please try again.';
      setSecurityAlert({ message: errorMessage, type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRental = async (rentalId: number) => {
    if (!window.confirm('Are you sure you want to cancel this rental?')) {
      return;
    }
    
    try {
      const response = await RentalService.cancelRental(rentalId);
      if (response.success) {
        setProfileAlert({ message: 'Rental cancelled successfully', type: 'success' });
        fetchUserRentals(); // Reload rentals
      }
    } catch (err) {
      console.error('Cancel rental error:', err);
      setProfileAlert({ message: 'Failed to cancel rental. Please try again.', type: 'danger' });
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const generateStarRating = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <FontAwesomeIcon 
        key={i} 
        icon={faStar} 
        className={i < rating ? 'text-warning' : 'text-muted'}
      />
    ));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-5">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">My Dashboard</h1>
      
      {profileAlert && (
        <Alert variant={profileAlert.type} dismissible onClose={() => setProfileAlert(null)}>
          {profileAlert.message}
        </Alert>
      )}
      
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center mb-3">
                <div className="avatar-placeholder mb-2">
                  <FontAwesomeIcon icon={faUser} size="3x" />
                </div>
                <h5>{userProfile?.full_name || 'User'}</h5>
                <p className="text-muted">{userProfile?.email || 'user@example.com'}</p>
              </div>
              
              <hr />
              
              <Nav className="flex-column nav-pills">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" /> Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'rentals'} 
                    onClick={() => setActiveTab('rentals')}
                  >
                    <FontAwesomeIcon icon={faCar} className="me-2" /> My Rentals
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'reviews'} 
                    onClick={() => setActiveTab('reviews')}
                  >
                    <FontAwesomeIcon icon={faStar} className="me-2" /> My Reviews
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')}
                  >
                    <FontAwesomeIcon icon={faLock} className="me-2" /> Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="col-md-9">
          <Tab.Content>
            {/* Profile Tab */}
            <Tab.Pane active={activeTab === 'profile'}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h3 className="card-title mb-4">My Profile</h3>
                  
                  {userProfile && (
                    <Formik
                      initialValues={{
                        full_name: userProfile.full_name || '',
                        email: userProfile.email || '',
                        phone: userProfile.phone || '',
                        date_of_birth: userProfile.date_of_birth ? userProfile.date_of_birth.split('T')[0] : '',
                        address: userProfile.address || ''
                      }}
                      validationSchema={ProfileSchema}
                      onSubmit={handleProfileUpdate}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting
                      }) => (
                        <Form onSubmit={handleSubmit}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="full_name">Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              id="full_name"
                              name="full_name"
                              value={values.full_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.full_name && !!errors.full_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.full_name}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="email">Email Address</Form.Label>
                            <Form.Control
                              type="email"
                              id="email"
                              name="email"
                              value={values.email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              readOnly
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed. Contact support if needed.
                            </Form.Text>
                          </Form.Group>
                          
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <Form.Group>
                                <Form.Label htmlFor="phone">Phone Number</Form.Label>
                                <Form.Control
                                  type="tel"
                                  id="phone"
                                  name="phone"
                                  value={values.phone}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.phone && !!errors.phone}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.phone}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </div>
                            
                            <div className="col-md-6 mb-3">
                              <Form.Group>
                                <Form.Label htmlFor="date_of_birth">Date of Birth</Form.Label>
                                <Form.Control
                                  type="date"
                                  id="date_of_birth"
                                  name="date_of_birth"
                                  value={values.date_of_birth}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  isInvalid={touched.date_of_birth && !!errors.date_of_birth}
                                />
                                <Form.Control.Feedback type="invalid">
                                  {errors.date_of_birth}
                                </Form.Control.Feedback>
                              </Form.Group>
                            </div>
                          </div>
                          
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="address">Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              id="address"
                              name="address"
                              rows={3}
                              value={values.address}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.address && !!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.address}
                            </Form.Control.Feedback>
                          </Form.Group>
                          
                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faSave} className="me-2" />
                                  Update Profile
                                </>
                              )}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Rentals Tab */}
            <Tab.Pane active={activeTab === 'rentals'}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h3 className="card-title mb-4">My Rentals</h3>
                  
                  <div className="row">
                    {rentals.length === 0 ? (
                      <div className="col-12 text-center py-5">
                        <Alert variant="info">
                          <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                          You haven't made any rentals yet. 
                          <a href="/vehicles-list" className="alert-link ms-1">Browse vehicles</a> to get started.
                        </Alert>
                      </div>
                    ) : (
                      rentals.map(rental => (
                        <div className="col-md-6 mb-4" key={rental.rental_id}>
                          <Card className="h-100 shadow-sm">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">{rental.vehicle_make} {rental.vehicle_model}</h6>
                                <Badge bg={getStatusBadgeColor(rental.status)}>{rental.status}</Badge>
                              </div>
                              
                              <p className="card-text small text-muted mb-2">
                                <FontAwesomeIcon icon={faCalendar} className="me-1" />
                                {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                              </p>
                              
                              <p className="card-text">
                                <strong>Total: ₹{rental.total_amount}</strong>
                              </p>
                              
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => window.location.href = `/rental/${rental.rental_id}`}
                                >
                                  <FontAwesomeIcon icon={faEye} className="me-1" />
                                  View Details
                                </Button>
                                
                                {rental.status === 'confirmed' && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => cancelRental(rental.rental_id)}
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ))
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Reviews Tab */}
            <Tab.Pane active={activeTab === 'reviews'}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h3 className="card-title mb-4">My Reviews</h3>
                  
                  {reviews.length === 0 ? (
                    <div className="text-center py-5">
                      <Alert variant="info">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        You haven't written any reviews yet.
                      </Alert>
                    </div>
                  ) : (
                    reviews.map((review, index) => (
                      <Card className="mb-3" key={index}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">{review.vehicle_make} {review.vehicle_model}</h6>
                            <div className="text-warning">
                              {generateStarRating(review.rating)}
                            </div>
                          </div>
                          
                          <p className="card-text">{review.comment}</p>
                          
                          <small className="text-muted">
                            <FontAwesomeIcon icon={faCalendar} className="me-1" />
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Tab.Pane>
            
            {/* Security Tab */}
            <Tab.Pane active={activeTab === 'security'}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h3 className="card-title mb-4">Security Settings</h3>
                  
                  {securityAlert && (
                    <Alert variant={securityAlert.type} dismissible onClose={() => setSecurityAlert(null)}>
                      {securityAlert.message}
                    </Alert>
                  )}
                  
                  <Formik
                    initialValues={{
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    }}
                    validationSchema={PasswordSchema}
                    onSubmit={handlePasswordChange}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label htmlFor="current_password">Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            id="current_password"
                            name="current_password"
                            value={values.current_password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.current_password && !!errors.current_password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.current_password}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label htmlFor="new_password">New Password</Form.Label>
                          <Form.Control
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={values.new_password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.new_password && !!errors.new_password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.new_password}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label htmlFor="confirm_password">Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={values.confirm_password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirm_password && !!errors.confirm_password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirm_password}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Changing Password...' : 'Change Password'}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;