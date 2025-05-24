const fs = require('fs');
const path = require('path');

// API Documentation Generator
class APIDocGenerator {
    constructor() {
        this.docs = {
            title: 'AutoHive API Documentation',
            version: '1.0.0',
            description: 'Complete API documentation for AutoHive luxury vehicle rental platform',
            baseUrl: 'http://localhost:3000/api',
            endpoints: []
        };
        
        this.generateDocs();
    }

    generateDocs() {
        // Authentication endpoints
        this.addAuthEndpoints();
        
        // Vehicle endpoints
        this.addVehicleEndpoints();
        
        // Rental endpoints
        this.addRentalEndpoints();
        
        // Review endpoints
        this.addReviewEndpoints();
        
        // Admin endpoints
        this.addAdminEndpoints();
        
        // Generate HTML documentation
        this.generateHTML();
        
        console.log('API documentation generated successfully!');
    }

    addAuthEndpoints() {
        const authEndpoints = [
            {
                method: 'POST',
                path: '/auth/register',
                description: 'Register a new user',
                requestBody: {
                    username: 'string (required)',
                    email: 'string (required)',
                    password: 'string (required, min 8 chars)',
                    firstName: 'string (required)',
                    lastName: 'string (required)',
                    phone: 'string (required)'
                },
                responses: {
                    201: 'User registered successfully',
                    400: 'Validation error or user already exists'
                }
            },
            {
                method: 'POST',
                path: '/auth/login',
                description: 'Login user',
                requestBody: {
                    email: 'string (required)',
                    password: 'string (required)'
                },
                responses: {
                    200: 'Login successful',
                    401: 'Invalid credentials'
                }
            },
            {
                method: 'POST',
                path: '/auth/logout',
                description: 'Logout user',
                auth: 'required',
                responses: {
                    200: 'Logout successful'
                }
            },
            {
                method: 'POST',
                path: '/auth/forgot-password',
                description: 'Request password reset',
                requestBody: {
                    email: 'string (required)'
                },
                responses: {
                    200: 'Reset email sent',
                    404: 'User not found'
                }
            }
        ];

        this.docs.endpoints.push({
            category: 'Authentication',
            endpoints: authEndpoints
        });
    }

    addVehicleEndpoints() {
        const vehicleEndpoints = [
            {
                method: 'GET',
                path: '/vehicles',
                description: 'Get all vehicles with optional filtering',
                queryParams: {
                    category: 'string (optional)',
                    minPrice: 'number (optional)',
                    maxPrice: 'number (optional)',
                    transmission: 'string (optional)',
                    seats: 'number (optional)',
                    page: 'number (optional, default: 1)',
                    limit: 'number (optional, default: 10)'
                },
                responses: {
                    200: 'List of vehicles'
                }
            },
            {
                method: 'GET',
                path: '/vehicles/:id',
                description: 'Get vehicle by ID',
                responses: {
                    200: 'Vehicle details',
                    404: 'Vehicle not found'
                }
            },
            {
                method: 'GET',
                path: '/vehicles/search',
                description: 'Search vehicles with advanced filters',
                queryParams: {
                    q: 'string (search term)',
                    startDate: 'date (YYYY-MM-DD)',
                    endDate: 'date (YYYY-MM-DD)',
                    category: 'string',
                    minPrice: 'number',
                    maxPrice: 'number'
                },
                responses: {
                    200: 'Search results'
                }
            },
            {
                method: 'GET',
                path: '/vehicles/:id/availability',
                description: 'Check vehicle availability',
                queryParams: {
                    startDate: 'date (required)',
                    endDate: 'date (required)'
                },
                responses: {
                    200: 'Availability status'
                }
            }
        ];

        this.docs.endpoints.push({
            category: 'Vehicles',
            endpoints: vehicleEndpoints
        });
    }

    addRentalEndpoints() {
        const rentalEndpoints = [
            {
                method: 'POST',
                path: '/rentals',
                description: 'Create new rental booking',
                auth: 'required',
                requestBody: {
                    vehicleId: 'number (required)',
                    startDate: 'date (required)',
                    endDate: 'date (required)',
                    pickupLocation: 'string (required)',
                    dropoffLocation: 'string (required)'
                },
                responses: {
                    201: 'Booking created successfully',
                    400: 'Validation error or vehicle unavailable',
                    401: 'Authentication required'
                }
            },
            {
                method: 'GET',
                path: '/rentals',
                description: 'Get user rental history',
                auth: 'required',
                responses: {
                    200: 'List of user rentals'
                }
            },
            {
                method: 'GET',
                path: '/rentals/:id',
                description: 'Get rental details',
                auth: 'required',
                responses: {
                    200: 'Rental details',
                    404: 'Rental not found'
                }
            },
            {
                method: 'PUT',
                path: '/rentals/:id/cancel',
                description: 'Cancel rental booking',
                auth: 'required',
                responses: {
                    200: 'Booking cancelled',
                    400: 'Cannot cancel booking'
                }
            }
        ];

        this.docs.endpoints.push({
            category: 'Rentals',
            endpoints: rentalEndpoints
        });
    }

