# Authentication System

## Overview
The application now supports a complete authentication system with user registration, login, and password-based authentication using bcrypt for security.

## Features

### 🔐 Secure Authentication
- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication with 12-hour expiration
- **Input Validation**: Comprehensive form validation on both frontend and backend
- **Error Handling**: Detailed error messages for better user experience

### 👤 User Management
- **Registration**: Users can create accounts with username, email, and password
- **Login**: Users can log in with either username or email
- **Unique Constraints**: Username and email must be unique
- **Session Persistence**: Users stay logged in across browser sessions

### 🛡️ Security Features
- **Password Requirements**: Minimum 6 characters
- **Email Validation**: Basic email format validation
- **Duplicate Prevention**: Checks for existing username/email during registration
- **Token Validation**: Automatic token validation on app startup

## Database Schema

### Updated Player Table
```sql
CREATE TABLE player (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    password TEXT NOT NULL,
    room_id TEXT
);

-- Indexes for performance
CREATE INDEX idx_player_email ON player(email);
CREATE INDEX idx_player_username ON player(username);
CREATE INDEX idx_player_user_id ON player(user_id);
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "token": "string",
    "user": {
        "userId": "string",
        "userName": "string"
    }
}
```

#### POST /api/auth/login
Login with username/email and password.

**Request Body:**
```json
{
    "usernameOrEmail": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "token": "string",
    "user": {
        "userId": "string",
        "userName": "string"
    }
}
```

#### GET /api/auth/validate
Validate an existing JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
    "valid": true,
    "user": {
        "userId": "string",
        "userName": "string"
    }
}
```

## Frontend Components

### AuthForm Component
- **Unified Interface**: Single component handles both login and registration
- **Mode Toggle**: Easy switching between login and register modes
- **Form Validation**: Real-time validation with helpful error messages
- **Loading States**: Visual feedback during authentication operations
- **Responsive Design**: Works well on all screen sizes

### Features:
- **Login Mode**: Username/email + password
- **Register Mode**: Username + email + password + confirm password
- **Validation Rules**:
  - All fields required
  - Password minimum 6 characters
  - Email must contain '@'
  - Passwords must match (registration)
  - Username/email must be unique (registration)

## User Flow

### Registration Flow
1. User clicks "Sign up" on login page
2. User fills in username, email, password, and confirm password
3. Frontend validates form data
4. Backend checks for existing username/email
5. Password is hashed and stored
6. JWT token is generated and returned
7. User is automatically logged in and redirected to rooms

### Login Flow
1. User enters username/email and password
2. Backend validates credentials
3. JWT token is generated and returned
4. User is logged in and redirected to rooms

### Session Management
1. App startup checks for existing JWT token
2. Token is validated with backend
3. If valid, user is automatically logged in
4. If invalid, user is redirected to login page

## Security Considerations

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **No Plain Text**: Passwords are never stored in plain text
- **Secure Comparison**: bcrypt.compare() for password verification

### Token Security
- **JWT Secret**: Configurable secret key
- **Expiration**: 12-hour token expiration
- **Validation**: Automatic token validation on protected routes

### Input Validation
- **Frontend**: Real-time validation with user feedback
- **Backend**: Server-side validation for all inputs
- **SQL Injection**: Protected by Supabase parameterized queries

## Error Handling

### Common Error Messages
- **Invalid Credentials**: Wrong username/email or password
- **User Already Exists**: Username or email already taken
- **Validation Errors**: Missing fields, invalid formats
- **Network Errors**: Connection issues with backend

### User Experience
- **Clear Messages**: Specific error messages for each issue
- **Form Persistence**: Form data preserved on validation errors
- **Loading States**: Visual feedback during operations
- **Automatic Redirects**: Seamless navigation after successful auth

## Setup Instructions

1. **Update Database Schema**:
   ```sql
   -- Run the updated schema in your Supabase dashboard
   ```

2. **Environment Variables**:
   ```env
   JWT_SECRET=your-secure-jwt-secret
   ```

3. **Test the System**:
   - Try registering a new account
   - Test login with username and email
   - Verify session persistence
   - Test logout functionality

## Migration Notes

### From Previous System
- **Backward Compatibility**: Existing JWT tokens will need re-authentication
- **User Data**: Existing users will need to register with passwords
- **API Changes**: Login endpoint now requires password
- **Frontend Updates**: New AuthForm component replaces old Login component

### Breaking Changes
- Login now requires password authentication
- Registration is now required for new users
- JWT token format remains the same
- All existing API endpoints continue to work
