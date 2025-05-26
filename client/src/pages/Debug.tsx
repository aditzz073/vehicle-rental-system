import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { AuthService } from '../services/authService';

const Debug: React.FC = () => {
  const testApi = async () => {
    try {
      console.log('Environment Variable REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
      console.log('API Base URL being used:', process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
      
      const response = await AuthService.register({
        full_name: 'Debug Test',
        email: 'debug@test.com',
        password: 'debugtest123',
        confirm_password: 'debugtest123'
      });
      
      console.log('API Response:', response);
      alert('API call successful! Check console for details.');
    } catch (error: any) {
      console.error('API Error:', error);
      console.error('Error response:', error.response);
      alert(`API Error: ${error.message}`);
    }
  };

  return (
    <Container className="py-5">
      <Card>
        <Card.Body>
          <h3>API Debug Page</h3>
          <p>API URL: {process.env.REACT_APP_API_URL || 'http://localhost:3000/api (default)'}</p>
          <Button onClick={testApi} variant="primary">
            Test API Call
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Debug;
