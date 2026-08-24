import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

const RESERVED_EMAILS = [
  (process.env.OWNER_EMAIL || 'sheranadeesha39@gmail.com').toLowerCase(),
  (process.env.ADMIN_EMAIL || 'admin@elix.lk').toLowerCase(),
];

const safeUserSelect = {
  id:        true,
  realName:  true,
  username:  true,
  email:     true,
  role:      true,
  provider:  true,
  avatar:    true,
  points:    true,
  isDemo:    true,
  phone:     true,
  createdAt: true,
  addresses: true,
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/users   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select:  safeUserSelect,
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/users/:id   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.params.id },
    select: safeUserSelect,
  });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  res.json(user);
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/users/:id   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const isMasterUser =
    RESERVED_EMAILS.includes(user.email) || user.role === 'owner';

  const { realName, username, email, phone, role } = req.body;

  const data = {};
  if (realName) data.realName = realName;
  if (phone)    data.phone    = phone;

  // Protected fields — cannot change on master accounts
  if (!isMasterUser) {
    if (email)    data.email    = email.trim().toLowerCase();
    if (username) data.username = username.trim().toLowerCase().replace(/\s+/g, '_');
    if (role)     data.role     = role;
  }

  const updated = await prisma.user.update({
    where:  { id },
    data,
    select: safeUserSelect,
  });

  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/users   (admin only — creates a user without self-registration)
// ─────────────────────────────────────────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const { realName, username, email, password, role, phone } = req.body;
  const cleanEmail    = (email || '').trim().toLowerCase();
  const cleanUsername = (username || '').trim().toLowerCase().replace(/\s+/g, '_');

  if (RESERVED_EMAILS.includes(cleanEmail)) {
    res.status(400);
    throw new Error('Store Owner and Admin accounts are reserved.');
  }

  const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (emailExists) {
    res.status(400);
    throw new Error('User with this email already exists.');
  }

  const usernameExists = await prisma.user.findUnique({ where: { username: cleanUsername } });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already taken.');
  }

  const safeRole =
    role === 'owner' || role === 'admin' ? 'customer' : (role || 'customer');

  const user = await prisma.user.create({
    data: {
      realName: realName || 'User',
      username:  cleanUsername,
      email:     cleanEmail,
      password,
      role:      safeRole,
      phone:     phone || null,
    },
    select: safeUserSelect,
  });

  res.status(201).json(user);
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/users/:id   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (RESERVED_EMAILS.includes(user.email) || user.role === 'owner') {
    res.status(403);
    throw new Error('Store Owner and Admin accounts cannot be deleted.');
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted successfully.' });
});
