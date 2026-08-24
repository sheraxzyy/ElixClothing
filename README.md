# ELIX

ELIX is a premium oversized streetwear e-commerce platform built with React, Node.js, Express, and MongoDB.

## Features

- Premium streetwear brand experience
- Product catalog with filtering
- Cart and checkout flow
- JWT authentication and role-based access
- Admin product and order management

## Tech Stack

- Frontend: React, JavaScript, React Router, Axios
- Backend: Node.js, Express, JWT, bcrypt
- Database: MongoDB, Mongoose

## Project Structure

- `client/` - Frontend application
- `server/` - Backend API server
- `.env.example` - Example environment variables

## Getting Started

1. Install dependencies
   - `cd client && npm install`
   - `cd server && npm install`

2. Create `.env` files from `.env.example`

3. Start development servers
   - `cd server && npm run dev`
   - `cd client && npm run dev`

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `PORT` - Backend server port
- `CLIENT_URL` - Frontend URL for CORS
