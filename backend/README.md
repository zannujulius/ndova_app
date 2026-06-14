# Ndova App — Backend API

A RESTful backend for a **Service Request and Appointment Management System**. Clients book service appointments; providers review and manage them; admins oversee the entire platform.

---

## Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Runtime    | Node.js 18+                 |
| Framework  | Express.js 4                |
| Language   | TypeScript 5                |
| Database   | PostgreSQL 14+              |
| ORM        | Sequelize 6                 |
| Auth       | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod                         |
| Testing    | Jest + Supertest            |
| Logging    | Morgan                      |
| Security   | Helmet + CORS               |

---

## Folder Structure

```
backend/
├── scripts/
│   └── db-setup.sh              # Creates PostgreSQL user/database
├── src/
│   ├── config/
│   │   ├── database.ts          # Sequelize singleton
│   │   └── env.ts               # Typed env vars
│   ├── db/
│   │   ├── config.js            # sequelize-cli config (plain JS — required)
│   │   ├── migrations/          # TypeScript migration files
│   │   └── seeders/             # (reserved for future seeders)
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification → req.user
│   │   ├── error.middleware.ts  # Central error handler
│   │   ├── not-found.middleware.ts
│   │   ├── role.middleware.ts   # Role-based access (authorize)
│   │   └── validate.middleware.ts # Zod request validation
│   ├── models/
│   │   ├── index.ts             # All models + all associations
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── UserRole.ts
│   │   ├── Service.ts
│   │   ├── Appointment.ts
│   │   └── AppointmentStatusHistory.ts
│   ├── modules/
│   │   ├── auth/                # register, login, me
│   │   ├── users/               # CRUD for users + role assignment
│   │   ├── roles/               # List roles
│   │   ├── services/            # CRUD for services
│   │   ├── appointments/        # Full appointment lifecycle
│   │   └── dashboard/           # Role-scoped dashboards
│   ├── tests/
│   │   ├── env.setup.ts         # Overrides env vars for test process
│   │   ├── health.test.ts
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   ├── services.test.ts
│   │   ├── appointments.test.ts
│   │   └── dashboard.test.ts
│   ├── types/
│   │   ├── enums.ts             # AppointmentStatus enum
│   │   └── express.d.ts         # Express Request augmentation
│   ├── utils/
│   │   ├── ApiError.ts          # Custom error class
│   │   ├── asyncHandler.ts      # try/catch wrapper for controllers
│   │   ├── jwt.ts               # signToken / verifyToken
│   │   └── sanitizeUser.ts      # Strips passwordHash, flattens roles
│   ├── app.ts                   # Express app (no listen)
│   └── server.ts                # Entry point (listen)
├── .env                         # Local environment variables (not committed)
├── .env.example                 # Template
├── .sequelizerc                 # Paths for sequelize-cli
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

| Variable             | Required | Description                                                      |
| -------------------- | -------- | ---------------------------------------------------------------- |
| `NODE_ENV`           | No       | `development` \| `test` \| `production` (default: `development`) |
| `PORT`               | No       | HTTP port (default: `5000`)                                      |
| `DATABASE_URL`       | Yes      | Full PostgreSQL connection string                                |
| `JWT_SECRET`         | Yes      | Secret used to sign JWTs — keep this long and random             |
| `JWT_EXPIRES_IN`     | No       | Token lifetime (default: `7d`)                                   |
| `BCRYPT_SALT_ROUNDS` | No       | bcrypt cost factor (default: `10`; use `1` in tests)             |

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create the PostgreSQL database

Run the provided setup script (requires `psql` to be available):

```bash
chmod +x scripts/db-setup.sh
./scripts/db-setup.sh
```

This script creates the PostgreSQL role and database, and grants the permissions required on PostgreSQL 15+ (where `CREATE` on the public schema is no longer granted by default).

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed the database

```bash
npm run db:seed
```

### 6. Start the dev server

```bash
npm run dev
```

---

## Available Scripts

| Script                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `npm run dev`             | Start dev server with hot-reload (ts-node-dev) |
| `npm run build`           | Compile TypeScript to `dist/`                  |
| `npm start`               | Run compiled server from `dist/`               |
| `npm test`                | Run all tests (--runInBand --forceExit)        |
| `npm run test:watch`      | Run tests in watch mode                        |
| `npm run db:migrate`      | Run pending migrations                         |
| `npm run db:migrate:undo` | Undo the last migration                        |
| `npm run db:seed`         | Seed roles and default users                   |
| `npm run db:setup`        | Migrate + seed in one command                  |

---

## Running Tests

Tests use the same PostgreSQL database configured in `.env`. The test runner overrides `BCRYPT_SALT_ROUNDS=1` automatically for speed.

```bash
npm test
```

All tests run sequentially (`--runInBand`) to avoid race conditions on shared database state. Expected output: **79 tests passing** across 6 test files.

---

## Default Seeded Credentials

| Role     | Email              | Password     |
| -------- | ------------------ | ------------ |
| Admin    | 1                  | Admin@123    |
| Provider | provider@ndova.com | Provider@123 |
| Client   | client@ndova.com   | Client@123   |

---

## User Roles and Permissions

| Action                           | CLIENT   | PROVIDER      | ADMIN |
| -------------------------------- | -------- | ------------- | ----- |
| Register / Login                 | ✅       | ✅            | ✅    |
| View own profile                 | ✅       | ✅            | ✅    |
| List all users                   | ❌       | ❌            | ✅    |
| Get any user by ID               | ❌       | ❌            | ✅    |
| Update user                      | ❌       | ❌            | ✅    |
| Delete user                      | ❌       | ❌            | ✅    |
| Assign roles                     | ❌       | ❌            | ✅    |
| List services                    | ✅       | ✅            | ✅    |
| Create / update / delete service | ❌       | ❌            | ✅    |
| Create appointment               | ✅       | ❌            | ❌    |
| View own appointments            | ✅       | ✅            | ✅    |
| View all appointments            | ❌       | ❌            | ✅    |
| Approve / reject appointment     | ❌       | ✅ (assigned) | ✅    |
| Cancel appointment               | ✅ (own) | ✅ (assigned) | ✅    |
| Complete appointment             | ❌       | ✅ (assigned) | ✅    |
| Client dashboard                 | ✅       | ❌            | ❌    |
| Provider dashboard               | ❌       | ✅            | ❌    |
| Admin dashboard                  | ❌       | ❌            | ✅    |

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Health

| Method | Path      | Auth | Description         |
| ------ | --------- | ---- | ------------------- |
| GET    | `/health` | None | Server health check |

### Auth

| Method | Path             | Auth       | Description              |
| ------ | ---------------- | ---------- | ------------------------ |
| POST   | `/auth/register` | None       | Register a new user      |
| POST   | `/auth/login`    | None       | Login and receive JWT    |
| GET    | `/auth/me`       | Bearer JWT | Get current user profile |

**Register body:**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "Secret@123",
  "role": "CLIENT"
}
```

