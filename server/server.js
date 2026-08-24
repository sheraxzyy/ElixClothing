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

const app = express();

app.use(express.json());

// Enable flexible CORS so client can connect from Vite dev server on any port / host
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get('/', (_req, res) => {
  res.json({ message: 'ELIX API is running with PostgreSQL & Prisma.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/users', userRoutes);

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
    console.log(`🚀 ELIX Server running on port ${PORT}`);
  });
}

export default app;
