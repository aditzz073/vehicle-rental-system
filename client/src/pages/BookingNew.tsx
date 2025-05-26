import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCar, 
  faSpinner, 
  faArrowLeft, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faDollarSign,
  faUser,
  faPhone,
  faEnvelope 
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  daily_rate: string;
  category: string;
  rating: string;
  location: string;
  transmission: string;
  fuel_type: string;
  seating_capacity: number;
  description: string;
  is_available: number;
}

interface BookingFormData {
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  specialRequests: string;
}

const BookingNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  
  const vehicleId = searchParams.get('vehicle');

  // Get tomorrow's date as default start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStartDate = tomorrow.toISOString().split('T')[0];
  
  // Get day after tomorrow as default end date
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const defaultEndDate = dayAfter.toISOString().split('T')[0];

  const [formData, setFormData] = useState<BookingFormData>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    pickupLocation: '',
    dropoffLocation: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: ''
  });

  useEffect(() => {
    if (!vehicleId) {
      setError('No vehicle selected');
      setLoading(false);
      return;
    }
    fetchVehicleDetails();
  }, [vehicleId]);

  useEffect(() => {
    // Auto-populate pickup/dropoff location when vehicle is loaded
    if (vehicle && !formData.pickupLocation) {
      setFormData(prev => ({
        ...prev,
        pickupLocation: vehicle.location,
        dropoffLocation: vehicle.location
      }));
    }
  }, [vehicle]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    if (!vehicle) return 0;
    const days = calculateDays();
    const dailyRate = parseFloat(vehicle.daily_rate);
    return days * dailyRate;
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.startDate || !formData.endDate) {
      return 'Please select both pickup and return dates';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate < today) {
      return 'Pickup date cannot be in the past';
    }
    
    if (endDate <= startDate) {
      return 'Return date must be after pickup date';
    }
    
    if (!formData.pickupLocation.trim() || !formData.dropoffLocation.trim()) {
      return 'Please specify pickup and dropoff locations';
    }
    
    if (!formData.contactName.trim() || !formData.contactPhone.trim() || !formData.contactEmail.trim()) {
      return 'Please fill in all contact information';
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vehicles/${vehicleId}`);
      
      if (response.data.success) {
        setVehicle(response.data.vehicle);
      } else {
        throw new Error(response.data.message || 'Failed to load vehicle');
      }
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!vehicle) return;

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingData = {
        vehicle_id: vehicle.id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        special_requests: formData.specialRequests || 'No special requests',
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        total_cost: calculateTotal()
      };

      console.log('Submitting booking:', bookingData);
      const response = await api.post('/rentals', bookingData);
      
      if (response.data.success) {
        alert(`Booking successful! Your booking ID is: ${response.data.rental.id}`);
        navigate('/dashboard');
      } else {
        alert('Booking failed: ' + response.data.message);
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      alert('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary" />
        <p className="mt-2">Loading vehicle details...</p>
      </Container>
    );
  }

  if (error || !vehicle) {
    return (
      <Container className="py-5 text-center">
        <h3>Unable to load vehicle</h3>
        <p>{error || 'Vehicle not found'}</p>
        <Button variant="primary" onClick={() => navigate('/vehicles')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Vehicles
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate('/vehicles')} className="mb-3">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Vehicles
          </Button>
          <h2 className="text-primary">Complete Your Booking</h2>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Vehicle Details Card */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faCar} className="me-2" />
                Vehicle Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h4 className="text-primary">{vehicle.make} {vehicle.model}</h4>
                  <p className="text-muted mb-2">Year: {vehicle.year} | Category: {vehicle.category}</p>
                  <p className="mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary me-1" />
                    {vehicle.location}
                  </p>
                  <p className="mb-2">
                    <strong>Transmission:</strong> {vehicle.transmission} | 
                    <strong className="ms-2">Fuel:</strong> {vehicle.fuel_type} | 
                    <strong className="ms-2">Seating:</strong> {vehicle.seating_capacity}
                  </p>
                  <p className="text-muted">{vehicle.description}</p>
                </Col>
                <Col md={4} className="text-md-end">
                  <h3 className="text-success">
                    <FontAwesomeIcon icon={faDollarSign} />
                    {vehicle.daily_rate}/day
                  </h3>
                  <span className="badge bg-success">Available</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Booking Form */}
          <Card className="shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Booking Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                {/* Dates */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        Pickup Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                        Return Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Locations */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                        Pickup Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.pickupLocation}
                        onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                        placeholder="Enter pickup location"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                        Dropoff Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.dropoffLocation}
                        onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                        placeholder="Enter dropoff location"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contact Information */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faUser} className="me-1" />
                        Contact Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faPhone} className="me-1" />
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="Your phone number"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                        Email Address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Special Requests */}
                <Row className="mb-3">
                  <Col>
                    <Form.Group>
                      <Form.Label>Special Requests (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        placeholder="Any special requests or requirements..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Booking Summary */}
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Booking Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6 className="text-primary">{vehicle.make} {vehicle.model}</h6>
                <small className="text-muted">{vehicle.category}</small>
              </div>
              
              {formData.startDate && formData.endDate && (
                <>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Duration:</span>
                    <strong>{calculateDays()} days</strong>
                  </div>
                  <div className="mb-2 d-flex justify-content-between">
                    <span>Daily Rate:</span>
                    <span>${vehicle.daily_rate}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total Cost:</strong>
                    <strong className="text-success">
                      <FontAwesomeIcon icon={faDollarSign} />
                      {calculateTotal().toFixed(2)}
                    </strong>
                  </div>
                </>
              )}
              
              <Button 
                variant="success" 
                size="lg" 
                className="w-100"
                onClick={handleBooking}
                disabled={bookingLoading || !formData.startDate || !formData.endDate}
              >
                {bookingLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    Processing...
                  </>
                ) : (
                  `Confirm Booking - $${calculateTotal().toFixed(2)}`
                )}
              </Button>
              
              <div className="mt-3 text-center">
                <small className="text-muted">
                  Secure payment • Instant confirmation
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingNew;
