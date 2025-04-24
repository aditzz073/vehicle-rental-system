# AutoHive - Vehicle Rental System

AutoHive is a modern, full-featured vehicle rental platform built with Node.js and Express that allows users to browse, book, and manage vehicle rentals. The application provides a seamless user experience with features like user authentication, vehicle browsing, booking management, and administrative controls.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [Upcoming Features](#upcoming-features)
- [License](#license)

## Features

### User Features
- **User Authentication**: Secure registration and login system
- **Vehicle Browsing**: Browse available vehicles with filtering and search capabilities
- **Vehicle Details**: View detailed information about each vehicle
- **Booking Management**: Create, view, and manage rental bookings
- **User Dashboard**: Personal dashboard to manage profile, bookings, and reviews
- **Review System**: Leave and view reviews for rented vehicles

### Admin Features
- **Vehicle Management**: Add, edit, and remove vehicles from the fleet
- **User Management**: View and manage user accounts
- **Booking Overview**: Monitor and manage all bookings in the system
- **Analytics**: View rental statistics and performance metrics

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript (Vanilla)
- **HTTP Requests**: Fetch API
- **Others**: CORS, express-session, cookie-parser

## Project Structure

```
.
├── app.js                 # Entry point for the application
├── package.json           # Dependencies and scripts
├── config/                # Configuration files
│   ├── db.js              # Database connection configuration
│   └── schema.sql         # Database schema
├── controllers/           # Application controllers
│   ├── adminController.js # Admin functionalities
│   ├── authController.js  # Authentication functionalities
│   ├── rentalController.js# Rental management
│   ├── reviewController.js# Review management
│   └── vehicleController.js# Vehicle management
├── models/                # Data models
│   ├── Payment.js         # Payment model
│   ├── Rental.js          # Rental model
│   ├── Review.js          # Review model
│   ├── User.js            # User model
│   └── Vehicle.js         # Vehicle model
├── public/                # Static files
│   ├── css/               # Stylesheets
│   ├── images/            # Image assets
│   └── js/                # Client-side scripts
├── routes/                # API routes
│   ├── admin.js           # Admin routes
│   ├── auth.js            # Authentication routes
│   ├── rentals.js         # Rental routes
│   ├── reviews.js         # Review routes
│   └── vehicles.js        # Vehicle routes
└── views/                 # HTML templates
    ├── dashboard.html     # User dashboard
    ├── index.html         # Homepage
    ├── layout-components.html # Layout components
    ├── layout.html        # Main layout template
    ├── login.html         # Login page
    ├── register.html      # Registration page
    └── vehicles.html      # Vehicle listing page
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/autohive.git
cd autohive
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
# Create database and tables
mysql -u root -p < config/schema.sql
```

4. Configure environment variables
```bash
# Create a .env file in the root directory
cp .env.example .env
# Update the file with your database credentials and other settings
```

5. Start the server
```bash
npm start
# For development with auto-reload
npm run dev
```

## Configuration

Create a `.env` file in the root directory with the following configurations:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=vehicle_rental
DB_PORT=3306

# Session Configuration
SESSION_SECRET=your_secret_key
```

## Usage

1. Access the application:
   - Open your browser and navigate to `http://localhost:3000`

2. Register a new account or use the demo account:
   - Username: demo
   - Password: demo123

3. Browse vehicles, make bookings, and explore the application features

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login a user
- `GET /auth/logout` - Logout a user
- `GET /auth/profile` - Get current user profile

### Vehicles
- `GET /vehicles` - Get all vehicles
- `GET /vehicles/:id` - Get a specific vehicle
- `GET /vehicles/featured` - Get featured vehicles
- `POST /vehicles` - Create a new vehicle (Admin only)
- `PUT /vehicles/:id` - Update a vehicle (Admin only)
- `DELETE /vehicles/:id` - Delete a vehicle (Admin only)

### Rentals
- `GET /rentals` - Get user's rentals
- `GET /rentals/:id` - Get a specific rental
- `POST /rentals` - Create a new rental
- `PUT /rentals/:id/cancel` - Cancel a rental
- `POST /rentals/:id/payment` - Process payment for a rental

### Reviews
- `GET /reviews/vehicle/:vehicleId` - Get reviews for a vehicle
- `GET /reviews/featured` - Get featured reviews
- `POST /reviews` - Create a new review
- `PUT /reviews/:id` - Update a review
- `DELETE /reviews/:id` - Delete a review

### Admin
- `GET /admin/vehicles` - Get all vehicles (Admin only)
- `GET /admin/users` - Get all users (Admin only)
- `GET /admin/rentals` - Get all rentals (Admin only)
- `GET /admin/reviews` - Get all reviews (Admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Upcoming Features

- **Mobile Application**: Native mobile apps for iOS and Android platforms
- **Advanced Filtering**: More filtering options for vehicle search
- **Instant Messaging**: Direct messaging between users and customer support
- **Payment Integration**: Multiple payment options including PayPal, Stripe, etc.
- **Loyalty Program**: Reward system for regular customers
- **Vehicle Tracking**: GPS tracking for rental vehicles
- **Multi-language Support**: Support for multiple languages
- **Rental Insurance**: Optional insurance packages for rentals
- **Maintenance Tracking**: Vehicle maintenance scheduling and history
- **Recommendation System**: AI-based vehicle recommendations
- **Advanced Analytics**: Enhanced reporting and analytics for administrators

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 AutoHive. All Rights Reserved.