**Login body:**

```json
{ "email": "jane@example.com", "password": "Secret@123" }
```

### Users

| Method | Path                       | Auth  | Description           |
| ------ | -------------------------- | ----- | --------------------- |
| GET    | `/users`                   | ADMIN | List all users        |
| GET    | `/users/:id`               | ADMIN | Get user by ID        |
| PUT    | `/users/:id`               | ADMIN | Update user           |
| DELETE | `/users/:id`               | ADMIN | Delete user           |
| POST   | `/users/:id/roles`         | ADMIN | Assign role to user   |
| DELETE | `/users/:id/roles/:roleId` | ADMIN | Remove role from user |

### Roles

| Method | Path     | Auth  | Description    |
| ------ | -------- | ----- | -------------- |
| GET    | `/roles` | ADMIN | List all roles |

### Services

| Method | Path            | Auth     | Description                               |
| ------ | --------------- | -------- | ----------------------------------------- |
| GET    | `/services`     | Any auth | List active services                      |
| GET    | `/services/:id` | Any auth | Get service by ID                         |
| POST   | `/services`     | ADMIN    | Create service                            |
| PUT    | `/services/:id` | ADMIN    | Update service                            |
| DELETE | `/services/:id` | ADMIN    | Soft-delete service (sets isActive=false) |

