# Linkqs TurfPulse SaaS

Elite facility management for turf owners. Precision engineered with a Mossy Obsidian luxury aesthetic.

## 🚀 Quick Start
1. `npm install`
2. `npm run dev`

## 📖 Documentation
For a complete understanding of features, database schema, and mobile app integration guidelines, please refer to **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

## Typography System
- **Primary (UI/Body):** Inter (Weights: 400, 500, 600)
- **Headings (Brand):** Poppins (Weights: 600, 700)
- **Secondary (Highlights):** Plus Jakarta Sans

## Setup & Integrations

### 1. PostgreSQL Connection String
Update your `.env` file with the database URI. Use Prisma or TypeORM to connect.
```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkqs_db?schema=public"
```

### 2. Google OAuth Authentication
1. Go to Google Cloud Console.
2. Create a new project and configure the OAuth consent screen.
3. Generate Credentials (OAuth client ID) for Web Application.
4. Add authorized redirect URIs.
5. Add to `.env`:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"
```

### 3. Environment Variables (.env)
Create a `.env` file based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL="postgresql://user:password@localhost:5432/linkqs_db"
GOOGLE_CLIENT_ID="..."
```

### 4. API Key Management
Store all secrets securely in `.env`. Do NOT commit `.env` to version control. Use a secret manager (like AWS Secrets Manager or Vercel Environment Variables) for production.

### 5. Required Third-Party Integrations
- **Code Quality:** SonarQube (requires `sonar-project.properties`)
- **Authentication:** Google Cloud Console (OAuth 2.0)
- **Database:** Managed PostgreSQL (e.g., Supabase or Neon)
- **Deployment:** Vercel (Frontend) and Render/AWS (Backend)

## Core Features
- **Branding:** Linkqs prominent, minimal logo & favicon.
- **Authentication:** Seamless Email/Password and Google OAuth.
- **User Profile:** Dedicated page with Notification Toggle.
- **Theming:** Full Dark Mode support without flashes.
- **Code Standards:** Enforced Prettier and SonarQube checks in CI pipeline.
