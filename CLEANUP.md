# AutoHive - Luxury Vehicle Rental Platform

A modern vehicle rental platform with a React frontend and Express/Node.js backend.

## Project Structure

The project is organized into two main parts:

1. **Backend API** (root directory)
   - Express.js server
   - MySQL database
   - RESTful API endpoints

2. **React Frontend** (`/client` directory)
   - React with TypeScript
   - React Router for navigation
   - Bootstrap for styling

## Getting Started

### Prerequisites

- Node.js 16+
- MySQL 8+

### Running the Backend

```bash
# Install dependencies
npm install

# Set up the database
npm run setup-db

# Start the server
npm run dev
```

The backend API will be available at http://localhost:3000/api

### Running the Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The React application will be available at http://localhost:3001

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/vehicles` - Vehicle management
- `/api/rentals` - Rental management
- `/api/reviews` - Reviews management
- `/api/admin` - Admin functions

## Cleanup Notes

The codebase has been cleaned up to remove unused files:

- Moved debug scripts to backup/scripts
- Moved HTML templates to backup/views
- Moved static assets to backup/public
- Simplified the backend to focus on API endpoints
- Organized frontend code for better maintainability
