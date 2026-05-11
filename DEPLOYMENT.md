# Deployment Guide

## Infrastructure Architecture
- **Frontend:** Vercel
  - *Why:* Highly cost-effective for Next.js, providing built-in optimizations, edge caching, and seamless GitHub integrations.
- **Backend:** Render (or AWS ECS for scaling later)
  - *Why:* Render offers cost-effective Web Services with automatic deployments from Git, perfect for Node/NestJS APIs.
- **Database:** Supabase or Neon DB (Managed PostgreSQL)
  - *Why:* Cost-effective, serverless database solutions that integrate perfectly with Prisma and scale automatically.

## CI/CD Pipeline
- **Provider:** GitHub Actions
- **Workflow Steps:**
  1. **Linting:** Run Prettier and ESLint. Fail the build if formatting or strict rules are violated.
  2. **Static Analysis:** Run SonarQube analysis to detect code smells and vulnerabilities.
  3. **Testing:** Run the full Jest test suite.
  4. **Build:** Compile the Next.js and NestJS artifacts.
  5. **Deployment:** If tests pass on the `main` branch, trigger deployment webhooks to Vercel and Render.

## Environment Setup
### Local Development
- Connects to a local PostgreSQL instance.
- Uses `NODE_ENV=development`.

### Staging Environment
- Connected to `staging-db`. 
- Auto-deploys when PRs are merged into the `develop` branch.
- Used for QA and UI/UX validation.

### Production Environment
- Connected to `prod-db`.
- Auto-deploys when code is merged into the `main` branch.
- Requires strict passing of all CI/CD checks before deployment.