    addReviewEndpoints() {
        const reviewEndpoints = [
            {
                method: 'POST',
                path: '/reviews',
                description: 'Create vehicle review',
                auth: 'required',
                requestBody: {
                    vehicleId: 'number (required)',
                    rentalId: 'number (required)',
                    rating: 'number (1-5, required)',
                    comment: 'string (optional)'
                },
                responses: {
                    201: 'Review created successfully',
                    400: 'Validation error'
                }
            },
            {
                method: 'GET',
                path: '/reviews/vehicle/:vehicleId',
                description: 'Get reviews for a vehicle',
                responses: {
                    200: 'List of reviews'
                }
            }
        ];

        this.docs.endpoints.push({
            category: 'Reviews',
            endpoints: reviewEndpoints
        });
    }

    addAdminEndpoints() {
        const adminEndpoints = [
            {
                method: 'GET',
                path: '/admin/dashboard',
                description: 'Get admin dashboard statistics',
                auth: 'admin required',
                responses: {
                    200: 'Dashboard data'
                }
            },
            {
                method: 'POST',
                path: '/admin/vehicles',
                description: 'Add new vehicle',
                auth: 'admin required',
                requestBody: {
                    name: 'string (required)',
                    category: 'string (required)',
                    description: 'string (required)',
                    daily_rate: 'number (required)',
                    doors: 'number (required)',
                    seats: 'number (required)',
                    transmission: 'string (required)',
                    fuel_type: 'string (required)',
                    year: 'number (required)',
                    color: 'string (required)',
                    features: 'array (optional)'
                },
                responses: {
                    201: 'Vehicle added successfully'
                }
            },
            {
                method: 'PUT',
                path: '/admin/vehicles/:id',
                description: 'Update vehicle',
                auth: 'admin required',
                responses: {
                    200: 'Vehicle updated successfully'
                }
            },
            {
                method: 'DELETE',
                path: '/admin/vehicles/:id',
                description: 'Delete vehicle',
                auth: 'admin required',
                responses: {
                    200: 'Vehicle deleted successfully'
                }
            }
        ];

        this.docs.endpoints.push({
            category: 'Admin',
            endpoints: adminEndpoints
        });
    }

    generateHTML() {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.docs.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .category {
            background: white;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .category-title {
            background: #343a40;
            color: white;
            padding: 20px;
            margin: 0;
            font-size: 1.5em;
        }
        .endpoint {
            border-bottom: 1px solid #e9ecef;
            padding: 20px;
        }
        .endpoint:last-child {
            border-bottom: none;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8em;
            margin-right: 10px;
        }
        .method.GET { background: #28a745; color: white; }
        .method.POST { background: #007bff; color: white; }
        .method.PUT { background: #ffc107; color: black; }
        .method.DELETE { background: #dc3545; color: white; }
        .path {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 1.1em;
            font-weight: bold;
        }
        .auth-required {
            background: #ffeaa7;
            color: #2d3436;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .description {
            margin: 10px 0;
            color: #666;
        }
        .params {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 10px 0;
        }
        .params h4 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .param {
            font-family: 'Monaco', 'Consolas', monospace;
            margin: 5px 0;
        }
        .responses {
            background: #f8f9fa;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 10px 0;
        }
        .responses h4 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .response {
            margin: 5px 0;
        }
        .status-code {
            font-weight: bold;
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${this.docs.title}</h1>
        <p>Version: ${this.docs.version}</p>
        <p>${this.docs.description}</p>
        <p><strong>Base URL:</strong> ${this.docs.baseUrl}</p>
    </div>

    ${this.docs.endpoints.map(category => this.generateCategoryHTML(category)).join('')}
</body>
</html>
        `;

        const docsDir = path.join(__dirname, '../docs');
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }

        fs.writeFileSync(path.join(docsDir, 'api-documentation.html'), html);
    }

    generateCategoryHTML(category) {
        return `
    <div class="category">
        <h2 class="category-title">${category.category}</h2>
        ${category.endpoints.map(endpoint => this.generateEndpointHTML(endpoint)).join('')}
    </div>
        `;
    }

    generateEndpointHTML(endpoint) {
        const authBadge = endpoint.auth ? `<span class="auth-required">${endpoint.auth}</span>` : '';
        
        return `
    <div class="endpoint">
        <div>
            <span class="method ${endpoint.method}">${endpoint.method}</span>
            <span class="path">${endpoint.path}</span>
            ${authBadge}
        </div>
        <div class="description">${endpoint.description}</div>
        
        ${endpoint.requestBody ? `
        <div class="params">
            <h4>Request Body:</h4>
            ${Object.entries(endpoint.requestBody).map(([key, value]) => 
                `<div class="param"><strong>${key}:</strong> ${value}</div>`
            ).join('')}
        </div>
        ` : ''}
        
        ${endpoint.queryParams ? `
        <div class="params">
            <h4>Query Parameters:</h4>
            ${Object.entries(endpoint.queryParams).map(([key, value]) => 
                `<div class="param"><strong>${key}:</strong> ${value}</div>`
            ).join('')}
        </div>
        ` : ''}
        
        <div class="responses">
            <h4>Responses:</h4>
            ${Object.entries(endpoint.responses).map(([code, description]) => 
                `<div class="response"><span class="status-code">${code}:</span> ${description}</div>`
            ).join('')}
        </div>
    </div>
        `;
    }
}

// Generate documentation
new APIDocGenerator();

console.log('✅ API documentation generated in docs/api-documentation.html');
