# API Documentation

## Base URL
```
http://localhost:3000
```

## Table of Contents
- [Health Check](#health-check)
- [Authentication](#authentication)
- [Users](#users)
- [Habits](#habits)
- [Tags](#tags)
- [Error Handling](#error-handling)

---

## Health Check

### Get Health Status
Returns the health status of the API server.

**Request**
```
GET /health
```

**Response (200 OK)**
```json
{
  "status": "ok",
  "timestamp": "2026-04-24T12:30:45.123Z",
  "service": "Habit tracker API"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Health status (`ok` indicates service is running) |
| `timestamp` | string | ISO 8601 formatted timestamp of the response |
| `service` | string | Service name identifier |

**Example**
```bash
curl http://localhost:3000/health
```

---

## Authentication

Base path: `/api/auth`

### Register User
Create a new user account.

**Request**
```
POST /api/auth/register
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 8 characters |
| `name` | string | Yes | User's full name |

**Response (201 Created)**
```json
{
  "message": "User registered"
}
```

**Example**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

---

### Login User
Authenticate user and receive access token.

**Request**
```
POST /api/auth/login
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created)**
```json
{
  "message": "User logged in"
}
```

---

### Logout User
Invalidate the current user session.

**Request**
```
POST /api/auth/logout
```

**Response (200 OK)**
```json
{
  "message": "User logged out"
}
```

---

### Refresh Token
Refresh the access token.

**Request**
```
POST /api/auth/refresh
```

**Response (200 OK)**
```json
{
  "message": "Token refreshed"
}
```

---

## Users

Base path: `/api/users`

### Get All Users
Retrieve all users.

**Request**
```
GET /api/users
```

**Response (200 OK)**
```json
{
  "message": "Get all users"
}
```

---

### Get User by ID
Retrieve a specific user.

**Request**
```
GET /api/users/:id
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "message": "Get user with ID {id}"
}
```

**Example**
```bash
curl http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000
```

---

### Create User
Create a new user.

**Request**
```
POST /api/users
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "newuser@example.com",
  "password": "securePass123",
  "name": "Jane Smith"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 8 characters |
| `name` | string | Yes | User's name (minimum 1 character) |

**Response (201 Created)**
```json
{
  "message": "Created a new user"
}
```

---

### Update User
Update an existing user.

**Request**
```
PUT /api/users/:id
Content-Type: application/json
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID (must be valid UUID format) |

**Request Body**
```json
{
  "name": "Updated Name"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's updated name (minimum 1 character) |

**Response (200 OK)**
```json
{
  "message": "Updated user with ID {id}"
}
```

---

### Delete User
Remove a user from the system.

**Request**
```
DELETE /api/users/:id
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "message": "Deleted user with ID {id}"
}
```

---

## Habits

Base path: `/api/habits`

### Get All Habits
Retrieve all habits.

**Request**
```
GET /api/habits
```

**Response (200 OK)**
```json
{
  "message": "Get all habits"
}
```

---

### Get Habit by ID
Retrieve a specific habit.

**Request**
```
GET /api/habits/:id
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Habit ID |

**Response (200 OK)**
```json
{
  "message": "Get habit with ID {id}"
}
```

---

### Create Habit
Create a new habit.

**Request**
```
POST /api/habits
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "Morning Exercise"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Habit name |

**Response (201 Created)**
```json
{
  "message": "Created a new habit"
}
```

---

### Mark Habit as Complete
Record a completion for a habit.

**Request**
```
POST /api/habits/:id/complete
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Habit ID |

**Response (201 Created)**
```json
{
  "message": "Marked habit as complete for user with ID {id}"
}
```

---

### Delete Habit
Remove a habit from the system.

**Request**
```
DELETE /api/habits/:id
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Habit ID |

**Response (200 OK)**
```json
{
  "message": "Deleted habit with ID {id}"
}
```

---

## Tags

Base path: `/api/tags`

### Get All Tags
Retrieve all tags.

**Request**
```
GET /api/tags
```

**Response (200 OK)**
```json
{
  "message": "tag"
}
```

---

## Error Handling

### Validation Errors
When request validation fails:

**Response (400 Bad Request)**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

### Not Found
When a resource is not found:

**Response (404 Not Found)**
```json
{
  "error": "Resource not found"
}
```

### Server Errors
When an unexpected error occurs:

**Response (500 Internal Server Error)**
```json
{
  "error": "Internal server error"
}
```

---

## Content Types

All endpoints expect and return JSON with the following content type:
```
Content-Type: application/json
```

## Authentication

*Note: Authentication implementation details to be added when auth middleware is implemented.*

Current endpoints support basic authentication flows. Bearer token or session-based authentication will be added.

## Rate Limiting

*Note: Rate limiting to be implemented.*

## Pagination

*Note: Pagination support to be added for list endpoints.*
