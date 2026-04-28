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

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

### Register User
Create a new user account and receive an authentication token.

**Request**
```
POST /api/auth/register
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address (must be unique) |
| `password` | string | Yes | Minimum 8 characters, must contain uppercase, lowercase, and number |
| `username` | string | Yes | Unique username (3-50 characters) |
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |

**Response (201 Created)**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-04-28T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**
- `400` - Validation failed (see [Validation Errors](#validation-errors-400))
- `500` - Failed to create user (database error, e.g., duplicate email/username)

**Example**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
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
  "password": "SecurePass123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | User's password |

**Response (200 OK)**
```json
{
  "message": "Login successful",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**
- `400` - Validation failed (invalid email format or missing password)
- `401` - Invalid credentials (wrong email or password)
- `500` - Failed to login (unexpected server error)

**Example**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
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

**Authentication Required**: All endpoints in this section require a valid Bearer token.

### Get User Profile
Retrieve the authenticated user's profile information.

**Request**
```
GET /api/users/profile
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

**Error Responses**
- `401` - Access token required / Invalid or expired token (see [Authentication Errors](#authentication-errors))
- `404` - User not found
- `500` - Failed to fetch profile

---

### Update User Profile
Update the authenticated user's profile information.

**Request**
```
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | No | Valid email address |
| `username` | string | No | Username (3-50 characters) |
| `firstName` | string | No | First name (max 100 characters) |
| `lastName` | string | No | Last name (max 100 characters) |

**Response (200 OK)**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newemail@example.com",
    "username": "newusername",
    "firstName": "Jane",
    "lastName": "Smith",
    "updatedAt": "2026-04-28T13:00:00.000Z"
  }
}
```

**Error Responses**
- `400` - Validation failed (invalid email/username format)
- `401` - Access token required / Invalid or expired token
- `500` - Failed to update profile (database error)

**Example**
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

---

### Change Password
Change the authenticated user's password.

**Request**
```
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | string | Yes | Current password |
| `newPassword` | string | Yes | New password (minimum 8 characters, must contain uppercase, lowercase, and number) |

**Response (200 OK)**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses**
- `400` - Validation failed / Current password is incorrect
- `401` - Access token required / Invalid or expired token
- `404` - User not found
- `500` - Failed to change password

**Example**
```bash
curl -X POST http://localhost:3000/api/users/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass123"
  }'
```

---

## Habits

Base path: `/api/habits`

**Authentication Required**: All endpoints in this section require a valid Bearer token.

### Get All User Habits
Retrieve all habits for the authenticated user, including their associated tags.

**Request**
```
GET /api/habits
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "habits": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "987e6543-e21b-12d3-a456-426614174000",
      "name": "Morning Exercise",
      "description": "30 minutes of cardio",
      "frequency": "daily",
      "targetCount": 1,
      "isActive": true,
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z",
      "tags": [
        {
          "id": "tag-uuid-1",
          "name": "Health",
          "color": "#22C55E"
        }
      ]
    }
  ]
}
```

**Example**
```bash
curl http://localhost:3000/api/habits \
  -H "Authorization: Bearer <token>"
```

---

### Get Habit by ID
Retrieve a specific habit with its tags and recent entries.

**Request**
```
GET /api/habits/:id
Authorization: Bearer <token>
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Habit ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "habit": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "987e6543-e21b-12d3-a456-426614174000",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "targetCount": 1,
    "isActive": true,
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z",
    "tags": [
      {
        "id": "tag-uuid-1",
        "name": "Health",
        "color": "#22C55E"
      }
    ],
    "entries": [
      {
        "id": "entry-uuid-1",
        "habit_id": "123e4567-e89b-12d3-a456-426614174000",
        "completion": "2026-04-28T08:00:00.000Z",
        "note": "Felt great today",
        "createdAt": "2026-04-28T08:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses**
- `400` - Invalid parameters (invalid UUID format)
- `401` - Access token required / Invalid or expired token
- `404` - Habit not found (doesn't exist or doesn't belong to user)
- `500` - Failed to fetch habit

**Example**
```bash
curl http://localhost:3000/api/habits/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### Create Habit
Create a new habit for the authenticated user.

