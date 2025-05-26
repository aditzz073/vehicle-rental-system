# AutoHive React Frontend

This is the React-based frontend for the AutoHive vehicle rental application. The frontend is built using modern React patterns, TypeScript, and integrates with the Express.js backend API.

## Features

- Modern React application with TypeScript
- Bootstrap and custom CSS for responsive design
- Authentication system with protected routes
- Vehicle browsing, filtering, and detailed view
- User dashboard with profile management, rental history, and reviews
- Booking system for vehicle rentals

## Getting Started

### Prerequisites

- Node.js v14.x or later
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the client directory with the following variables:
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### Development

Start the development server:
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

Build the application for production:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Folder Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/services/` - API service files for backend communication
- `src/context/` - React context providers (authentication, etc.)
- `src/styles/` - Global styles and CSS files
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions

## Technologies Used

- React 18
- TypeScript
- React Router for navigation
- Axios for API requests
- Formik and Yup for form validation
- React Bootstrap for UI components
- FontAwesome for icons

## Integration with Backend

The frontend communicates with the Express.js backend through RESTful API endpoints. Authentication is handled using session cookies for secure communication.
