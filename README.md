# 🤖 Bionic Workspace API

REST API built with NestJS and TypeScript for managing and monitoring robotic and bionic devices during development.

## Overview

Bionic Workspace is a platform for managing and monitoring robotic and bionic devices during development.
It allows users to manage devices and components, configure operational thresholds, process telemetry, generate alerts, track component status, and manage device files and documentation.

## Features

- 🔐 User registration and JWT authentication.
- 🔄 Access and refresh token management.
- 🤖 Device management with user data isolation.
- ⚙️ Component management associated with devices.
- 📏 Configurable minimum and maximum thresholds.
- 📡 Telemetry ingestion and historical telemetry.
- 🚨 Automatic alert generation based on telemetry readings.
- 🔎 Alert querying and resolution.
- 📊 Automatic component operational status tracking.
- 📁 Device visual representation and technical documentation management.
- 🛡️ File upload validation with supported file types and size limits.
- 🧪 Unit and end-to-end testing.
- ⚙️ Continuous Integration with GitHub Actions.
- 📚 Interactive API documentation with Swagger.
- 🚀 Production deployment with Railway.

## 📚 API Documentation

Interactive API documentation is available through Swagger:

https://bionic-workspace-api-production.up.railway.app/api
  

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 22.13+
- pnpm 11.6.0
- Docker Desktop

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/MelinaRcldz/bionic-workspace-api.git
cd bionic-workspace-api
pnpm install
```

### Environment Variables

Create a `.env` file in the project root and configure the required environment variables:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/db_name
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### Database

Start the PostgreSQL container:

```bash
docker compose up -d
```

Run the database migrations:

```bash
pnpm run db:migrate
```

### Running the API

Start the development server:

```bash
pnpm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

## 🧪 Testing

Run the unit tests:

```bash
pnpm run test
```

Run the end-to-end tests:

```bash
pnpm run test:e2e
```

Run tests with coverage:
```bash
pnpm run test:cov
```

The project includes unit tests for critical business logic and end-to-end tests covering the main API flows, authentication, device management, telemetry, and file uploads.

## ⚙️ Continuous Integration

The project uses GitHub Actions to automatically validate changes pushed to `main` or submitted through pull requests.

The CI pipeline runs:

- ESLint
- Project build
- Unit tests

## 🛠️ Tech Stack

- **NestJS** — Backend framework.
- **TypeScript** — Programming language.
- **Drizzle ORM** — Database ORM and schema management.
- **PostgreSQL** — Relational database.
- **JWT** — Authentication with access and refresh tokens.
- **bcrypt** — Password hashing and refresh token hashing.
- **Docker Compose** — Local PostgreSQL environment.
- **pnpm** — Package manager.
- **Jest** — Unit testing.
- **Supertest** — End-to-end API testing.
- **GitHub Actions** — Continuous Integration.
- **Swagger** — Interactive API documentation.
- **Railway** — Production deployment.
  

