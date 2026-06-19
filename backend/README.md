# MyVenue Backend

Node.js + Express REST API for venue management with **public**, **user auth**, and **admin** APIs.

## Setup

```bash
npm install
cp .env.example .env   # then fill in all values
npm run db:push
npm run dev
```

Server runs at `http://localhost:5000` locally (configurable via `PORT`).

Production: `https://venuemanagement.onrender.com`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` | Supabase service key for photo storage |
| `JWT_SECRET` | Secret for signing user/admin tokens |

## Scripts

```bash
npm run dev          # start with file watch
npm start            # production start
npm run db:push      # sync Prisma schema to database
npm run db:generate  # regenerate Prisma client
npm run db:studio    # open Prisma Studio GUI
```

## Authentication

JWT bearer tokens (7-day expiry). Send as `Authorization: Bearer <token>`.

**Default admin account** (seeded on first startup):

| Field | Value |
|-------|-------|
| Admin ID | `admin` |
| Password | `admin` |

Admin credentials can be changed via the admin settings API.

## API Overview

### Health

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | — |

### User Auth (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Create account |
| POST | `/signin` | Sign in |
| GET | `/me` | Get current user |
| PUT | `/profile` | Update profile |
| PUT | `/change-password` | Change password |
| DELETE | `/account` | Delete account (password required) |
| POST | `/upload-photo` | Upload profile photo |

### Public API (`/api/public/venues`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List active venues (`?search`, `?page`, `?limit`, `?sort`) |
| GET | `/:id` | Get active venue details |

List and detail requests are tracked for venue analytics.

### Admin Auth (`/api/admin/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin sign in |
| GET | `/me` | Get current admin |
| PUT | `/credentials` | Change admin ID/password |

### Admin API (requires admin token)

**Venues** — `/api/admin/venues`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all venues |
| GET | `/:id` | Get venue |
| POST | `/` | Create venue |
| PUT | `/:id` | Update venue |
| DELETE | `/:id` | Delete venue |
| POST | `/upload-photo` | Upload venue photo |

**Users** — `/api/admin/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Total user count |
| GET | `/` | List/search users |
| PUT | `/:id/deactivate` | Deactivate user |
| PUT | `/:id/activate` | Activate user |

**Dashboard** — `/api/admin/dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Venue and user statistics |

**Analytics** — `/api/admin/analytics`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Funnel, top viewed/searched venues, search terms |

**Audit Logs** — `/api/admin/audit-logs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Paginated logs (`?category=venue\|user\|general`, `?date`, `?page`, `?limit`) |

Audit log categories:

- **venue** — create, update, delete (auto-logged)
- **user** — signup, profile changes, account deletion (auto-logged)
- **general** — errors, access denied, downtime, warnings (auto-logged from error handler)

## Response Format

```json
{
  "success": true,
  "data": { },
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3, "hasMore": true },
  "message": "Optional message"
}
```

## Error Handling

| Status | Meaning |
|--------|---------|
| `400` | Validation failure |
| `401` | Authentication required or invalid token |
| `403` | Account deactivated |
| `404` | Resource or route not found |
| `409` | Duplicate record |
| `500` | Unexpected server error |
| `503` | Database unavailable |

Errors in the `general` audit log category are recorded automatically.

## Tech Stack

- Node.js, Express
- PostgreSQL (Neon) with **Prisma ORM**
- JWT + bcryptjs for authentication
- Supabase Storage for venue and profile photos
- JavaScript (no TypeScript)

## Database Models

| Model | Purpose |
|-------|---------|
| `Venue` | Venue listings with view/search analytics counters |
| `User` | Registered users |
| `Admin` | Admin account |
| `AuditLog` | Venue, user, and general system logs |
| `SiteAnalytics` | Funnel counters (list views, searches, detail views) |
| `VenueSearchLog` | Individual search query records |
