# React & Node.js Skill Test

## Overview
This repository contains a completed React/Node.js CRM application with MongoDB, JWT authentication, and Redux integration. The project demonstrates full-stack development skills including login flow, API integration, and dashboard UI implementation.

## Test Requirements Completed
- Fixed login issues without modifying login function (20 min)
- roperly configured environment settings
- Analyzed code structure and server configuration

## Login Credentials
- ✓ Email: admin@gmail.com
- ✓ Password: admin123

## Project Structure
- **Client**: React frontend with Redux state management
- **Server**: Node.js/Express backend with MongoDB

## Implementation Details
- Fixed authentication workflow by ensuring proper JWT token handling
- Configured MongoDB connection for local development
- Ensured proper CORS settings between client and server
- Implemented environment variables through .env files
- Added proper API services for meeting management

## Dependencies
- React (Frontend)
- Redux (State Management)
- Express (Backend Server)
- MongoDB (Database)
- JWT (Authentication)
- Axios (API Requests)
- bcrypt (Password Hashing)

## Getting Started
1. Clone the repository
2. Install dependencies in both client and server folders:
   ```
   cd Client && npm install
   cd ../Server && npm install
   ```
3. Ensure MongoDB is running locally
4. Create .env files in both client and server directories with proper configuration
5. Start the server: `npm run dev`
6. Start the client: `npm start`

## Key Features
- Secure JWT authentication
- RESTful API design pattern
- Proper error handling
- MongoDB integration with Mongoose
- React components with Redux state management
