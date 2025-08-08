# Authentication Flow

## Overview
This application implements a JWT-based authentication system with the following user flow:

## User Flow

### 1. Application Startup
- When the app starts, the `AuthProvider` checks for an existing JWT token in localStorage
- If a token exists, it validates it with the backend server via `/api/auth/validate`
- If the token is valid, the user is automatically logged in
- If the token is invalid or expired, it's removed from localStorage

### 2. Authentication Check
- If no valid token is found, the user is redirected to `/login`
- If a valid token exists, the user is redirected to `/rooms`

### 3. Login Process
- User enters their username on the login page
- The frontend generates a UUID for the user
- A POST request is sent to `/api/auth/login` with the user data
- The backend generates a JWT token and returns it
- The token is stored in localStorage along with user data
- User is redirected to `/rooms`

### 4. Protected Routes
- All routes except `/login` are protected by the `ProtectedRoute` component
- If a user tries to access a protected route without authentication, they're redirected to `/login`
- If a user is already authenticated and tries to access `/login`, they're redirected to `/rooms`

### 5. Logout
- User can logout via the logout button in the RoomList component
- This clears the JWT token and user data from localStorage
- User is redirected to `/login`

## Backend Endpoints

### POST /api/auth/login
- Accepts user data and generates a JWT token
- Token expires in 12 hours
- Returns: `{ token: string }`

### GET /api/auth/validate
- Validates an existing JWT token
- Requires Authorization header: `Bearer <token>`
- Returns: `{ valid: boolean, user: { userId: string, userName: string } }`

## Frontend Components

### AuthProvider
- Manages authentication state
- Provides login, logout, and token validation functions
- Handles automatic token validation on app startup

### ProtectedRoute
- Wraps protected components
- Redirects unauthenticated users to login
- Shows loading spinner while checking authentication

### Login
- Handles user login
- Redirects authenticated users away from login page
- Shows loading state during authentication check

## Security Features

- JWT tokens with 12-hour expiration
- Automatic token validation on app startup
- Protected routes with automatic redirects
- Token cleanup on logout or validation failure
- CORS configuration for secure cross-origin requests
- Rate limiting on API endpoints

## Error Handling

- Network errors (server not running) are handled gracefully
- Invalid/expired tokens are automatically cleared
- User-friendly error messages for login failures
- Loading states during authentication operations
