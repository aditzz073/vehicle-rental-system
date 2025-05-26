import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faLock, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  
  // Get redirect URL from location state or default to dashboard
  const from = (location.state as any)?.from || '/dashboard';
  
  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      console.log('Attempting login with:', values);
      console.log('Redirecting to after login:', from);
      
      // Use the context login function instead of direct service call
      await login(values.email, values.password);
      
      console.log('Login successful, redirecting to:', from);
      // Redirect to the page user came from or to dashboard
      navigate(from, { replace: true });
      
    } catch (err: any) {
      // Handle different error types
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login';
      console.error('Login error:', err);
      setError(errorMessage);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-0">
                  <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                  Login
                </h2>
                <p className="text-muted mt-2">
                  Sign in to your AutoHive account
                </p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
              >
                {({ handleSubmit, isSubmitting, touched, errors }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
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
                    
                    <Form.Group className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Label>Password</Form.Label>
                        <Link to="/forgot-password" className="small text-primary">
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FontAwesomeIcon icon={faLock} />
                        </span>
                        <Field
                          type="password"
                          name="password"
                          as={Form.Control}
                          placeholder="Enter your password"
                          isInvalid={touched.password && !!errors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                          <ErrorMessage name="password" />
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        id="remember-me"
                      />
                    </Form.Group>
                    
                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                            Login
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account? <Link to="/register" className="text-primary">Register</Link>
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

export default Login;