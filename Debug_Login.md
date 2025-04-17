# Login System Debugging Guide

## Common Login Issues

### 404 Error with API Endpoints
If encountering 404 errors when making API requests:

1. **Check Environment Variables**
   - Verify that `.env` file has the correct API base URL:
     ```
     REACT_APP_BASE_URL=http://localhost:5001/
     ```
   - Remember to restart the React application after changing `.env` values

2. **Verify Server Status**
   - Ensure the backend server is running on port 5001
   - Check server console for any error messages

3. **Inspect Network Requests**
   - Open browser Developer Tools (F12)
   - Navigate to Network tab
   - Attempt login and check the full URL of failing requests
   - Verify the request payload is properly formatted

### Authentication Failures

1. **JWT Token Issues**
   - Check browser localStorage/sessionStorage for token presence
   - Verify token expiration and validity
   - Ensure JWT_SECRET in server `.env` matches the one used for token generation

2. **Credential Validation**
   - Ensure password hashing and comparison is working correctly
   - Check for any case-sensitivity issues with usernames/emails

3. **CORS Configuration**
   - If seeing CORS errors, verify the server has appropriate CORS headers:
     ```javascript
     app.use(cors({
       origin: 'http://localhost:3000',
       credentials: true
     }));
     ```

## Working with MongoDB and Mongosh

### Connecting to Database
```bash
# Connect to local MongoDB
mongosh mongodb://localhost:27017/Prolink

# Connect with authentication if configured
mongosh mongodb://username:password@localhost:27017/Prolink
```

### Common MongoDB Commands
```javascript
// Show all databases
show dbs

// Use specific database
use Prolink

// List all collections
show collections

// Find all users
db.users.find()

// Find a specific user by email
db.users.findOne({email: "user@example.com"})

// Check user password hash
db.users.findOne({email: "user@example.com"}, {password: 1})
```

### Troubleshooting User Authentication

1. **Verify User Exists**
   ```javascript
   // Check if user exists in database
   db.users.findOne({email: "user@example.com"})
   ```

2. **Inspect Password Hash**
   ```javascript
   // View only the password field
   db.users.findOne({email: "user@example.com"}, {password: 1})
   ```

3. **Reset User Password (Emergency)**
   ```javascript
   // Generate new hash in Node.js first:
   // const bcrypt = require('bcrypt');
   // const hash = await bcrypt.hash('newpassword', 10);
   // console.log(hash);

   // Then update in MongoDB:
   db.users.updateOne(
     {email: "user@example.com"},
     {$set: {password: "new-bcrypt-hash-here"}}
   )
   ```

4. **Check Failed Login Attempts** (if implemented)
   ```javascript
   db.users.findOne({email: "user@example.com"}, {failedLoginAttempts: 1, lockedUntil: 1})
   ```

## Password Handling Best Practices

1. **Hashing Implementation**
   - Ensure bcrypt is used with appropriate salt rounds (10-12 recommended)
   - Never store plaintext passwords
   - Implementation should look like:
     ```javascript
     // Hashing password for storage
     const passwordHash = await bcrypt.hash(password, 10);
     
     // Validating password
     const isValid = await bcrypt.compare(providedPassword, storedPasswordHash);
     ```

2. **Common Issues with Password Comparison**
   - Check that password strings are trimmed before hashing/comparing
   - Ensure no encoding issues (UTF-8 recommended)
   - Verify the same hashing algorithm and settings used for storage and verification

3. **Debugging Password Verification**
   - Add log statements (temporarily in development):
     ```javascript
     console.log("Provided password:", providedPassword);
     console.log("Stored hash:", storedPasswordHash);
     console.log("Comparison result:", isValid);
     ```
   - Check for password length or character set requirements causing issues

## Testing Login Flow

1. **Direct API Testing**
   - Use Postman or curl to test login endpoint directly:
     ```bash
     curl -X POST http://localhost:5001/api/user/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@example.com","password":"password123"}'
     ```

2. **Debugging Authentication Middleware**
   - Add console logs in auth middleware to trace token validation
   - Check if proper error responses are sent when authentication fails

## Server-Side Login Configuration

Ensure your server has these components properly set up:

1. **Required Packages**
   - express
   - jsonwebtoken
   - bcrypt (for password hashing)
   - mongoose (for MongoDB interaction)

2. **Environment Variables**
   - MongoDB connection string
   - JWT secret key
   - Token expiration time

## Client-Side Login Implementation

Key elements to verify in React components:

1. **Form Validation**
   - Input field validation (required fields, email format, etc.)
   - Error message display

2. **API Client Setup**
   - Axios instance configuration with proper baseURL
   - Error handling and interceptors

3. **Auth State Management**
   - Redux store setup for authentication state
   - Token storage and retrieval
   - Authenticated routes protection

## Quick Login Checklist

- [ ] Server is running on correct port
- [ ] `.env` file has correct API URL
- [ ] MongoDB is running and accessible
- [ ] Network requests are going to correct endpoints
- [ ] Password hashing and verification is working
- [ ] JWT token is being stored after successful login
- [ ] Protected routes are checking for authentication
- [ ] Error messages are clearly displayed to users