## Architecture
```
                                        BIONIC WORKSPACE API

                ┌──────────┐       ┌────────────┐       ┌─────────────┐
                │   USER   │ ────▶    DEVICE     ────▶ │  COMPONENT  │
                └──────────┘       └────────────┘       └──────┬──────┘
                                                               │
                                                               ▼
                                                       ┌───────────────┐
                                                       │   TELEMETRY   │
                                                       └───────┬───────┘
                                                               │
                                               ┌───────────────┴───────────────┐
                                               ▼                               ▼
                                            IN RANGE                      OUT OF RANGE
                                               │                               │
                                               ▼                               ▼
                                          OPERATIONAL                        ALERT
                                                                               │
                                                                               ▼
                                                                       COMPONENT STATUS


        Component status
                                        ┌─────────────────┐
                                        │   OPERATIONAL   │
                                        └────────┬────────┘
                                                 │
                                        out-of-range telemetry
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                 ┌─────────────────────>│    CRITICAL     │<──────────────────────┐
                 │                      └────────┬────────┘                       │
                 │                 ┌─────────────┴─────────────┐                  │
                 │                 │                           │                  │
                 │              normal                  alert resolution          │
                 │             telemetry              + condition persists        │
                 │                 │                           │                  │
               out-of-             ▼                           ▼                out-of-
                range       ┌──────┴─────────┐        ┌────────┴──────────┐      range
                 │          │  WARNING /     │        │ WARNING /         │       │
                 │          │  RECOVERY      │        │ PERSISTENT_AFTER_ │       │
                 │          └───┬─────┬──────┘        │ RESOLUTION        │       │
                 │              │     │               └─────┬──────┬──────┘       │
                 └──────────────┘     └────   normal   ─────┘      └──────────────┘
                                             telemetry
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │ OPERATIONAL │
                                          └─────────────┘
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user. | Public |
| `POST` | `/auth/login` | Authenticate a user and obtain access and refresh tokens. | Public |
| `POST` | `/auth/refresh` | Generate new access and refresh tokens using a valid refresh token. | Public |
| `GET` | `/auth/me` | Get the authenticated user's information. | JWT |

### Devices

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/devices` | Create a new device. | JWT |
| `GET` | `/devices` | Get all devices belonging to the authenticated user. | JWT |
| `GET` | `/devices/:id` | Get a specific device owned by the authenticated user. | JWT |
| `PATCH` | `/devices/:id` | Update a device owned by the authenticated user. | JWT |
| `DELETE` | `/devices/:id` | Delete a device owned by the authenticated user. | JWT |

### Components

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/devices/:deviceId/components` | Create a component associated with a device. | JWT |
| `GET` | `/devices/:deviceId/components` | Get all components belonging to a device. | JWT |
| `GET` | `/devices/:deviceId/components/:id` | Get a specific component from a device. | JWT |
| `PATCH` | `/devices/:deviceId/components/:id` | Update a component from a device. | JWT |
| `DELETE` | `/devices/:deviceId/components/:id` | Delete a component from a device. | JWT |

### Telemetry

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/devices/:id/telemetry` | Submit a telemetry reading for a device component. | JWT |
| `GET` | `/devices/:id/telemetry` | Get the telemetry history of a device. | JWT |

### Alerts

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/devices/:id/alerts` | Get all alerts associated with a device. | JWT |
| `GET` | `/alerts/:id` | Get a specific alert. | JWT |
| `PATCH` | `/alerts/:id/resolve` | Resolve an alert and update the affected component's status based on its latest telemetry. | JWT |

### Files

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/devices/:deviceId/representation` | Upload a visual representation of a device. | JWT |
| `GET` | `/devices/:deviceId/representation` | Get the visual representations associated with a device. | JWT |
| `POST` | `/devices/:deviceId/documentation` | Upload technical documentation associated with a device. | JWT |
| `GET` | `/devices/:deviceId/documentation` | Get the technical documentation associated with a device. | JWT |
| `GET` | `/devices/:deviceId/files` | Get all files associated with a device, grouped by category. | JWT |
| `GET` | `/devices/:deviceId/files/:fileId/download` | Download a file associated with a device. | JWT |
| `DELETE` | `/devices/:deviceId/files/:fileId` | Delete a file associated with a device. | JWT |

## Telemetry & Alert Flow

Telemetry readings are evaluated against the thresholds configured for each
component. Out-of-range readings can generate alerts and update the
component's operational status.

A resolved alert does not necessarily mean that the physical condition has
returned to normal. If the abnormal condition persists, the component can
remain in `WARNING / PERSISTENT_AFTER_RESOLUTION` until normal telemetry is
received.

## 📁 File Storage

Device representations and technical documentation are currently stored using the API's local filesystem through the `StorageService`.

This is an intentional decision for the current development and portfolio deployment. The storage layer is isolated behind a dedicated service so that it can be replaced by an external object storage solution in the future if the project requires persistent cloud storage at a larger scale.
