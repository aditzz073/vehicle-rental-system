import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faEnvelope, faLock, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthService } from '../services/authService';

// Validation schema
const RegisterSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+()-\s]+$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  termsAccepted: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleRegister = async (values: any) => {
    try {
      // Remove termsAccepted from payload as it's not needed by the API
      const { termsAccepted, ...payload } = values;
      
      console.log('Submitting registration with data:', payload);
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
      
      await AuthService.register(payload);
      
      setSuccess('Registration successful! You can now log in.');
      setError(null);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      // Handle different error types
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration';
      setError(errorMessage);
      setSuccess(null);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-0">
                  <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                  Create an Account
                </h2>
                <p className="text-muted mt-2">
                  Join AutoHive and experience premium vehicle rentals
                </p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}
              
              <Formik
                initialValues={{
                  full_name: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirm_password: '',
                  termsAccepted: false
                }}
                validationSchema={RegisterSchema}
                onSubmit={handleRegister}
              >
                {({ handleSubmit, isSubmitting, touched, errors }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label>Full Name</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FontAwesomeIcon icon={faUser} />
                            </span>
                            <Field
                              type="text"
                              name="full_name"
                              as={Form.Control}
                              placeholder="Enter your full name"
                              isInvalid={touched.full_name && !!errors.full_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="full_name" />
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Email Address</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FontAwesomeIcon icon={faEnvelope} />
                            </span>
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
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Phone Number</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FontAwesomeIcon icon={faPhone} />
                            </span>
                            <Field
                              type="text"
                              name="phone"
                              as={Form.Control}
                              placeholder="Enter your phone number"
                              isInvalid={touched.phone && !!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="phone" />
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Password</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FontAwesomeIcon icon={faLock} />
                            </span>
                            <Field
                              type="password"
                              name="password"
                              as={Form.Control}
                              placeholder="Create a password"
                              isInvalid={touched.password && !!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="password" />
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label>Confirm Password</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FontAwesomeIcon icon={faLock} />
                            </span>
                            <Field
                              type="password"
                              name="confirm_password"
                              as={Form.Control}
                              placeholder="Confirm your password"
                              isInvalid={touched.confirm_password && !!errors.confirm_password}
                            />
                            <Form.Control.Feedback type="invalid">
                              <ErrorMessage name="confirm_password" />
                            </Form.Control.Feedback>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-4">
                      <Field
                        type="checkbox"
                        name="termsAccepted"
                        as={Form.Check}
                        label={
                          <span>
                            I agree to the <Link to="/terms" target="_blank">Terms & Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                          </span>
                        }
                        id="terms-accepted"
                        isInvalid={touched.termsAccepted && !!errors.termsAccepted}
                        feedback={<ErrorMessage name="termsAccepted" />}
                        feedbackType="invalid"
                      />
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting || success !== null}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                            Register
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account? <Link to="/login" className="text-primary">Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <Link to="/" className="text-decoration-none">
              &larr; Back to Home
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;