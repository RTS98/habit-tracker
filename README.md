# Habit Tracker API

A RESTful API for tracking daily habits, built with Node.js, Express, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
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
| `CORS_ORIGIN` | `string` | `*` | Allowed origin for CORS requests (e.g., `http://localhost:3000`) |
| `DATABASE_URL` | `string` | - | PostgreSQL connection string (required) |
| `DB_CERT_PATH` | `string` | - | Path to database SSL certificate (optional, production only) |

### Configuration Files

- **Development**: `.env.development` - Used when `NODE_ENV=development`
- **Production**: `.env` - Used when `NODE_ENV=production`

The application validates environment variables on startup and will exit with a detailed error message if validation fails.

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured via the `CORS_ORIGIN` environment variable.

**Note**: Only a single domain is accepted at this time. Multiple origins are not supported.

- **Development**: Set to `*` to allow all origins (default)
- **Production**: Set to your client domain (e.g., `https://yourdomain.com`)

### Database Configuration

The application requires a PostgreSQL database. Set the `DATABASE_URL` environment variable with your connection string:

```bash
# Local development
DATABASE_URL=postgresql://user:password@localhost:5432/habit_tracker_dev

# Remote/Docker (example)
DATABASE_URL=postgresql://user:password@db-host:5432/habit_tracker_prod
```

**SSL/TLS Certificates:**
- **Development**: SSL is disabled by default
- **Production**: SSL is automatically enabled with certificate verification
- Optional: Set `DB_CERT_PATH` to specify a custom CA certificate for self-signed certificates

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

## Database

The application uses **Drizzle ORM** for type-safe database operations with PostgreSQL.

### Database Schema

```
┌─────────────────────┐
│      USERS          │
├─────────────────────┤
│ id (UUID) [PK]      │
│ email (VARCHAR)     │
│ username (VARCHAR)  │
│ passwordHash        │
│ firstName           │
│ lastName            │
│ createdAt           │
│ updatedAt           │
│ deletedAt           │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│      HABITS         │
├─────────────────────┤
│ id (UUID) [PK]      │
│ user_id (UUID) [FK] │
│ name (VARCHAR)      │
│ description (TEXT)  │
│ frequency (VARCHAR) │
│ target_count (INT)  │
│ is_active (BOOLEAN) │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
    │            │
    │ 1:N        │ N:M
    │            └──────────┐
    ▼                       ▼
┌─────────────────────┐   ┌──────────────────┐
│  HABIT_ENTRIES      │   │   HABIT_TAGS     │
├─────────────────────┤   ├──────────────────┤
│ id (UUID) [PK]      │   │ id (UUID) [PK]   │
│ habit_id (UUID)[FK] │   │ habit_id (FK)    │
│ completion_data     │   │ tag_id (FK)      │
│ note (TEXT)         │   │ createdAt        │
│ createdAt           │   └──────────────────┘
└─────────────────────┘         │
                                │ N:1
                                ▼
                        ┌──────────────────┐
                        │      TAGS        │
                        ├──────────────────┤
                        │ id (UUID) [PK]   │
                        │ name (VARCHAR)   │
                        │ color (VARCHAR)  │
                        │ createdAt        │
                        │ updatedAt        │
                        └──────────────────┘
```

### Database Management

**Generate migrations from schema changes:**
```bash
npm run db:generate
```

**Apply pending migrations:**
```bash
npm run db:push
```

**Run database migrations:**
```bash
npm run db:migrate
```

**Seed the database with demo data:**
```bash
npm run db:seed
```

**Open Drizzle Studio for visual database management:**
```bash
npm run db:studio
```

## API Documentation

For comprehensive API endpoint documentation including request/response examples, see [API_DOCS.md](./API_DOCS.md).

### Available API Routes
- **Authentication**: `/api/auth` - Register, login, logout, and token refresh
- **Users**: `/api/users` - User management (CRUD operations)
- **Habits**: `/api/habits` - Habit tracking and completion
- **Tags**: `/api/tags` - Tag management for organizing habits

### Health Check
```
GET /health
```
Returns `{ status: "ok", timestamp: "...", service: "Habit tracker API" }`

## Configuration

### TypeScript Configuration
The project uses TypeScript with ES modules. Key configurations in `tsconfig.json`:

- **Module Resolution**: Uses `"bundler"` for flexible module resolution without requiring explicit file extensions
- **File Extensions**: Relative imports don't require `.ts` extensions in source code (automatically added during compilation)
- **Syntax**: `rewriteRelativeImportExtensions: true` ensures proper extension handling during build

### Database with Drizzle ORM
Database operations use **Drizzle ORM** for type-safe SQL:
- Migrations managed through `drizzle-kit` commands
- Full type inference from schema definitions
- Schema relationships properly defined with Drizzle relations
- Supports PostgreSQL specific features and constraints

### Security & Middleware
The application includes:
- **CORS** - Cross-Origin Resource Sharing for secure API access
- **Helmet** - HTTP headers hardening for security
- **Morgan** - HTTP request logging
- **SSL/TLS** - Automatic SSL in production environments with certificate support

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
│   ├── index.ts              # Application entry point
│   ├── server.ts             # Express app configuration and routes
│   ├── middleware/
│   │   └── validation.ts     # Request validation middleware
│   ├── routes/
│   │   ├── authRoutes.ts     # Authentication endpoints
│   │   ├── habitRoutes.ts    # Habit management endpoints
│   │   ├── tagRoutes.ts      # Tag management endpoints
│   │   └── userRoutes.ts     # User management endpoints
│   ├── schemas/
│   │   ├── habit.ts          # Habit validation schema
│   │   └── user.ts           # User validation schema
│   └── tests/
│       ├── server.test.ts    # Server tests
│       ├── middleware/
│       │   └── validate-body.test.ts
│       └── routes/
│           ├── authRoutes.test.ts
│           ├── habitRoutes.test.ts
│           ├── tagRoutes.test.ts
│           └── userRoutes.test.ts
├── env.ts                    # Environment variable configuration and validation
├── API_DOCS.md              # API endpoint documentation
├── package.json             # Project metadata and dependencies
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest configuration
└── README.md                # Project documentation
```

## Technologies

### Core
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript

### Database
- **PostgreSQL** - Database system
- **pg** - PostgreSQL client for Node.js
- **Drizzle ORM** - Type-safe ORM with schema management
- **Drizzle-Zod** - Generate Zod schemas from Drizzle tables

### Security & Middleware
- **Helmet** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logging

### Development Tools
- **tsx** - TypeScript executor with watch mode
- **ts-node** - TypeScript execution for Node.js
- **Vitest** - Unit testing framework
- **Supertest** - HTTP assertion library
- **Drizzle Kit** - ORM toolkit for migrations and schema management
- **dotenv** - Environment variable loader

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:push` | Apply migrations to database |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio visual editor |
| `npm run db:seed` | Seed database with demo data |

## License

ISC
