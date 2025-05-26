import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faBullseye, faAward, faUsers, faHandshake, faLeaf } from '@fortawesome/free-solid-svg-icons';

const About: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-5">
        <Container className="text-center">
          <h1 className="display-4 fw-bold mb-3">About AutoHive</h1>
          <p className="lead mb-0">
            Premium vehicle rentals for every journey since 2015
          </p>
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
              <h2 className="mb-4">Our Story</h2>
              <p className="lead text-primary mb-4">
                From a small fleet to a nationwide premium vehicle rental service
              </p>
              <p>
                AutoHive was founded in 2015 with a simple mission: to provide exceptional 
                vehicle rental experiences with transparent pricing and superior customer service. 
                What started as a small fleet of luxury vehicles in San Francisco has grown into 
                a nationwide operation with thousands of satisfied customers.
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
                to customer satisfaction.
              </p>
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
          <a href="/vehicles" className="btn btn-light btn-lg px-5">
            Browse Our Vehicles
          </a>
        </Container>
      </section>
    </>
  );
};

export default About;
