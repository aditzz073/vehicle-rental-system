import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCarAlt, faTachometerAlt, faCog, faUsers, faThumbsUp, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

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
}

const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles/featured');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured vehicles');
        }
        
        const data = await response.json();
        setFeaturedVehicles(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading featured vehicles. Please try again later.');
        setLoading(false);
        console.error('Error fetching featured vehicles:', err);
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
      <section>
        <Container>
          <div className="text-center mb-5">
            <h2>Featured Vehicles</h2>
            <p className="lead text-muted">
              Discover our most popular and exclusive vehicles
            </p>
          </div>
          
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading featured vehicles...</p>
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
                        
                        <div className="vehicle-features">
                          {vehicle.features && vehicle.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="vehicle-feature">{feature}</span>
                          ))}
                        </div>
                        
                        <div className="d-grid gap-2 mt-3">
                          <Link 
                            to={`/vehicles/${vehicle.id}`} 
                            className="btn btn-outline-primary"
                          >
                            View Details
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <p>No featured vehicles available at the moment.</p>
                    <Link to="/vehicles" className="btn btn-primary">
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
      
      {/* Why Choose Us Section */}
      <section className="bg-light">
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