import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faTwitter, 
  faInstagram, 
  faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faCar 
} from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
  return (
    <footer>
      <Container>
        <Row className="mb-5">
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5 className="mb-3">
              <FontAwesomeIcon icon={faCar} className="me-2" />
              AutoHive
            </h5>
            <p>
              Premium vehicle rental services for all your travel needs. Discover comfort, reliability, 
              and style with our diverse fleet of vehicles.
            </p>
            <div className="social-icons mt-4">
              <a href="https://facebook.com" className="text-white me-3">
                <FontAwesomeIcon icon={faFacebookF} size="lg" />
              </a>
              <a href="https://twitter.com" className="text-white me-3">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a href="https://instagram.com" className="text-white me-3">
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
              <a href="https://linkedin.com" className="text-white">
                <FontAwesomeIcon icon={faLinkedinIn} size="lg" />
              </a>
            </div>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white">Home</Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-white">Browse Vehicles</Link>
              </li>
              <li>
                <Link to="/booking-new" className="text-white">Book Now</Link>
              </li>
              <li>
                <Link to="/about" className="text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-white">Contact Us</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6} className="mb-4 mb-lg-0">
            <h5>Vehicle Categories</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/vehicles?category=SUV" className="text-white">SUVs</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Sedan" className="text-white">Sedans</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Luxury" className="text-white">Luxury Cars</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Electric" className="text-white">Electric Vehicles</Link>
              </li>
              <li>
                <Link to="/vehicles?category=Sports" className="text-white">Sports Cars</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={3} md={6}>
            <h5>Contact Us</h5>
            <address>
              <p>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                123 Rental Way, Auto City, AC 12345
              </p>
              <p>
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                +1 (555) 123-4567
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                info@autohive.com
              </p>
            </address>
          </Col>
        </Row>
        
        <hr className="my-4 bg-light" />
        
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} AutoHive. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <Link to="/terms" className="text-white me-3">Terms of Service</Link>
            <Link to="/privacy" className="text-white">Privacy Policy</Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;