**Request**
```
POST /api/habits
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "Morning Exercise",
  "description": "30 minutes of cardio",
  "frequency": "daily",
  "targetCount": 1,
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Habit name (1-100 characters) |
| `description` | string | No | Habit description |
| `frequency` | string | Yes | Must be one of: `daily`, `weekly`, `monthly` |
| `targetCount` | number | No | Target count per period (default: 1, must be positive integer) |
| `tagIds` | array | No | Array of tag UUIDs to associate with the habit |

**Response (201 Created)**
```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "987e6543-e21b-12d3-a456-426614174000",
    "name": "Morning Exercise",
    "description": "30 minutes of cardio",
    "frequency": "daily",
    "targetCount": 1,
    "isActive": true,
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

**Error Responses**
- `400` - Validation failed (invalid frequency, name too long, etc.)
- `401` - Access token required / Invalid or expired token
- `500` - Failed to create habit (database error)

**Example**
```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Exercise",
    "frequency": "daily",
    "tagIds": ["tag-uuid-1"]
  }'
```

---

### Update Habit
Update an existing habit.

**Request**
```
PUT /api/habits/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Habit ID (must be valid UUID format) |

**Request Body**
```json
{
  "name": "Evening Exercise",
  "description": "Updated description",
  "frequency": "weekly",
  "targetCount": 3,
  "isActive": false,
  "tagIds": ["tag-uuid-3"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Habit name (1-100 characters) |
| `description` | string | No | Habit description |
| `frequency` | string | No | Must be one of: `daily`, `weekly`, `monthly` |
| `targetCount` | number | No | Target count per period (must be positive integer) |
| `isActive` | boolean | No | Whether the habit is active |
| `tagIds` | array | No | Array of tag UUIDs (replaces existing tags) |

**Response (200 OK)**
```json
{
  "message": "Habit updated successfully",
  "habit": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "987e6543-e21b-12d3-a456-426614174000",
    "name": "Evening Exercise",
    "description": "Updated description",
    "frequency": "weekly",
    "targetCount": 3,
    "isActive": false,
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T13:00:00.000Z"
  }
}
```

**Error Responses**
- `400` - Invalid parameters / Validation failed
- `401` - Access token required / Invalid or expired token
- `404` - Habit not found (doesn't exist or doesn't belong to user)
- `500` - Failed to update habit (database error)

**Example**
```bash
curl -X PUT http://localhost:3000/api/habits/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Evening Exercise",
    "isActive": false
  }'
```

---

### Delete Habit
Remove a habit from the system. This will cascade delete all associated entries and tag associations.

**Request**
```
DELETE /api/habits/:id
Authorization: Bearer <token>
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Habit ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "message": "Habit deleted successfully"
}
```

**Error Responses**
- `400` - Invalid parameters (invalid UUID format)
- `401` - Access token required / Invalid or expired token
- `404` - Habit not found (doesn't exist or doesn't belong to user)
- `500` - Failed to delete habit

**Example**
```bash
curl -X DELETE http://localhost:3000/api/habits/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

## Tags

Base path: `/api/tags`

**Authentication Required**: All endpoints in this section require a valid Bearer token.

### Get All Tags
Retrieve all available tags, sorted alphabetically by name.

**Request**
```
GET /api/tags
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Health",
      "color": "#22C55E",
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z"
    },
    {
      "id": "234e5678-e89b-12d3-a456-426614174001",
      "name": "Work",
      "color": "#3B82F6",
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z"
    }
  ]
}
```

**Example**
```bash
curl http://localhost:3000/api/tags \
  -H "Authorization: Bearer <token>"
```

---

### Get Popular Tags
Retrieve the top 10 most-used tags, sorted by usage count.

**Request**
```
GET /api/tags/popular
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
  "tags": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Health",
      "color": "#22C55E",
      "usageCount": 15,
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z"
    },
    {
      "id": "234e5678-e89b-12d3-a456-426614174001",
      "name": "Work",
      "color": "#3B82F6",
      "usageCount": 12,
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z"
    }
  ]
}
```

**Example**
```bash
curl http://localhost:3000/api/tags/popular \
  -H "Authorization: Bearer <token>"
