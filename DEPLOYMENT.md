# ELIX ADVANCED STREETWEAR PLATFORM – PRODUCTION DEPLOYMENT GUIDE

This document describes the production deployment, database management, backup, rollback, and maintenance procedures for the **ELIX Clothing E-Commerce Platform**.

---

## 1. System Architecture Overview

- **Frontend**: React 18 + Vite + TypeScript (Single Page Application with dual-engine styling: Ultra Cinematic Mode & Standard High-Speed Mode)
- **Backend**: Express.js (Node.js ES modules) REST API
- **Database**: PostgreSQL hosted on **Supabase**
- **ORM**: Prisma ORM with dual-connection pooling architecture

```
                     ┌────────────────────────────────────────┐
                     │          Vite + React Client           │
                     └───────────────────┬────────────────────┘
                                         │ REST API
                                         ▼
                     ┌────────────────────────────────────────┐
                     │          Express Backend API           │
                     └─────────┬────────────────────┬─────────┘
                               │                    │
              Runtime Queries  │                    │ Migrations & DDL
               Port 6543       │                    │ Port 5432
         (Supabase Pooler)     │                    │ (Direct Connection)
                               ▼                    ▼
                     ┌────────────────────────────────────────┐
                     │     PostgreSQL Database (Supabase)     │
                     └────────────────────────────────────────┘
```

---

## 2. Environment Configuration

### Database Credentials (`server/.env`)

| Variable | Connection Type | Port | Usage |
|---|---|---|---|
| `DATABASE_URL` | Supabase Transaction / Session Pooler | `6543` | Runtime application queries (pgbouncer compatible) |
| `DIRECT_URL` | Supabase Direct Connection | `5432` | Prisma CLI migrations, schema push, DDL alters |

### Email Notifications & Security
- `JWT_SECRET`: Minimum 64-character cryptographic string
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: For dispatch confirmation, tracking updates, and restock waitlist notification delivery

---

## 3. Database Migration & Deployment Procedure

> [!IMPORTANT]
> Never run `prisma migrate reset` in production, as it drops all existing tables and data.

### Step 1: Generate Prisma Client
```bash
cd server
npm run prisma:generate
```

### Step 2: Push Schema Updates Safely
```bash
npx prisma db push
```

### Step 3: Run Automated Test Suites
```bash
npm test
```
Verifies all 6 functional suites:
1. Live Order Tracking (10-status workflow)
2. ELIX Drop Release Platform & Atomic Stock Allocation
3. Analytics Engine & Financial KPI Aggregations
4. Back-In-Stock Waitlist System
5. Recently Viewed Products & Cap Enforcer
6. Platform Regression & Existing Data Integrity

---

## 4. Frontend Production Build

```bash
cd client
npm run build
```
Build output is generated into `client/dist/`, ready for static hosting (Cloudflare Pages, Vercel, Netlify, or Nginx).

---

## 5. Backup & Recovery Operations

### Automated Supabase Backups
Supabase performs automated daily backups with Point-In-Time Recovery (PITR) accessible from the Supabase Dashboard.

### Manual Database Snapshot (pg_dump)
To take a manual point-in-time snapshot before running major updates:

```bash
pg_dump "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \
  --format=c \
  --no-owner \
  --no-privileges \
  --file="elix_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Restore Procedure
```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \
  "elix_backup_[TIMESTAMP].dump"
```

---

## 6. Rollback Strategy

1. **Backend Rollback**: If an issue arises after a backend release, restore previous Docker container / git commit:
   ```bash
   git checkout [STABLE_TAG]
   npm install --production
   npm start
   ```
2. **Database Rollback**: Revert specific schema modifications using Prisma migration rollback scripts, or restore the pre-deployment snapshot created via `pg_dump`.
3. **Frontend Rollback**: Re-deploy the previous `dist/` bundle or point reverse proxy to the prior build.

