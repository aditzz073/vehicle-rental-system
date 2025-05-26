import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCarAlt, faTachometerAlt, faCog, faUsers, faThumbsUp, faShieldAlt, faGasPump, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// Enhanced Types to match API response
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
  features: string | string[]; // Can be string or array
  location?: string;
  transmission?: string;
  fuel_type?: string;
  seating_capacity?: number;
}

const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        setLoading(true);
        // Fixed API endpoint to use absolute URL
        const response = await fetch('http://localhost:8000/api/vehicles/featured');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured vehicles: ${response.status}`);
        }
        
        const data = await response.json();
        // Handle the API response structure with success wrapper
        const vehiclesData = data.success ? data.vehicles : data;
        setFeaturedVehicles(vehiclesData);
      } catch (err) {
        console.error('Error fetching featured vehicles:', err);
        setError('Error loading featured vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedVehicles();
  }, []);

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

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="animated">
              <h1 className="display-4">Find Your Perfect Ride</h1>
              <p className="lead">
                Rent premium vehicles for your journey with our easy booking system.
                Choose from a wide range of cars for any occasion.
              </p>
              <div className="mt-4">
                <Link to="/vehicles" className="btn btn-primary btn-lg me-2">
                  Browse Vehicles
                </Link>
                <Link to="/booking-new" className="btn btn-outline-light btn-lg">
                  <FontAwesomeIcon icon={faStar} className="me-1" /> Try New Booking
                </Link>
              </div>
            </Col>
            <Col md={6} className="animated">
              <img 
                src="/images/vehicle.png" 
                alt="Luxury Car" 
                className="img-fluid rounded shadow"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Luxury+Vehicle';
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* New Booking Experience Banner */}
      <Container className="mt-4">
        <Alert variant="primary" className="d-flex align-items-center p-4 rounded-lg shadow-sm">
          <div className="flex-shrink-0 me-3">
            <FontAwesomeIcon icon={faCarAlt} className="fa-2x text-primary" />
          </div>
          <div className="flex-grow-1">
            <h4 className="alert-heading mb-1">Try Our New Booking Experience!</h4>
            <p className="mb-0">
              We've redesigned our booking process to make it easier and faster to find and book your perfect vehicle.
            </p>
          </div>
          <div className="flex-shrink-0 ms-3">
            <Link to="/booking-new" className="btn btn-primary">Try Now</Link>
          </div>
        </Alert>
      </Container>
      
      {/* Featured Vehicles Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Featured Vehicles</h2>
            <p className="lead text-muted">
              Discover our most popular and exclusive vehicles
            </p>
          </div>
          
          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
              <div className="mt-3">
                <h5>Loading Featured Vehicles</h5>
                <p className="text-muted">Please wait while we fetch our best vehicles for you...</p>
              </div>
            </div>
          )}
          
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          
          {!loading && !error && (
            <Row>
              {featuredVehicles.length > 0 ? (
                featuredVehicles.map((vehicle) => (
                  <Col key={vehicle.id} lg={4} md={6} className="mb-4">
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
                            <span className="ms-1">({(parseFloat(vehicle.rating) || 0).toFixed(1)})</span>
                          </span>
                        </div>
                        <Card.Title>{vehicle.make} {vehicle.model} ({vehicle.year})</Card.Title>
                        <div className="vehicle-price mb-3">${vehicle.daily_rate}/day</div>
                        
                        {/* Location and Transmission Info */}
                        {(vehicle.location || vehicle.transmission) && (
                          <div className="d-flex mb-3">
                            {vehicle.location && (
                              <div className="me-3">
                                <small className="text-muted d-block">
                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                                  Location
                                </small>
                                <span>{vehicle.location}</span>
                              </div>
                            )}
                            {vehicle.transmission && (
                              <div>
                                <small className="text-muted d-block">
                                  <FontAwesomeIcon icon={faCog} className="me-1" />
                                  Transmission
                                </small>
                                <span>{vehicle.transmission}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="vehicle-features">
                          {vehicle.features && (
                            Array.isArray(vehicle.features) 
                              ? vehicle.features.slice(0, 3).map((feature: string, index: number) => (
                                  <span key={index} className="vehicle-feature">{feature}</span>
                                ))
                              : typeof vehicle.features === 'string' 
                                ? vehicle.features.split(',').slice(0, 3).map((feature: string, index: number) => (
                                    <span key={index} className="vehicle-feature">{feature.trim()}</span>
                                  ))
                                : null
                          )}
                        </div>
                        
                        <div className="d-flex gap-2 mt-3">
                          <Link 
                            to={`/vehicles/${vehicle.id}`} 
                            className="btn btn-outline-primary flex-fill"
                          >
                            View Details
                          </Link>
                          <Link 
                            to={`/booking?vehicle=${vehicle.id}`} 
                            className="btn btn-primary flex-fill"
                          >
                            Book Now
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <FontAwesomeIcon icon={faCarAlt} size="4x" className="text-muted mb-3" />
                    <h4 className="text-muted">No Featured Vehicles Available</h4>
                    <p className="text-muted mb-4">
                      We're currently updating our featured collection. Check out all our available vehicles instead!
                    </p>
                    <Link to="/vehicles" className="btn btn-primary btn-lg">
                      Browse All Vehicles
                    </Link>
                  </div>
                </Col>
              )}
            </Row>
          )}
          
          <div className="text-center mt-4">
            <Link to="/vehicles" className="btn btn-primary">
              View All Vehicles
            </Link>
          </div>
        </Container>
      </section>
      
      {/* Quick Booking CTA Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)' }}>
        <Container>
          <Row className="align-items-center text-white">
            <Col md={8}>
              <h3 className="mb-2">Need a Vehicle Right Now?</h3>
              <p className="mb-0 opacity-75">
                Skip the browsing and get instant access to available vehicles in your area. 
                Our quick booking system finds the perfect match for your needs.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Link to="/booking-new" className="btn btn-light btn-lg">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Quick Book Now
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Statistics Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary mb-0">500+</h3>
                <p className="text-muted mb-0">Premium Vehicles</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary mb-0">10,000+</h3>
                <p className="text-muted mb-0">Happy Customers</p>
              </div>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary mb-0">15+</h3>
                <p className="text-muted mb-0">City Locations</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stat-item">
                <h3 className="display-4 fw-bold text-primary mb-0">24/7</h3>
                <p className="text-muted mb-0">Customer Support</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2>Why Choose AutoHive</h2>
            <p className="lead text-muted">
              We provide premium service with attention to every detail
            </p>
          </div>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faTachometerAlt} size="2x" />
                  </div>
                  <Card.Title>Fast & Easy Booking</Card.Title>
                  <Card.Text>
                    Book your vehicle in minutes with our streamlined reservation system.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faCog} size="2x" />
                  </div>
                  <Card.Title>Well-Maintained Fleet</Card.Title>
                  <Card.Text>
                    All our vehicles undergo rigorous maintenance checks for your safety.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faUsers} size="2x" />
                  </div>
                  <Card.Title>24/7 Customer Support</Card.Title>
                  <Card.Text>
                    Our dedicated team is available round the clock to assist you.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faThumbsUp} size="2x" />
                  </div>
                  <Card.Title>Flexible Rental Options</Card.Title>
                  <Card.Text>
                    Choose from daily, weekly, or monthly rental options to suit your needs.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                  </div>
                  <Card.Title>Comprehensive Insurance</Card.Title>
                  <Card.Text>
                    Drive with peace of mind with our inclusive insurance coverage.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="border-0 h-100 text-center">
                <Card.Body>
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faCarAlt} size="2x" />
                  </div>
                  <Card.Title>Wide Vehicle Selection</Card.Title>
                  <Card.Text>
                    From economy cars to luxury vehicles, we have options for every occasion.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Call to Action */}
      <section className="bg-primary text-white text-center py-5">
        <Container>
          <h2 className="mb-4">Ready to Experience Premium Vehicle Rental?</h2>
          <p className="lead mb-4">
            Join thousands of satisfied customers who trust AutoHive for their transportation needs.
          </p>
          <Link to="/register" className="btn btn-light btn-lg px-4">
            Register Now
          </Link>
        </Container>
      </section>
    </>
  );
};

export default Home;