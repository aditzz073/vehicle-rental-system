import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faPaperPlane,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: Yup.string()
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message is too short')
    .required('Message is required')
});

const Contact: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form and show success message
      resetForm();
      setFormSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-5">
        <Container className="text-center">
          <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
          <p className="lead mb-0">
            We'd love to hear from you. Get in touch with our team.
          </p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          {/* Contact Information */}
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow h-100">
              <Card.Body className="p-4">
                <h3 className="mb-4">Get in Touch</h3>
                <p className="text-muted">
                  Have questions about our vehicles or services? Need to make special arrangements? 
                  Our team is here to help you.
                </p>
                
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3">
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">Our Location</h5>
                    <p className="mb-0">123 Rental Way, Auto City, AC 12345</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3">
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">Email Us</h5>
                    <p className="mb-0">
                      <a href="mailto:info@autohive.com" className="text-decoration-none">
                        info@autohive.com
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">Call Us</h5>
                    <p className="mb-0">
                      <a href="tel:+15551234567" className="text-decoration-none">
                        +1 (555) 123-4567
                      </a>
                    </p>
                  </div>
                </div>
                
                <hr className="my-4" />
                
                <h5>Business Hours</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">Monday - Friday: 8:00 AM - 8:00 PM</li>
                  <li className="mb-2">Saturday: 9:00 AM - 6:00 PM</li>
                  <li>Sunday: 10:00 AM - 4:00 PM</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Contact Form */}
          <Col lg={8}>
            <Card className="border-0 shadow">
              <Card.Body className="p-4">
                <h3 className="mb-4">Send Us a Message</h3>
                
                {formSubmitted && (
                  <Alert variant="success" className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    <div>
                      Your message has been sent successfully! We'll get back to you soon.
                    </div>
                  </Alert>
                )}
                
                <Formik
                  initialValues={{
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                  }}
                  validationSchema={ContactSchema}
                  onSubmit={handleSubmit}
                >
                  {({ handleSubmit, isSubmitting, touched, errors }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Your Name</Form.Label>
                            <Field
                              type="text"
                              name="name"
                              as={Form.Control}
                              placeholder="Enter your name"
                              isInvalid={touched.name && !!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="name" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Email Address</Form.Label>
                            <Field
                              type="email"
                              name="email"
                              as={Form.Control}
                              placeholder="Enter your email"
                              isInvalid={touched.email && !!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="email" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label>Subject</Form.Label>
                            <Field
                              type="text"
                              name="subject"
                              as={Form.Control}
                              placeholder="What's this about?"
                              isInvalid={touched.subject && !!errors.subject}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="subject" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={12} className="mb-4">
                          <Form.Group>
                            <Form.Label>Your Message</Form.Label>
                            <Field
                              as="textarea"
                              rows={6}
                              name="message"
                              className="form-control"
                              placeholder="Tell us what you need"
                              isInvalid={touched.message && !!errors.message}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="message" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg" 
                        className="px-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
            
            {/* Map */}
            <div className="mt-4">
              <Card className="border-0 shadow">
                <Card.Body className="p-0">
                  <div className="ratio ratio-21x9">
                    <iframe 
                      title="AutoHive Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.7062183035782!2d-122.41941628436597!3d37.77492957975789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sMarket%20St%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1622652799255!5m2!1sen!2sus" 
                      className="border-0"
                      loading="lazy"
                    ></iframe>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contact;
