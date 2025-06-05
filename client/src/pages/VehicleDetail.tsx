import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Tabs, Tab, Form } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faCalendarAlt, 
  faGasPump, 
  faCogs, 
  faUsers, 
  faRoad, 
  faCheckCircle,
  faSpinner,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';

// Types
interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  image_url: string;
  daily_rate: string; // Comes from DB as string
  category: string;
  rating: string; // Comes from DB as string
  features: string[];
  location: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  description: string;
  mileage: number;
  availability: boolean;
  images: string[];
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch vehicle details
        const vehicleResponse = await fetch(`/api/vehicles/${id}`);
        
        if (!vehicleResponse.ok) {
          throw new Error('Failed to fetch vehicle details');
        }
        
        const vehicleData = await vehicleResponse.json();
        setVehicle(vehicleData);
        
        // Fetch vehicle reviews
        const reviewsResponse = await fetch(`/api/vehicles/${id}/reviews`);
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
        
        // Fetch similar vehicles
        const similarResponse = await fetch(`/api/vehicles/${id}/similar`);
        
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          setSimilarVehicles(similarData);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error loading vehicle details. Please try again later.');
        setLoading(false);
        console.error('Error fetching vehicle details:', err);
      }
    };

    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);

  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={i <= rating ? 'text-warning' : 'text-muted'}
        />
      );
    }
    
    return stars;
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error || 'Vehicle not found'}
        </Alert>
        <Button variant="primary" onClick={handleBack}>
          <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
          Back to Vehicles
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <Button 
                variant="outline-light" 
                className="mb-2"
                onClick={handleBack}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
                Back
              </Button>
              <h1 className="mb-1">{vehicle.make} {vehicle.model} ({vehicle.year})</h1>
              <div className="d-flex align-items-center">
                <span className="me-3">{vehicle.category}</span>
                <span className="me-3">|</span>
                <span className="rating me-1">
                  {renderStars(parseFloat(vehicle.rating) || 0)}
                </span>
                <span>({(parseFloat(vehicle.rating) || 0).toFixed(1)})</span>
              </div>
            </Col>
            <Col xs="auto">
              <div className="text-end">
                <div className="vehicle-price fs-3 fw-bold mb-2">₹{(parseFloat(vehicle.daily_rate) * 80).toFixed(2)}/day</div>
                <Badge bg={vehicle.availability ? 'success' : 'danger'} className="px-3 py-2">
                  {vehicle.availability ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          {/* Vehicle Images and Details */}
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-0">
                <div className="position-relative">
                  <img 
                    src={vehicle.image_url} 
                    alt={`${vehicle.make} ${vehicle.model}`} 
                    className="img-fluid w-100"
                    style={{ height: '400px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/800x400?text=Vehicle+Image';
                    }}
                  />
                  <div 
                    className="position-absolute bottom-0 start-0 w-100 p-3"
                    style={{ 
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
                      color: 'white' 
                    }}
                  >
                    <h4 className="mb-0">{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {vehicle.images && vehicle.images.length > 0 && (
                  <div className="d-flex flex-wrap p-3 gap-2" id="vehicle-gallery">
                    {vehicle.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`${vehicle.make} ${vehicle.model} view ${index + 1}`}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/80x80?text=Image';
                        }}
                      />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
            
            <Tabs defaultActiveKey="details" id="vehicle-details-tabs" className="mb-4">
              <Tab eventKey="details" title="Vehicle Details">
                <Card className="shadow-sm">
                  <Card.Body>
                    <h4>About this vehicle</h4>
                    <p>{vehicle.description || 'No description available for this vehicle.'}</p>
                    
                    <h5 className="mt-4">Specifications</h5>
                    <Row className="mt-3">
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary fa-lg" />
                          </div>
                          <div>
                            <div className="text-muted small">Year</div>
                            <div>{vehicle.year}</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FontAwesomeIcon icon={faGasPump} className="text-primary fa-lg" />
                          </div>
                          <div>
                            <div className="text-muted small">Fuel Type</div>
                            <div>{vehicle.fuel_type}</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FontAwesomeIcon icon={faCogs} className="text-primary fa-lg" />
                          </div>
                          <div>
                            <div className="text-muted small">Transmission</div>
                            <div>{vehicle.transmission}</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FontAwesomeIcon icon={faUsers} className="text-primary fa-lg" />
                          </div>
                          <div>
                            <div className="text-muted small">Seats</div>
                            <div>{vehicle.seats} passengers</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <FontAwesomeIcon icon={faRoad} className="text-primary fa-lg" />
                          </div>
                          <div>
                            <div className="text-muted small">Mileage</div>
                            <div>{vehicle.mileage} miles</div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <h5 className="mt-4">Features</h5>
                    <Row className="mt-3">
                      {vehicle.features && vehicle.features.map((feature, index) => (
                        <Col md={6} key={index} className="mb-2">
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                            <span>{feature}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>
              
              <Tab eventKey="reviews" title={`Reviews (${reviews.length})`}>
                <Card className="shadow-sm">
                  <Card.Body>
                    {reviews.length > 0 ? (
                      <>
                        <h4 className="mb-4">Customer Reviews</h4>
                        {reviews.map((review) => (
                          <div key={review.id} className="mb-4 pb-4 border-bottom">
                            <div className="d-flex justify-content-between mb-2">
                              <h5 className="mb-0">{review.user_name}</h5>
                              <span className="text-muted small">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="rating mb-2">
                              {renderStars(review.rating)}
                              <span className="ms-2">({review.rating}/5)</span>
                            </div>
                            <p className="mb-0">{review.comment}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p>No reviews yet for this vehicle.</p>
                        <p>Be the first to review after your rental!</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
            
            {/* Similar Vehicles */}
            {similarVehicles.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-4">Similar Vehicles</h3>
                <Row>
                  {similarVehicles.slice(0, 3).map((vehicle) => (
                    <Col md={4} key={vehicle.id} className="mb-4">
                      <Card className="vehicle-card h-100 shadow-sm">
                        <Card.Img 
                          variant="top" 
                          src={vehicle.image_url} 
                          alt={`${vehicle.make} ${vehicle.model}`}
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400?text=Vehicle+Image';
                          }}
                        />
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="vehicle-category">{vehicle.category}</span>
                            <span className="rating">
                              {renderStars(parseFloat(vehicle.rating) || 0)}
                            </span>
                          </div>
                          <Card.Title>{vehicle.make} {vehicle.model}</Card.Title>
                          <div className="vehicle-price mb-3">₹{(parseFloat(vehicle.daily_rate) * 80).toFixed(2)}/day</div>
                          <Link 
                            to={`/vehicles/${vehicle.id}`} 
                            className="btn btn-outline-primary w-100"
                          >
                            View Details
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Col>
          
          {/* Booking Form */}
          <Col lg={4}>
            <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-white py-3">
                <h4 className="mb-0">Book This Vehicle</h4>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Pick-up Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Return Date</Form.Label>
                    <Form.Control 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Pick-up Location</Form.Label>
                    <Form.Select>
                      <option value={vehicle.location}>{vehicle.location}</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    <Link 
                      to={`/booking-new?vehicle=${vehicle.id}`} 
                      className="btn btn-primary btn-lg"
                    >
                      {vehicle.availability ? 'Book Now' : 'Check Other Dates'}
                    </Link>
                    
                    {!vehicle.availability && (
                      <Alert variant="warning" className="mb-0 mt-3">
                        <FontAwesomeIcon icon={faSpinner} className="me-2" />
                        This vehicle is currently unavailable for the selected dates.
                      </Alert>
                    )}
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer className="bg-white">
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted">Price</span>
                  <span className="vehicle-price fs-4">₹{(parseFloat(vehicle.daily_rate) * 80).toFixed(2)}/day</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-top">
                  <span className="text-muted">Location</span>
                  <span>{vehicle.location}</span>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VehicleDetail;