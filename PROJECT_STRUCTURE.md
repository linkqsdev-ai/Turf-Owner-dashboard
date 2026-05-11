# Project Structure

## Frontend (Next.js)
```text
src/
├── app/               # Next.js App Router (Pages, Layouts, API routes)
├── components/        # Reusable UI components
│   ├── ui/            # Base Shadcn UI components (buttons, inputs)
│   └── shared/        # Shared composite components (Sidebar, TopNav)
├── lib/               # Utility functions (e.g., Tailwind merge, formatting)
├── hooks/             # Custom React hooks
├── services/          # API client and data fetching functions
├── store/             # Global state (Zustand)
├── types/             # TypeScript interfaces and type definitions
└── styles/            # Global CSS, Typography, and Tailwind configuration
```
*Why this structure?* Separating `ui/` from `shared/` keeps base components atomic and highly reusable, while App Router enables advanced server-side rendering patterns.

## Backend (NestJS / Express)
```text
src/
├── main.ts            # Application entry point
├── app.module.ts      # Root application module
├── auth/              # Authentication module (JWT, Google OAuth strategies)
├── users/             # User management module (Profile, Settings)
├── common/            # Shared guards, interceptors, and exception filters
├── config/            # Environment variable validation and loading
└── prisma/            # Database schema and migration files
```
*Why this structure?* NestJS enforces a modular structure out-of-the-box, ensuring scalable boundaries where individual domains (like `auth` or `users`) are self-contained and maintainable.
