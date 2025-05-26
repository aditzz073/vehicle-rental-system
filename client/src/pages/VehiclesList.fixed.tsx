import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Pagination, Alert, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFilter, faSort, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Types
interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  image_url: string;
  daily_rate: number;
  category: string;
  rating: number;
  features: any; // Could be string[] or JSON object
  location: string;
  transmission: string;
  fuel_type: string;
  seating_capacity: number;
  vehicle_type: string;
  color?: string;
  description?: string;
  is_available?: boolean;
}

interface PriceRange {
  min: number;
  max: number;
}

interface Category {
  id: number;
  name: string;
  count: number;
}

interface Location {
  id: number;
  name: string;
  count: number;
}

const VehiclesList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
  const [currentPriceRange, setCurrentPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(queryParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(queryParams.get('location') || '');
  const [selectedMinPrice, setSelectedMinPrice] = useState<number>(parseInt(queryParams.get('minPrice') || '0'));
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<number>(parseInt(queryParams.get('maxPrice') || '1000'));
  const [searchQuery, setSearchQuery] = useState<string>(queryParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(queryParams.get('sortBy') || 'price_asc');
  const [currentPage, setCurrentPage] = useState<number>(parseInt(queryParams.get('page') || '1'));

  // Fetch vehicles based on filter criteria
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedLocation) params.append('location', selectedLocation);
        if (selectedMinPrice > 0) params.append('min_price', selectedMinPrice.toString());
        if (selectedMaxPrice < currentPriceRange.max) params.append('max_price', selectedMaxPrice.toString());
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sort_by', sortBy);
        if (currentPage > 1) params.append('page', currentPage.toString());
        
        // Direct absolute URL API call
        const response = await axios.get(`http://localhost:8000/api/vehicles?${params.toString()}`);
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          setVehicles(response.data.vehicles || []);
          setTotalPages(response.data.pagination?.total_pages || 
                       response.data.pagination?.pages || 1);
          setLoading(false);
        } else {
          throw new Error(response.data.message || 'Failed to fetch vehicles');
        }
      } catch (err: any) {
        console.error('Error fetching vehicles:', err);
        setError(`Error loading vehicles: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [selectedCategory, selectedLocation, selectedMinPrice, selectedMaxPrice, searchQuery, sortBy, currentPage, currentPriceRange.max]);

  // Fetch filter options (categories, locations, price range)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Hardcoded categories and locations since the endpoints may not exist
        setCategories([
          { id: 1, name: 'Economy', count: 2 },
          { id: 2, name: 'Standard', count: 1 },
          { id: 3, name: 'Premium', count: 2 },
          { id: 4, name: 'Luxury', count: 2 },
          { id: 5, name: 'Sports', count: 1 }
        ]);

        setLocations([
          { id: 1, name: 'Bangalore, Karnataka', count: 8 }
        ]);

        // Fetch price range directly from vehicle data
        try {
          const priceRangeResponse = await axios.get('http://localhost:8000/api/vehicles');
          if (priceRangeResponse.data.success && priceRangeResponse.data.vehicles.length > 0) {
            const prices = priceRangeResponse.data.vehicles.map((v: any) => parseFloat(v.daily_rate));
            const min = Math.floor(Math.min(...prices));
            const max = Math.ceil(Math.max(...prices));
            const priceRangeData = { min, max };
            
            setPriceRange(priceRangeData);
            setCurrentPriceRange(priceRangeData);
            
            if (!selectedMinPrice) setSelectedMinPrice(min);
            if (!selectedMaxPrice) setSelectedMaxPrice(max);
          }
        } catch (error) {
          console.error('Failed to determine price range:', error);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchFilterOptions();
  }, [selectedMinPrice, selectedMaxPrice]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedLocation) params.append('location', selectedLocation);
    if (selectedMinPrice > priceRange.min) params.append('minPrice', selectedMinPrice.toString());
    if (selectedMaxPrice < priceRange.max) params.append('maxPrice', selectedMaxPrice.toString());
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sortBy', sortBy);
    if (currentPage > 1) params.append('page', currentPage.toString());
    
    navigate({ search: params.toString() });
  }, [selectedCategory, selectedLocation, selectedMinPrice, selectedMaxPrice, searchQuery, sortBy, currentPage, navigate, priceRange]);

  // Handle form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedMinPrice(priceRange.min);
    setSelectedMaxPrice(priceRange.max);
    setSearchQuery('');
    setSortBy('price_asc');
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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

  // Render pagination
  const renderPagination = () => {
    const pages = [];
    
    // Previous button
    pages.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      pages.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      pages.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    pages.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    
    return <Pagination>{pages}</Pagination>;
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-primary text-white py-4">
        <Container>
          <h1 className="mb-0">Browse Our Vehicles</h1>
          <p className="lead mb-0">Find the perfect vehicle for your journey</p>
        </Container>
      </div>
      
      <Container className="py-5">
        <Row>
          {/* Filters Sidebar */}
          <Col lg={3} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FontAwesomeIcon icon={faFilter} className="me-2" />
                    Filters
                  </h5>
                  <Button 
                    variant="link" 
                    className="p-0 text-primary" 
                    onClick={handleClearFilters}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Clear
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleFilterSubmit}>
                  {/* Search */}
                  <Form.Group className="mb-3">
                    <Form.Label>Search</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Make, model, or features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button variant="outline-primary" type="submit">
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                  </Form.Group>
                  
                  {/* Categories */}
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  {/* Locations */}
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name} ({location.count})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  {/* Price Range */}
                  <Form.Group className="mb-3">
                    <Form.Label>Price Range ($/day)</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min={priceRange.min}
                        max={selectedMaxPrice}
                        value={selectedMinPrice}
                        onChange={(e) => setSelectedMinPrice(parseInt(e.target.value))}
                        className="me-2"
                      />
                      <span>to</span>
                      <Form.Control
                        type="number"
                        min={selectedMinPrice}
                        max={priceRange.max}
                        value={selectedMaxPrice}
                        onChange={(e) => setSelectedMaxPrice(parseInt(e.target.value))}
                        className="ms-2"
                      />
                    </div>
                    <Form.Range
                      min={priceRange.min}
                      max={priceRange.max}
                      value={selectedMaxPrice}
                      onChange={(e) => setSelectedMaxPrice(parseInt(e.target.value))}
                      className="mt-2"
                    />
                  </Form.Group>
                  
                  {/* Sort By */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FontAwesomeIcon icon={faSort} className="me-2" />
                      Sort By
                    </Form.Label>
                    <Form.Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating_desc">Rating: High to Low</option>
                      <option value="newest">Newest First</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Button variant="primary" type="submit" className="w-100">
                    Apply Filters
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Vehicles List */}
          <Col lg={9}>
            {/* Active Filters */}
            {(selectedCategory || selectedLocation || selectedMinPrice > priceRange.min || selectedMaxPrice < priceRange.max || searchQuery) && (
              <div className="mb-4">
                <h5>Active Filters:</h5>
                <div className="d-flex flex-wrap gap-2">
                  {selectedCategory && (
                    <Badge bg="primary" className="p-2">
                      Category: {selectedCategory}
                      <Button 
                        variant="link" 
                        className="p-0 ms-2 text-white" 
                        onClick={() => setSelectedCategory('')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Badge>
                  )}
                  
                  {selectedLocation && (
                    <Badge bg="primary" className="p-2">
                      Location: {selectedLocation}
                      <Button 
                        variant="link" 
                        className="p-0 ms-2 text-white" 
                        onClick={() => setSelectedLocation('')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Badge>
                  )}
                  
                  {(selectedMinPrice > priceRange.min || selectedMaxPrice < priceRange.max) && (
                    <Badge bg="primary" className="p-2">
                      Price: ${selectedMinPrice} - ${selectedMaxPrice}/day
                      <Button 
                        variant="link" 
                        className="p-0 ms-2 text-white" 
                        onClick={() => {
                          setSelectedMinPrice(priceRange.min);
                          setSelectedMaxPrice(priceRange.max);
                        }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Badge>
                  )}
                  
                  {searchQuery && (
                    <Badge bg="primary" className="p-2">
                      Search: "{searchQuery}"
                      <Button 
                        variant="link" 
                        className="p-0 ms-2 text-white" 
                        onClick={() => setSearchQuery('')}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {loading && (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading vehicles...</p>
              </div>
            )}
            
            {error && (
              <Alert variant="danger">{error}</Alert>
            )}
            
            {!loading && !error && (
              <>
                <Row className="mb-3">
                  <Col>
                    <p className="mb-0">Showing {vehicles.length} vehicles</p>
                  </Col>
                </Row>
                
                <Row>
                  {vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                      <Col key={vehicle.id} lg={4} md={6} className="mb-4">
                        <Card className="vehicle-card h-100 shadow-sm">
                          <Card.Img 
                            variant="top" 
                            src={vehicle.image_url || 'https://placehold.co/600x400?text=Vehicle+Image'} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/600x400?text=Vehicle+Image';
                            }}
                          />
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="vehicle-category">{vehicle.category}</span>
                              <span className="rating">
                                {renderStars(vehicle.rating || 0)}
                                <span className="ms-1">({(vehicle.rating || 0).toFixed(1)})</span>
                              </span>
                            </div>
                            <Card.Title>{vehicle.make} {vehicle.model} ({vehicle.year})</Card.Title>
                            <div className="vehicle-price mb-3">${vehicle.daily_rate}/day</div>
                            
                            <div className="d-flex mb-3">
                              <div className="me-3">
                                <small className="text-muted d-block">Location</small>
                                <span>{vehicle.location}</span>
                              </div>
                              <div>
                                <small className="text-muted d-block">Transmission</small>
                                <span>{vehicle.transmission}</span>
                              </div>
                            </div>
                            
                            <div className="vehicle-features">
                              {vehicle.features && Array.isArray(vehicle.features) ? 
                                vehicle.features.slice(0, 3).map((feature: string, index: number) => (
                                  <span key={index} className="vehicle-feature">{feature}</span>
                                ))
                              : typeof vehicle.features === 'object' && vehicle.features !== null ? 
                                Object.keys(vehicle.features).slice(0, 3).map((key: string, index: number) => (
                                  <span key={index} className="vehicle-feature">{key}</span>
                                ))
                              : null}
                            </div>
                            
                            <div className="d-grid gap-2 mt-3">
                              <Link 
                                to={`/vehicles/${vehicle.id}`} 
                                className="btn btn-outline-primary"
                              >
                                View Details
                              </Link>
                              <Link 
                                to={`/booking-new?vehicle=${vehicle.id}`} 
                                className="btn btn-primary"
                              >
                                Book Now
                              </Link>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  ) : (
                    <Col xs={12}>
                      <div className="text-center py-5">
                        <p>No vehicles found matching your criteria.</p>
                        <Button variant="primary" onClick={handleClearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    </Col>
                  )}
                </Row>
                
                {/* Pagination */}
                {vehicles.length > 0 && totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    {renderPagination()}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VehiclesList;
