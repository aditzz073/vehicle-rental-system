import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faPaperPlane,
  faCheck,
  faClock,
  faHeadset,
  faQuestionCircle,
  faBug,
  faHandshake,
  faThumbsUp
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
  phone: Yup.string()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Invalid phone number')
    .optional(),
  subject: Yup.string()
    .required('Subject is required'),
  category: Yup.string()
    .required('Please select a category'),
  message: Yup.string()
    .min(10, 'Message is too short')
    .max(1000, 'Message is too long')
    .required('Message is required')
});

// Contact categories
const contactCategories = [
  { value: 'general', label: 'General Inquiry', icon: faQuestionCircle },
  { value: 'booking', label: 'Booking Support', icon: faHandshake },
  { value: 'technical', label: 'Technical Issue', icon: faBug },
  { value: 'feedback', label: 'Feedback', icon: faHeadset }
];

const Contact: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  
  const handleSubmit = async (values: any, { resetForm, setSubmitting }: any) => {
    try {
      setSubmitting(true);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send data to your backend:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });
      
      console.log('Contact form submission:', values);
      
      // Store submitted data for modal
      setSubmittedData(values);
      
      // Reset form and show success modal
      resetForm();
      setFormSubmitted(true);
      setShowSuccessModal(true);
      
      // Hide success alert after 5 seconds but keep modal control separate
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-5 page-header">
        <Container className="text-center">
          <h1 className="display-4 fw-bold mb-3 fade-in">Contact Us</h1>
          <p className="lead mb-4 fade-in">
            We'd love to hear from you. Get in touch with our team for any questions or support.
          </p>
          <Badge bg="light" text="dark" className="fs-6 px-3 py-2 stats-badge">
            <FontAwesomeIcon icon={faHeadset} className="me-2" />
            Average response time: 2-4 hours
          </Badge>
        </Container>
      </div>

      {/* Quick Contact Options */}
      <Container className="py-4">
        <Row className="text-center">
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-light h-100 quick-contact-card">
              <Card.Body className="py-4">
                <FontAwesomeIcon icon={faPhone} size="2x" className="text-primary mb-3" />
                <h5>Call Us Now</h5>
                <p className="mb-2">For immediate assistance</p>
                <a href="tel:+15551234567" className="btn btn-outline-primary">
                  +1 (555) 123-4567
                </a>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-light h-100 quick-contact-card">
              <Card.Body className="py-4">
                <FontAwesomeIcon icon={faEnvelope} size="2x" className="text-primary mb-3" />
                <h5>Email Support</h5>
                <p className="mb-2">Get detailed assistance</p>
                <a href="mailto:support@autohive.com" className="btn btn-outline-primary">
                  support@autohive.com
                </a>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-light h-100 quick-contact-card">
              <Card.Body className="py-4">
                <FontAwesomeIcon icon={faClock} size="2x" className="text-primary mb-3" />
                <h5>24/7 Emergency</h5>
                <p className="mb-2">Roadside assistance</p>
                <a href="tel:+15551234999" className="btn btn-outline-primary">
                  +1 (555) 123-4999
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <Container className="py-5">
        <Row>
          {/* Contact Information */}
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow h-100 contact-card">
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
                    <p className="mb-0">123 Auto Plaza, Bangalore, Karnataka 560001</p>
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
                    <p className="mb-1">
                      <a href="mailto:info@autohive.com" className="text-decoration-none">
                        info@autohive.com
                      </a>
                    </p>
                    <p className="mb-0">
                      <small className="text-muted">
                        <a href="mailto:support@autohive.com" className="text-decoration-none">
                          support@autohive.com
                        </a>
                      </small>
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
                  <li className="mb-2">
                    <strong>Monday - Friday:</strong> 8:00 AM - 8:00 PM
                  </li>
                  <li className="mb-2">
                    <strong>Saturday:</strong> 9:00 AM - 6:00 PM
                  </li>
                  <li className="mb-2">
                    <strong>Sunday:</strong> 10:00 AM - 4:00 PM
                  </li>
                  <li className="text-primary">
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    <strong>Emergency Support:</strong> 24/7
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Contact Form */}
          <Col lg={8}>
            <Card className="border-0 shadow contact-card">
              <Card.Body className="p-4">
                <h3 className="mb-4">Send Us a Message</h3>
                
                {formSubmitted && (
                  <Alert variant="success" className="d-flex align-items-center fade-in">
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
                    phone: '',
                    subject: '',
                    category: '',
                    message: ''
                  }}
                  validationSchema={ContactSchema}
                  onSubmit={handleSubmit}
                >
                  {({ handleSubmit, isSubmitting, touched, errors, values }) => (
                    <Form onSubmit={handleSubmit} className="contact-form">
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Your Name *</Form.Label>
                            <Field
                              type="text"
                              name="name"
                              as={Form.Control}
                              placeholder="Enter your full name"
                              isInvalid={touched.name && !!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="name" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Email Address *</Form.Label>
                            <Field
                              type="email"
                              name="email"
                              as={Form.Control}
                              placeholder="your.email@example.com"
                              isInvalid={touched.email && !!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="email" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Phone Number</Form.Label>
                            <Field
                              type="tel"
                              name="phone"
                              as={Form.Control}
                              placeholder="+1 (555) 123-4567"
                              isInvalid={touched.phone && !!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="phone" />
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Optional - for urgent matters
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Category *</Form.Label>
                            <Field
                              as={Form.Select}
                              name="category"
                              isInvalid={touched.category && !!errors.category}
                            >
                              <option value="">Select a category</option>
                              {contactCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </Field>
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="category" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={12} className="mb-3">
                          <Form.Group>
                            <Form.Label>Subject *</Form.Label>
                            <Field
                              type="text"
                              name="subject"
                              as={Form.Control}
                              placeholder="Brief description of your inquiry"
                              isInvalid={touched.subject && !!errors.subject}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="subject" />
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={12} className="mb-4">
                          <Form.Group>
                            <Form.Label>Your Message *</Form.Label>
                            <Field
                              as="textarea"
                              rows={6}
                              name="message"
                              className={`form-control ${touched.message && errors.message ? 'is-invalid' : ''}`}
                              placeholder="Please provide detailed information about your inquiry..."
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="message" />
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              {values.message.length}/1000 characters
                            </Form.Text>
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
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Find Us Here
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="ratio ratio-21x9 map-container">
                    <iframe 
                      title="AutoHive Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1622652799255!5m2!1sen!2sin" 
                      className="border-0"
                      loading="lazy"
                    ></iframe>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
        
        {/* FAQ Section */}
        <Row className="mt-5">
          <Col xs={12}>
            <Card className="border-0 shadow faq-section">
              <Card.Header className="bg-light">
                <h3 className="mb-0">
                  <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                  Frequently Asked Questions
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col lg={6} className="mb-4">
                    <h5>How quickly do you respond to inquiries?</h5>
                    <p className="text-muted">
                      We typically respond to all inquiries within 2-4 hours during business hours. 
                      For urgent matters, please call our support line directly.
                    </p>
                    
                    <h5>Do you offer roadside assistance?</h5>
                    <p className="text-muted">
                      Yes! We provide 24/7 roadside assistance for all our rental vehicles. 
                      Just call our emergency number and we'll help you right away.
                    </p>
                    
                    <h5>Can I modify or cancel my booking?</h5>
                    <p className="text-muted">
                      Absolutely. You can modify or cancel your booking up to 24 hours before 
                      your rental period through our website or by contacting customer support.
                    </p>
                  </Col>
                  
                  <Col lg={6} className="mb-4">
                    <h5>What documents do I need for rental?</h5>
                    <p className="text-muted">
                      You'll need a valid driver's license, government-issued ID, and a credit card. 
                      International customers may need additional documentation.
                    </p>
                    
                    <h5>Do you offer delivery and pickup services?</h5>
                    <p className="text-muted">
                      Yes, we offer convenient delivery and pickup services in most areas. 
                      Additional charges may apply based on distance and location.
                    </p>
                    
                    <h5>What if I have an issue during my rental?</h5>
                    <p className="text-muted">
                      Contact our 24/7 support team immediately. We're committed to resolving 
                      any issues quickly and ensuring your rental experience is smooth.
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered className="modal-success">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
            Message Sent Successfully!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3 fade-in">
            <FontAwesomeIcon icon={faCheck} size="3x" className="text-success" />
          </div>
          <h5>Thank you for contacting us!</h5>
          <p className="text-muted mb-3">
            We've received your message and will get back to you as soon as possible.
          </p>
          {submittedData && (
            <div className="bg-light p-3 rounded fade-in">
              <small className="text-muted">
                <strong>Reference:</strong> {submittedData.category} inquiry from {submittedData.name}
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSuccessModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            <FontAwesomeIcon icon={faThumbsUp} className="me-2" />
            Got it!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Contact;
