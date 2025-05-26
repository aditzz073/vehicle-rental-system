import React from 'react';
import { Container, Row, Col, Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHistory, 
  faBullseye, 
  faAward, 
  faUsers, 
  faHandshake, 
  faLeaf,
  faCar,
  faGlobeAmericas,
  faShieldAlt,
  faStar,
  faCalendarAlt,
  faThumbsUp
} from '@fortawesome/free-solid-svg-icons';

const About: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-5 page-header">
        <Container className="text-center">
          <h1 className="display-4 fw-bold mb-3 fade-in">About AutoHive</h1>
          <p className="lead mb-4 fade-in">
            Premium vehicle rentals for every journey since 2015
          </p>
          <Row className="justify-content-center">
            <Col md={8}>
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2 stats-badge">
                  <FontAwesomeIcon icon={faCar} className="me-2" />
                  500+ Vehicles
                </Badge>
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2 stats-badge">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  10,000+ Customers
                </Badge>
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2 stats-badge">
                  <FontAwesomeIcon icon={faGlobeAmericas} className="me-2" />
                  15+ Cities
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Our Story */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <img 
                src="/images/about-company.jpg" 
                alt="AutoHive Team" 
                className="img-fluid rounded shadow"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=About+AutoHive';
                }}
              />
            </Col>
            <Col lg={6}>
              <h2 className="mb-4">Our Story</h2>          <p className="lead text-primary mb-4">
            From a small fleet to a nationwide premium vehicle rental service
          </p>
          <p>
            AutoHive was founded in 2015 with a simple mission: to provide exceptional 
            vehicle rental experiences with transparent pricing and superior customer service. 
            What started as a small fleet of luxury vehicles in Bangalore has grown into 
            a nationwide operation with thousands of satisfied customers across India.
          </p>
          <p>
            Our founders, Alex Chen and Sarah Williams, saw an opportunity to disrupt the 
            traditional car rental industry by focusing on premium vehicles, flexible rental 
            options, and a tech-forward approach that makes booking and managing rentals 
            seamless and stress-free.
          </p>
          <p>
            Today, AutoHive continues to lead the industry with innovative solutions, 
            a diverse fleet of well-maintained vehicles, and our unwavering commitment 
            to customer satisfaction. We've expanded from our humble beginnings to serve 
            customers in over 15 cities across India, with plans for continued growth.
          </p>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Company Milestones */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Our Journey & Milestones</h2>
            <p className="lead text-muted">
              Key achievements that mark our growth and commitment to excellence
            </p>
          </div>
          
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center h-100">
                <Card.Body className="p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
                  </div>
                  <h3 className="text-primary mb-2">2015</h3>
                  <h5>Founded</h5>
                  <p className="small">
                    AutoHive was established with a vision to revolutionize the vehicle rental industry
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center h-100">
                <Card.Body className="p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faCar} size="2x" />
                  </div>
                  <h3 className="text-primary mb-2">2018</h3>
                  <h5>500+ Vehicles</h5>
                  <p className="small">
                    Expanded our fleet to over 500 premium vehicles across multiple categories
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center h-100">
                <Card.Body className="p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faAward} size="2x" />
                  </div>
                  <h3 className="text-primary mb-2">2021</h3>
                  <h5>Industry Awards</h5>
                  <p className="small">
                    Recognized as "Best Customer Service" and "Innovation Leader" in vehicle rentals
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center h-100">
                <Card.Body className="p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faGlobeAmericas} size="2x" />
                  </div>
                  <h3 className="text-primary mb-2">2025</h3>
                  <h5>National Presence</h5>
                  <p className="small">
                    Expanded to 15+ cities with plans for international growth
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Our Values */}
      <section className="bg-light py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Our Core Values</h2>
            <p className="lead text-muted">
              The principles that guide everything we do at AutoHive
            </p>
          </div>
          
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faAward} size="2x" />
                  </div>
                  <Card.Title>Excellence</Card.Title>
                  <Card.Text>
                    We strive for excellence in every aspect of our service, from vehicle 
                    maintenance to customer interactions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faHandshake} size="2x" />
                  </div>
                  <Card.Title>Integrity</Card.Title>
                  <Card.Text>
                    We operate with transparency and honesty, ensuring that our customers 
                    always know what to expect with no hidden fees or surprises.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faUsers} size="2x" />
                  </div>
                  <Card.Title>Customer-Focused</Card.Title>
                  <Card.Text>
                    Our customers are at the heart of everything we do. We continuously 
                    seek feedback and improve our services to exceed expectations.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faLeaf} size="2x" />
                  </div>
                  <Card.Title>Sustainability</Card.Title>
                  <Card.Text>
                    We're committed to reducing our environmental impact through efficient 
                    operations and an expanding fleet of electric and hybrid vehicles.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faBullseye} size="2x" />
                  </div>
                  <Card.Title>Innovation</Card.Title>
                  <Card.Text>
                    We embrace technology and creative solutions to continuously improve 
                    our services and stay ahead of industry trends.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="avatar-placeholder mb-3">
                    <FontAwesomeIcon icon={faHistory} size="2x" />
                  </div>
                  <Card.Title>Reliability</Card.Title>
                  <Card.Text>
                    Our customers can count on us for well-maintained vehicles and consistent, 
                    dependable service every time.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Our Performance & Stats */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Our Performance Speaks for Itself</h2>
            <p className="lead text-muted">
              Numbers that demonstrate our commitment to excellence
            </p>
          </div>
          
          <Row>
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="mb-3">Customer Satisfaction</h5>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Overall Rating</span>
                    <div>
                      <span className="me-2">4.8/5.0</span>
                      <FontAwesomeIcon icon={faStar} className="text-warning" />
                      <FontAwesomeIcon icon={faStar} className="text-warning" />
                      <FontAwesomeIcon icon={faStar} className="text-warning" />
                      <FontAwesomeIcon icon={faStar} className="text-warning" />
                      <FontAwesomeIcon icon={faStar} className="text-warning" />
                    </div>
                  </div>
                  <ProgressBar now={96} className="mb-3" />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Customer Retention</span>
                    <span>94%</span>
                  </div>
                  <ProgressBar now={94} className="mb-3" />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Repeat Customers</span>
                    <span>87%</span>
                  </div>
                  <ProgressBar now={87} />
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="mb-3">Operational Excellence</h5>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Vehicle Availability</span>
                    <span>99.2%</span>
                  </div>
                  <ProgressBar now={99.2} className="mb-3" />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>On-Time Delivery</span>
                    <span>98.5%</span>
                  </div>
                  <ProgressBar now={98.5} className="mb-3" />
                  
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span>Fleet Utilization</span>
                    <span>85%</span>
                  </div>
                  <ProgressBar now={85} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Why Choose AutoHive */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Why Choose AutoHive?</h2>
            <p className="lead text-muted">
              What sets us apart from other vehicle rental companies
            </p>
          </div>
          
          <Row>
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                </div>
                <div>
                  <h5>Comprehensive Insurance</h5>
                  <p className="text-muted">
                    Every rental includes full coverage insurance with zero deductible, 
                    giving you complete peace of mind on the road.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faThumbsUp} />
                  </div>
                </div>
                <div>
                  <h5>24/7 Support</h5>
                  <p className="text-muted">
                    Our dedicated customer support team is available round the clock 
                    to assist with any questions or emergencies.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faLeaf} />
                  </div>
                </div>
                <div>
                  <h5>Eco-Friendly Options</h5>
                  <p className="text-muted">
                    Choose from our growing fleet of electric and hybrid vehicles 
                    to reduce your environmental impact.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faCar} />
                  </div>
                </div>
                <div>
                  <h5>Premium Fleet</h5>
                  <p className="text-muted">
                    All vehicles are less than 3 years old and undergo rigorous 
                    maintenance checks to ensure optimal performance.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faHandshake} />
                  </div>
                </div>
                <div>
                  <h5>Flexible Terms</h5>
                  <p className="text-muted">
                    From hourly to monthly rentals, we offer flexible booking 
                    options to suit your specific needs and budget.
                  </p>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="mb-4">
              <div className="d-flex">
                <div className="flex-shrink-0 me-3">
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faAward} />
                  </div>
                </div>
                <div>
                  <h5>Award-Winning Service</h5>
                  <p className="text-muted">
                    Recognized by industry leaders for our outstanding customer 
                    service and innovative approach to vehicle rentals.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Our Team */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">Our Leadership Team</h2>
            <p className="lead text-muted">
              Meet the experts behind AutoHive's success
            </p>
          </div>
          
          <Row>
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center">
                <Card.Img 
                  variant="top" 
                  src="/images/team-1.jpg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300?text=Alex+Chen';
                  }}
                />
                <Card.Body>
                  <Card.Title>Alex Chen</Card.Title>
                  <p className="text-primary">Co-Founder & CEO</p>
                  <p className="small">
                    With over 15 years in the automotive industry, Alex leads AutoHive's 
                    strategic vision and growth initiatives.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center">
                <Card.Img 
                  variant="top" 
                  src="/images/team-2.jpg" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300?text=Sarah+Williams';
                  }}
                />
                <Card.Body>
                  <Card.Title>Sarah Williams</Card.Title>
                  <p className="text-primary">Co-Founder & COO</p>
                  <p className="small">
                    Sarah oversees daily operations and ensures our customer 
                    experience exceeds expectations at every touchpoint.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center">
                <Card.Img 
                  variant="top" 
                  src="/images/team-3.jpg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300?text=David+Kumar';
                  }}
                />
                <Card.Body>
                  <Card.Title>David Kumar</Card.Title>
                  <p className="text-primary">CTO</p>
                  <p className="small">
                    David leads our technology initiatives, ensuring our 
                    digital platforms provide a seamless user experience.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={3} md={6} className="mb-4">
              <Card className="border-0 shadow-sm text-center">
                <Card.Img 
                  variant="top" 
                  src="/images/team-4.jpg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/300x300?text=Lisa+Rodriguez';
                  }}
                />
                <Card.Body>
                  <Card.Title>Lisa Rodriguez</Card.Title>
                  <p className="text-primary">VP of Customer Experience</p>
                  <p className="small">
                    Lisa ensures that every customer interaction with AutoHive 
                    exceeds expectations and builds lasting relationships.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* Call to Action */}
      <section className="bg-primary text-white text-center py-5">
        <Container>
          <h2 className="mb-4">Ready to Experience the AutoHive Difference?</h2>
          <p className="lead mb-4">
            Join thousands of satisfied customers who trust us for their transportation needs.
          </p>
          <Link to="/vehicles" className="btn btn-light btn-lg px-5 me-3">
            Browse Our Vehicles
          </Link>
          <Link to="/contact" className="btn btn-outline-light btn-lg px-5">
            Contact Us
          </Link>
        </Container>
      </section>
    </>
  );
};

export default About;
