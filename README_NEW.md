# AutoHive - Luxury Vehicle Rental Platform

A modern full-stack vehicle rental platform with a React frontend and Express.js backend API.

## 🏗️ Architecture

- **Backend**: Express.js REST API (Port 3000)
- **Frontend**: React SPA with TypeScript (Port 3001)
- **Database**: MySQL
- **Styling**: Bootstrap 5 + Custom CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8+

### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd AutoHive
npm install
cd client && npm install && cd ..
```

2. **Set up environment variables**
```bash
# Create .env file in root directory
cp .env.example .env
# Edit .env with your database credentials
```

3. **Set up the database**
```bash
npm run setup-db
```

4. **Run both backend and frontend**
```bash
npm run dev:full
```

This will start:
- Backend API at http://localhost:3000
- React frontend at http://localhost:3001

## 📁 Project Structure

```
AutoHive/
├── app.js                 # Express server entry point
├── package.json           # Backend dependencies
├── controllers/           # API controllers
├── routes/               # API routes
├── models/               # Database models
├── middleware/           # Express middleware
├── services/             # Business services
├── config/               # Database config & schemas
└── client/               # React frontend
    ├── package.json      # Frontend dependencies
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── services/     # API clients
    │   ├── context/      # React context
    │   └── styles/       # CSS files
    └── public/           # Static assets
```

## 🔧 Available Scripts

### Root Directory (Backend)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:full` - Start both backend and frontend
- `npm run setup-db` - Initialize database
- `npm test` - Run tests

### Client Directory (Frontend)
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run React tests

## 🔌 API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/vehicles` - List vehicles
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/rentals` - Create rental
- `GET /api/rentals/my-rentals` - User's rentals
- `POST /api/reviews` - Create review

## 🚀 Deployment

### Production Build
```bash
# Build the React frontend
cd client && npm run build

# Start the backend (serves API + built React app)
npm start
```

## 🧹 Recent Cleanup

The codebase has been recently cleaned up to remove unused files and improve maintainability:
- Removed legacy HTML templates (moved to backup/)
- Removed debug scripts and old static assets
- Separated frontend and backend concerns
- Improved development workflow

See `CLEANUP_REPORT.md` for detailed cleanup information.

## 📝 License

MIT License - see LICENSE file for details.
