# MyVenue Backend

Node.js + Express REST API for venue management with separate **public** and **admin** APIs.

## Setup

```bash
npm install
cp .env.example .env   # then set DATABASE_URL
npm run db:push
npm run dev
```

Server runs at `http://localhost:3000`.

## API Overview

### Public API (read-only, active venues)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/venues` | List active venues (`?search=name`) |
| GET | `/api/public/venues/:id` | Get active venue details |

### Admin API (full management)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/venues` | List all venues (`?search=name`) |
| GET | `/api/admin/venues/:id` | Get venue details |
| POST | `/api/admin/venues` | Create venue |
| PUT | `/api/admin/venues/:id` | Update venue |
| DELETE | `/api/admin/venues/:id` | Delete venue |
| GET | `/api/admin/audit-logs` | View audit history |
| GET | `/api/admin/dashboard` | Dashboard statistics |

### Request / Response Examples

**Create venue (admin)**

```json
POST /api/admin/venues
{
  "name": "Grand Hall",
  "address": "123 Main St, Sydney",
  "description": "Large event space",
  "status": "active"
}
```

**Dashboard response**

```json
{
  "success": true,
  "data": {
    "totalVenues": 10,
    "activeVenues": 7,
    "inactiveVenues": 3
  }
}
```

**Audit log entry (auto-created on create/update/delete)**

```json
{
  "actionType": "created",
  "venueName": "Grand Hall",
  "venueId": 1,
  "timestamp": "2026-06-18T10:00:00.000Z"
}
```

## Error Handling

- `400` — validation failures, invalid ID
- `404` — venue or route not found
- `409` — duplicate record
- `500` — unexpected server error
- `503` — database unavailable

## Tech Stack

- Node.js, Express
- PostgreSQL (Neon) with **Prisma ORM**
- JavaScript (no TypeScript)

## Database (Prisma)

```bash
npm run db:push      # sync schema to database
npm run db:generate  # regenerate Prisma client
npm run db:studio    # open Prisma Studio GUI
```
