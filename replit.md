# CLAWD - Personal AI Agent Setup Service

## Overview

CLAWD is a full-stack web application that serves as a landing page and service platform for setting up personal AI agents (Clawd Bot) using OpenClaw, ClawHub skills, and the Moltbook ecosystem. The app offers two tiers: a self-setup guide ($199) and a VIP 1-on-1 session ($799). It includes crypto payment processing (Ethereum), appointment booking for VIP sessions, and an admin dashboard for managing bookings and payments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite with HMR support
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state
- **UI Library**: shadcn/ui (new-york style) with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark theme by default)
- **Animations**: Framer Motion for page transitions and UI animations, plus custom canvas-based particle effects
- **Key Pages**:
  - `/` — Landing page with features, pricing tiers
  - `/payment/:tier` — Crypto payment flow (self or vip tier)
  - `/booking` — Appointment booking calendar for VIP sessions
  - `/guide` — Step-by-step self-setup guide
  - `/admin` — PIN-protected admin dashboard

### Backend
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript, executed via `tsx`
- **API Pattern**: RESTful JSON API under `/api/*`
- **Key Endpoints**:
  - `POST /api/payments` — Record crypto payment with transaction hash
  - `GET /api/bookings` — List all bookings
  - `POST /api/bookings` — Create a booking (with conflict detection)
  - `POST /api/admin/login` — PIN-based admin authentication
  - `GET /api/admin/bookings` — Admin view of bookings
  - `DELETE /api/admin/bookings/:id` — Delete a booking
- **Dev/Prod Serving**: In development, Vite middleware serves the frontend with HMR. In production, static files are served from `dist/public`.

### Database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation
- **Connection**: `node-postgres` (pg) pool via `DATABASE_URL` environment variable
- **Schema** (in `shared/schema.ts`):
  - `users` — id (UUID), username (unique), password
  - `payments` — id (UUID), txHash, tier, amount, verified, createdAt
  - `bookings` — id (UUID), paymentId, name, email, instagram, phone, date, hour, status, createdAt
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)

### Storage Layer
- `server/storage.ts` defines an `IStorage` interface with a `DatabaseStorage` implementation
- This abstraction layer sits between routes and the database, making it easy to swap implementations

### Authentication
- Admin access is protected by a simple PIN code (`ADMIN_PIN` environment variable, defaults to "4455")
- No user authentication system is currently active (users table exists but isn't used for auth flows)

### Build System
- **Development**: `tsx server/index.ts` runs the server with TypeScript support
- **Production Build**: Custom `script/build.ts` that runs Vite build for the client and esbuild for the server, outputting to `dist/`
- **Server bundling**: Selected dependencies are bundled (allowlisted) to reduce cold start times; others are kept external

### Path Aliases
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets` → `attached_assets/`

## External Dependencies

### Required Services
- **PostgreSQL**: Database, connected via `DATABASE_URL` environment variable. Must be provisioned before the app starts.

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `ADMIN_PIN` — PIN for admin dashboard access (optional, defaults to "4455")

### Key NPM Packages
- **Frontend**: React, Wouter, TanStack React Query, Framer Motion, shadcn/ui, Radix UI, Tailwind CSS, react-icons
- **Backend**: Express 5, Drizzle ORM, pg, Zod, connect-pg-simple
- **Build**: Vite, esbuild, tsx
- **Replit-specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`

### Payment Integration
- Cryptocurrency payments (Ethereum) — users send ETH to a hardcoded wallet address and submit their transaction hash for verification. No third-party payment processor API is integrated; verification is manual/admin-based.