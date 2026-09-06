# 🤖 Bionic Workspace API

REST API built with NestJS and TypeScript for managing and monitoring robotic and bionic devices during development.

## Overview

Bionic Workspace is a platform designed for the development and supervision of robotic and bionic devices.

Users can register their devices and the components that make them up, configure operational thresholds, send telemetry readings and monitor
the resulting alerts and component status.

Telemetry readings are evaluated against the thresholds configured for each component. When a reading falls outside the expected range, the API
can generate an alert and update the component's operational status.

The platform is designed to help developers detect abnormal physical conditions during testing and development of their devices.

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
  

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- pnpm
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

## 🛠️ Tech Stack

- **NestJS** — Backend framework.
- **TypeScript** — Programming language.
- **Drizzle ORM** — Database ORM and schema management.
- **PostgreSQL** — Relational database.
- **JWT** — Authentication with access and refresh tokens.
- **bcrypt** — Password hashing and refresh token hashing.
- **Docker Compose** — Local PostgreSQL environment.
- **pnpm** — Package manager.
  

## Architecture

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
                          IN RANGE                        OUT OF RANGE
                               │                               │
                               ▼                               ▼
                         OPERATIONAL                         ALERT
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
  ┌──────────────────>│    CRITICAL     │<──────────────────────┐
  │                   └────────┬────────┘                       │
  │                            │                                │
  │              ┌─────────────┴─────────────┐                  │   
  │              │                           │                  │
  │           normal                  alert resolution          │
  │          telemetry               + condition persists       │
  │              │                           │                  │
out-of-          ▼                           ▼                out-of-
 range    ┌──────┴──────────────┐   ┌────────┴──────────┐      range
  │       │ WARNING / RECOVERY  │   │ WARNING /         │       │
  │       │                     │   │ PERSISTENT_AFTER_ │       │
  │       └───┬─────┬───────────┘   │ RESOLUTION        │       │
  │           │     │               └─────┬──────┬──────┘       │
  │           │     │                     │      │              │
  └───────────┘     └────   normal   ─────┘      └──────────────┘             
                           telemetry             
                               │                                         
                               ▼                                       
                        ┌─────────────┐                  
                        │ OPERATIONAL │            
                        └─────────────┘            


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


## Telemetry & Alert Flow

Telemetry readings are evaluated against the thresholds configured for each
component. Out-of-range readings can generate alerts and update the
component's operational status.

A resolved alert does not necessarily mean that the physical condition has
returned to normal. If the abnormal condition persists, the component can
remain in `WARNING / PERSISTENT_AFTER_RESOLUTION` until normal telemetry is
received.