**Create/Update service body:**

```json
{
  "name": "Hair Cut",
  "description": "Standard haircut",
  "durationMinutes": 30,
  "price": 25.0
}
```

### Appointments

| Method | Path                         | Auth                    | Description                     |
| ------ | ---------------------------- | ----------------------- | ------------------------------- |
| POST   | `/appointments`              | CLIENT                  | Request a new appointment       |
| GET    | `/appointments`              | Any auth                | List appointments (role-scoped) |
| GET    | `/appointments/:id`          | Any auth                | Get appointment details         |
| PATCH  | `/appointments/:id/approve`  | PROVIDER, ADMIN         | Approve a pending appointment   |
| PATCH  | `/appointments/:id/reject`   | PROVIDER, ADMIN         | Reject a pending appointment    |
| PATCH  | `/appointments/:id/cancel`   | CLIENT, PROVIDER, ADMIN | Cancel an appointment           |
| PATCH  | `/appointments/:id/complete` | PROVIDER, ADMIN         | Mark appointment as completed   |

**Create appointment body:**

```json
{
  "serviceId": "uuid",
  "providerId": "uuid",
  "scheduledAt": "2025-12-01T10:00:00Z",
  "notes": "Optional notes"
}
```

**Appointment status transitions:**

```
PENDING  → APPROVED   (by PROVIDER or ADMIN)
PENDING  → REJECTED   (by PROVIDER or ADMIN)
PENDING  → CANCELLED  (by CLIENT, PROVIDER, or ADMIN)
APPROVED → COMPLETED  (by PROVIDER or ADMIN)
APPROVED → CANCELLED  (by CLIENT, PROVIDER, or ADMIN)
```

### Dashboard

| Method | Path                  | Auth     | Description                               |
| ------ | --------------------- | -------- | ----------------------------------------- |
| GET    | `/dashboard/client`   | CLIENT   | Client's appointment summary + recent 5   |
| GET    | `/dashboard/provider` | PROVIDER | Provider's appointment summary + recent 5 |
| GET    | `/dashboard/admin`    | ADMIN    | Platform-wide stats                       |

**Admin dashboard response shape:**

```json
{
  "users": { "total": 10, "clients": 7, "providers": 2 },
  "services": { "total": 4 },
  "appointments": {
    "total": 25,
    "pending": 5,
    "approved": 8,
    "rejected": 2,
    "cancelled": 3,
    "completed": 7
  },
  "recentAppointments": [ ... ]
}
```

---

## Response Format

All endpoints return a consistent JSON envelope:

**Success:**

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [ ... ]
}
```

---

## Notes for Frontend Integration

1. **Base URL**: All requests go to `http://localhost:5000/api` (or whatever `PORT` is set to).

2. **Authentication**: After login/register, store the `data.token` JWT and attach it as `Authorization: Bearer <token>` on every protected request.

3. **Role detection**: The `/auth/me` response includes a `roles` array (e.g. `["CLIENT"]`). Use this to conditionally render role-specific UI.

4. **Appointment flow**:
   - CLIENT creates → status starts as `PENDING`
   - Frontend should poll or use a notification mechanism — status can change to `APPROVED`, `REJECTED`, or `CANCELLED`
   - Once `APPROVED`, a PROVIDER can mark it `COMPLETED`

5. **Services list**: Fetch `/api/services` (requires any valid JWT) to populate service dropdowns in the booking form.

6. **Provider list**: Use `/api/users` (ADMIN only) or expose a dedicated `/api/providers` endpoint if the frontend needs a public list of providers for the booking form.

7. **Error handling**: All error responses have consistent `success: false` + `message`. HTTP status codes follow REST conventions: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict.

8. **Frontend location**: Place the React/Next.js frontend in the sibling `/frontend` directory at the project root.
