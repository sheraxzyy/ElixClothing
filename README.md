# ELIX — Advanced Streetwear E-Commerce Platform

ELIX is a modern, production-grade streetwear clothing e-commerce platform built with React 18, TypeScript, Node.js, Express, PostgreSQL (hosted on Supabase), and Prisma ORM.

---

## 🌟 Core Feature Suite

1. **Live Order Tracking System**
   - 10-status fulfillment workflow (`Order Placed`, `Payment Confirmed`, `Processing`, `Preparing for Shipment`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`, `Delivery Failed`, `Returned`)
   - Interactive visual progress timeline, courier partner details, waybill tracking numbers, estimated delivery schedules, and audit event logs
   - Customer self-service order lookup & admin dispatch console with audit history

2. **ELIX Drop Engine**
   - High-contrast editorial lookbook experience with server-authoritative countdown tickers
   - Three distinct drop sections: **Active Drops**, **Upcoming Drops**, and **Concluded Archive**
   - Concurrency protection & atomic stock allocation on PostgreSQL

3. **Advanced Admin Analytics & Reports**
   - Real-time revenue KPIs: Gross Sales, Net Sales, Average Order Value (AOV), Repeat Customer Rate
   - Interactive date filters: 7 days, 30 days, this month, this year, and custom ranges
   - Category breakdowns: Sales by garment size, color distribution, top-performing streetwear pieces, and inventory alerts
   - Instant CSV financial report exports

4. **Cinematic Experience Mode**
   - Dual-UI rendering engine: **ELIX EXPERIENCE MODE** (3D tactile physics, spotlight effects, particle fields, sound design) vs. **NORMAL MODE** (clean, high-speed, battery-optimized interface)
   - Persistent preference storage across user sessions

5. **Back-In-Stock Waitlist Notifications**
   - Automated restock subscriptions per product size and color variant
   - Duplicate prevention & automated email dispatch queue with fallback logging

6. **Recently Viewed Products Engine**
   - Instant client-side cached browsing history with server PostgreSQL synchronization
   - Strict 10-item cap enforcement with automated pruning
   - Seamless guest-to-customer history merge upon login

---

## 🏗 Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js (ES modules), Express.js, JSON Web Tokens (JWT), Bcrypt
- **Database**: PostgreSQL hosted on **Supabase**
- **ORM**: Prisma ORM 5 with dual-connection architecture:
  - `DATABASE_URL`: Supabase Session Pooler (port 6543)
  - `DIRECT_URL`: Direct Connection (port 5432)
- **Testing**: Node.js ES module test runner covering all 6 feature suites

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL / Supabase account

### 2. Environment Configuration
Copy `.env.example` in `server/` to `server/.env` and update your database credentials:
```bash
cp server/.env.example server/.env
```

### 3. Database Synchronization
```bash
cd server
npm run prisma:generate
npx prisma db push
```

### 4. Run Automated Test Suite
```bash
npm test --prefix server
```
Runs 6 automated suites:
- `orderTracking.test.js`
- `dropSystem.test.js`
- `analytics.test.js`
- `stockNotification.test.js`
- `recentlyViewed.test.js`
- `regression.test.js`

### 5. Start Development
```bash
# Terminal 1: Backend API
cd server && npm run dev

# Terminal 2: Frontend Client
cd client && npm run dev
```

### 6. Production Build
```bash
npm run build --prefix client
```

For deployment, backup, and rollback instructions, refer to [DEPLOYMENT.md](file:///c:/Users/SheRaX/Desktop/ElixWeb/DEPLOYMENT.md).
