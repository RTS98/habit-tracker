# Habit Tracker API

A RESTful API for tracking daily habits, built with Node.js, Express, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Technologies](#technologies)

## Overview

The Habit Tracker API is a backend service that allows users to track their daily habits. The project is built with TypeScript for type safety and uses Express.js for routing and request handling.

## Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (for production use)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
# For development
cp .env.example .env.development

# For production
cp .env.example .env
```

## Environment Variables

Environment variables are managed through `.env` and `.env.development` files. The application validates all environment variables using Zod schemas.

### Required/Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | `string` | `development` | Application environment (`development` or `production`) |
| `PORT` | `number` | `3000` | Server port number |

### Configuration Files

- **Development**: `.env.development` - Used when `NODE_ENV=development`
- **Production**: `.env` - Used when `NODE_ENV=production`

The application validates environment variables on startup and will exit with a detailed error message if validation fails.

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs the server in watch mode with hot reload using `tsx`.

### Production Mode
```bash
# Build the TypeScript
npm run build

# Start the server
npm start
```
The server will start on the PORT specified in environment variables (default: 3000).

### Production with Custom Port
```bash
PORT=8080 npm start
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check
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

**Example Usage**
```bash
curl http://localhost:3000/health
```

## Testing

Run all tests:
```bash
npm test
```

Tests are written using Vitest and Supertest for API endpoint testing.

### Test Files
- `src/tests/server.test.ts` - Server and endpoint tests

### Example Test
The health check endpoint is tested to ensure:
- Returns HTTP 200 status
- Response body contains `status: "ok"`

## Project Structure

```
habit-tracker/
├── src/
│   ├── server.ts        # Express app configuration and routes
│   ├── index.ts         # Application entry point
│   └── tests/
│       └── server.test.ts   # API endpoint tests
├── env.ts               # Environment variable configuration and validation
├── package.json         # Project metadata and dependencies
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Vitest configuration
└── README.md           # Project documentation
```

## Technologies

### Core
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript

### Database
- **PostgreSQL** - Database system
- **pg** - PostgreSQL client for Node.js

### Development Tools
- **tsx** - TypeScript executor with watch mode
- **ts-node** - TypeScript execution for Node.js
- **Vitest** - Unit testing framework
- **Supertest** - HTTP assertion library
- **Zod** - TypeScript-first schema validation

### Other
- **dotenv** - Environment variable loader

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests |

## License

ISC