```

---

### Get Tag by ID
Retrieve a specific tag with all associated habits.

**Request**
```
GET /api/tags/:id
Authorization: Bearer <token>
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Tag ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "tag": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Health",
    "color": "#22C55E",
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z",
    "habits": [
      {
        "id": "habit-uuid-1",
        "name": "Morning Exercise",
        "description": "30 minutes of cardio",
        "isActive": true
      }
    ]
  }
}
```

**Error Responses**
- `400` - Invalid parameters (invalid UUID format)
- `401` - Access token required / Invalid or expired token
- `404` - Tag not found
- `500` - Failed to fetch tag

**Example**
```bash
curl http://localhost:3000/api/tags/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### Create Tag
Create a new tag.

**Request**
```
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "Health",
  "color": "#22C55E"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tag name (1-50 characters, must be unique) |
| `color` | string | No | Hex color code (e.g., `#22C55E`, default: `#6B7280`) |

**Response (201 Created)**
```json
{
  "message": "Tag created successfully",
  "tag": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Health",
    "color": "#22C55E",
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  }
}
```

**Error Responses**
- `400` - Validation failed (invalid name/color format)
- `401` - Access token required / Invalid or expired token
- `409` - Tag with this name already exists
- `500` - Failed to create tag (database error)

**Example**
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Health",
    "color": "#22C55E"
  }'
```

---

### Update Tag
Update an existing tag.

**Request**
```
PUT /api/tags/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Tag ID (must be valid UUID format) |

**Request Body**
```json
{
  "name": "Wellness",
  "color": "#10B981"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Tag name (1-50 characters, must be unique) |
| `color` | string | No | Hex color code (e.g., `#10B981`) |

**Response (200 OK)**
```json
{
  "message": "Tag updated successfully",
  "tag": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Wellness",
    "color": "#10B981",
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T13:00:00.000Z"
  }
}
```

**Error Responses**
- `400` - Invalid parameters / Validation failed
- `401` - Access token required / Invalid or expired token
- `404` - Tag not found
- `409` - Tag with this name already exists (when updating name)
- `500` - Failed to update tag (database error)

**Example**
```bash
curl -X PUT http://localhost:3000/api/tags/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wellness",
    "color": "#10B981"
  }'
```

---

### Delete Tag
Remove a tag from the system. This will also remove the tag association from all habits.

**Request**
```
DELETE /api/tags/:id
Authorization: Bearer <token>
```

**Path Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Tag ID (must be valid UUID format) |

**Response (200 OK)**
```json
{
  "message": "Tag deleted successfully"
}
```

**Error Responses**
- `400` - Invalid parameters (invalid UUID format)
- `401` - Access token required / Invalid or expired token
- `404` - Tag not found
- `500` - Failed to delete tag

**Example**
```bash
curl -X DELETE http://localhost:3000/api/tags/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. All error responses include an `error` field with a descriptive message.

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success - Request completed successfully |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data or parameters |
| `401` | Unauthorized - Missing or invalid authentication token |
| `403` | Forbidden - Token is invalid or expired |
| `404` | Not Found - Requested resource doesn't exist |
| `409` | Conflict - Resource already exists (duplicate) |
| `500` | Internal Server Error - Unexpected server error |

---

### Validation Errors (400)

#### Body Validation Failure
When request body validation fails (via Zod schema):

**Response (400 Bad Request)**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

#### Parameter Validation Failure
When URL parameter validation fails:

**Response (400 Bad Request)**
```json
{
  "error": "Invalid parameters",
  "details": [
    {
      "field": "id",
      "message": "Invalid habit ID format"
    }
  ]
}
```

#### Query Parameter Validation Failure
When query parameter validation fails:

**Response (400 Bad Request)**
```json
{
  "error": "Invalid query parameters",
  "details": [
    {
      "field": "limit",
      "message": "Expected number, received string"
    }
  ]
}
```

#### Common Validation Messages
- `"Invalid email format"` - Email doesn't match required format
- `"Password must be at least 8 characters"` - Password too short
- `"Password must contain uppercase, lowercase, and number"` - Password doesn't meet complexity requirements
- `"Username must be at least 3 characters"` - Username too short
- `"Habit name is required"` - Required field missing
- `"Frequency must be one of: daily, weekly, monthly"` - Invalid enum value
- `"Invalid habit ID format"` - UUID format validation failed
- `"Color must be a valid hex color"` - Color format invalid (must be `#RRGGBB`)

