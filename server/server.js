import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env in server directory is always loaded
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize DB connection
import './config/db.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

app.use(express.json());

// Allow the Vite dev server locally and production domains
const STATIC_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://shexzclothing.sheraxzy.com',
  'https://elixclothing.sheraxzy.com',
  'https://shexzclothing.vercel.app',
  'https://elixclothing.vercel.app',
];

const envClientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

const ALLOWED_ORIGINS = [...new Set([...STATIC_ALLOWED_ORIGINS, ...envClientUrls])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Check explicit allowed origins or wildcard matching for sheraxzy.com and vercel.app domains
      const isAllowed =
        ALLOWED_ORIGINS.includes(normalizedOrigin) ||
        /^https:\/\/([a-z0-9-]+\.)*sheraxzy\.com$/i.test(normalizedOrigin) ||
        /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.get('/', (_req, res) => {
  res.json({ message: 'SheXz API is running with PostgreSQL & Prisma.' });
});

// ── Keep-alive / health check (hit by Vercel cron every 5 min) ───────────────
app.get('/api/health', async (_req, res) => {
  try {
    const { default: prisma } = await import('./config/db.js');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'unreachable', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Centralized error handler with specific PostgreSQL / Prisma error translations
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);

  let status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Server error occurred.';

  // Prisma unique constraint violation (e.g. email or username or slug taken)
  if (err.code === 'P2002') {
    status = 400;
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `A record with this ${target} already exists in the database.`;
  }
  // Prisma connection / initialization error (DB down or invalid connection string)
  else if (err.name === 'PrismaClientInitializationError' || err.code === 'P1001' || err.code === 'P1002') {
    status = 503;
    message = 'Unable to connect to PostgreSQL database. Please check your VPS connection and DATABASE_URL in server/.env.';
  }
  // Prisma record not found for update/delete
  else if (err.code === 'P2025') {
    status = 404;
    message = 'Requested record was not found in database.';
  }

  res.status(status).json({
    message,
    errorType: err.name || 'Error',
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SheXz Server running on port ${PORT}`);
  });
}

export default app;
