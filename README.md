
# Hostel Leave Management System Backend

This is the backend for the Hostel Leave Management System, built with Node.js, Express, and MongoDB.

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB installed locally or a MongoDB Atlas account

### Installation

1. Install dependencies:
```
cd src/backend
npm install
```

2. Configure Environment Variables:
- Create a `.env` file in the root directory based on the sample provided
- Update the `MONGO_URI` with your MongoDB connection string
- Set a secure `JWT_SECRET` for token generation

### MongoDB Connection

#### Option 1: Local MongoDB
If you're using a local MongoDB instance:
```
MONGO_URI=mongodb://localhost:27017/hostel-leave-management
```

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. In the Security tab, create a database user with read/write permissions
4. In the Network Access tab, allow access from your IP address
5. In the Database tab, click "Connect" and select "Connect your application"
6. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>` with your values:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

3. Start the server:
```
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on port 5000 by default (http://localhost:5000).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get current user profile (requires authentication)

### Leave Requests
- `POST /api/leave` - Create a new leave request (students only)
- `GET /api/leave` - Get leave requests based on user role
- `GET /api/leave/:id` - Get a specific leave request
- `PUT /api/leave/:id` - Update leave request status (parents and admins only)

## MongoDB Setup

If you're using MongoDB locally, make sure to start the MongoDB service:
```
# On Linux
sudo systemctl start mongod

# On macOS (if installed with Homebrew)
brew services start mongodb-community
```

For MongoDB Atlas, update the `MONGO_URI` in your `.env` file with your connection string.