---

### Authentication Errors

#### Missing Token (401)
When no authentication token is provided:

**Response (401 Unauthorized)**
```json
{
  "error": "Access token required"
}
```

#### Invalid or Expired Token (403)
When the provided token is invalid or has expired:

**Response (403 Forbidden)**
```json
{
  "error": "Invalid or expired token"
}
```

#### Invalid Credentials (401)
When login credentials are incorrect:

**Response (401 Unauthorized)**
```json
{
  "error": "Invalid credentials"
}
```

#### Incorrect Password (400)
When changing password with incorrect current password:

**Response (400 Bad Request)**
```json
{
  "error": "Current password is incorrect"
}
```

---

### Not Found Errors (404)

When a requested resource doesn't exist:

**Response (404 Not Found)**
```json
{
  "error": "Habit not found"
}
```

**Possible Error Messages:**
- `"Habit not found"` - Habit ID doesn't exist or doesn't belong to user
- `"Tag not found"` - Tag ID doesn't exist
- `"User not found"` - User ID doesn't exist

---

### Conflict Errors (409)

When trying to create a duplicate resource:

**Response (409 Conflict)**
```json
{
  "error": "Tag with this name already exists"
}
```

**Possible Error Messages:**
- `"Tag with this name already exists"` - Attempting to create tag with duplicate name
- Database constraint violations (e.g., duplicate email, username)

---

### Server Errors (500)

When an unexpected server error occurs:

**Response (500 Internal Server Error)**
```json
{
  "error": "Failed to create habit"
}
```

**In Development Mode Only:**
Additional debugging information is included:
```json
{
  "error": "Failed to create habit",
  "stack": "Error: Failed to create habit\n    at ...",
  "details": "Detailed error message"
}
```

**Common Error Messages:**
- `"Failed to create user"` - Error during user registration
- `"Failed to login"` - Error during authentication
- `"Failed to fetch profile"` - Error retrieving user profile
- `"Failed to update profile"` - Error updating user profile
- `"Failed to change password"` - Error changing password
- `"Failed to create habit"` - Error creating habit
- `"Failed to fetch habits"` - Error retrieving habits
- `"Failed to fetch habit"` - Error retrieving single habit
- `"Failed to update habit"` - Error updating habit
- `"Failed to delete habit"` - Error deleting habit
- `"Failed to create tag"` - Error creating tag
- `"Failed to fetch tags"` - Error retrieving tags
- `"Failed to fetch tag"` - Error retrieving single tag
- `"Failed to update tag"` - Error updating tag
- `"Failed to delete tag"` - Error deleting tag
- `"Failed to fetch popular tags"` - Error retrieving popular tags

---

## Content Types

All endpoints expect and return JSON with the following content type:
```
Content-Type: application/json
```

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After registering or logging in, you'll receive a token that must be included in the Authorization header for all protected endpoints:

```
Authorization: Bearer <your_token_here>
```

### Protected Endpoints
The following endpoints require authentication:
- All `/api/habits` endpoints
- All `/api/tags` endpoints
- `/api/users/profile` (GET and PUT)
- `/api/users/change-password`

### Public Endpoints
The following endpoints do not require authentication:
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

---

## Data Models

### User
```typescript
{
  id: string (UUID)
  email: string
  username: string
  firstName?: string
  lastName?: string
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
}
```

### Habit
```typescript
{
  id: string (UUID)
  userId: string (UUID)
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  targetCount: number
  isActive: boolean
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  tags?: Tag[]
  entries?: Entry[]
}
```

### Tag
```typescript
{
  id: string (UUID)
  name: string
  color: string (hex color code)
  createdAt: string (ISO 8601)
  updatedAt: string (ISO 8601)
  usageCount?: number (only in popular tags endpoint)
  habits?: Habit[] (only in get tag by ID endpoint)
}
```

### Entry
```typescript
{
  id: string (UUID)
  habit_id: string (UUID)
  completion: string (ISO 8601)
  note?: string
  createdAt: string (ISO 8601)
}
```

---

## Rate Limiting

*Note: Rate limiting to be implemented in future versions.*

---

## Pagination

*Note: Pagination support to be added for list endpoints in future versions.*
