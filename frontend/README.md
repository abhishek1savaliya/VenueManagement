# MyVenue Frontend

Next.js web app for discovering venues (public) and managing the platform (admin).

## Setup

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, point to the deployed backend:

```env
NEXT_PUBLIC_API_URL=https://venuemanagement.onrender.com
```

Start the backend first, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm start      # run production build
```

## Public Routes

| Route | Description |
|-------|-------------|
| `/` | Home — featured venues |
| `/venues` | Browse all venues (search, sort, pagination) |
| `/venues/[id]` | Venue detail (**login required**) |
| `/login` | User sign in |
| `/signup` | User registration |
| `/profile` | User profile, password, photo, account deletion |

### User Features

- Sign up with first name, last name, email, optional phone, and password
- Sign in / sign out
- Edit profile and change password
- Upload optional profile photo
- Delete account (password confirmation required)
- Venue detail pages are protected — unauthenticated users are redirected to login

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin sign in (default: `admin` / `admin`) |
| `/admin` | Dashboard — venue and user stats |
| `/admin/analytics` | Venue funnel, views, searches |
| `/admin/venues` | Venue CRUD |
| `/admin/venues/new` | Create venue |
| `/admin/venues/[id]/edit` | Edit venue |
| `/admin/users` | View, search, activate/deactivate users |
| `/admin/audit-logs` | Venue, user, and general system logs |
| `/admin/settings` | Change admin credentials |

All `/admin/*` routes except `/admin/login` require admin authentication.

### Admin Features

- **Dashboard** — total venues, active/inactive counts, registered users
- **Analytics** — visitor funnel (browse → search → detail view), most viewed venues, most searched venues, top search terms
- **Venues** — full CRUD with photo upload via Supabase
- **Users** — list, search, deactivate/activate accounts
- **Audit Logs** — tabbed view for Venue Logs, User Logs, and General Logs (errors, access denied, downtime)
- **Settings** — change admin ID and password

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin panel
│   ├── login/            # User auth
│   ├── profile/          # User profile
│   └── venues/           # Public venue pages
├── components/
│   ├── layout/           # Headers, sidebars
│   ├── ui/               # shadcn-style UI primitives
│   └── venues/           # Venue-specific components
├── context/              # Auth providers (user + admin)
├── lib/
│   ├── api.js            # API client
│   └── auth.js           # Token storage (localStorage + cookies)
└── middleware.js         # Route protection for /venues/[id] and /admin/*
```

## Route Protection

`middleware.js` enforces:

- `/venues/[id]` — requires user auth cookie; redirects to `/login?redirect=...`
- `/admin/*` (except login) — requires admin auth cookie; redirects to `/admin/login`

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Radix UI** + shadcn-style components
- **lucide-react** icons
- **sonner** toasts

## Connecting to the Backend

The API client in `src/lib/api.js` exports:

- `publicApi` — public venue endpoints
- `authApi` — user authentication (auto-attaches user token)
- `adminApi` — admin endpoints (auto-attaches admin token)

Tokens are stored in `localStorage` and set as cookies for middleware route protection.
