import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['error', 'warn']
    : ['error'],
});

// Verify DB connectivity asynchronously without killing the process
prisma
  .$connect()
  .then(() => {
    console.log('✅ PostgreSQL connected successfully via Prisma');
  })
  .catch((err) => {
    console.error('⚠️ PostgreSQL connection failed on startup:', err.message);
    console.error('👉 Ensure your VPS PostgreSQL is running and DATABASE_URL in server/.env is valid.');
  });

export default prisma;