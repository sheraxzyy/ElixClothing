import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// ─── Reserved admin e-mails (cannot register via public endpoint) ─────────────
const RESERVED_EMAILS = [
  (process.env.OWNER_EMAIL || 'sheranadeesha39@gmail.com').toLowerCase(),
  (process.env.ADMIN_EMAIL || 'admin@elix.lk').toLowerCase(),
];

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/register
//  Body: { realName, username, email, password, repeatPassword }
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { realName, username, email, password, repeatPassword } = req.body;

  // ── field validation ──────────────────────────────────────────────────────
  if (!realName || !username || !email || !password || !repeatPassword) {
    res.status(400);
    throw new Error('All fields are required: realName, username, email, password, repeatPassword.');
  }

  if (password !== repeatPassword) {
    res.status(400);
    throw new Error('Passwords do not match.');
  }

  if (password.length < 4) {
    res.status(400);
    throw new Error('Password must be at least 4 characters.');
  }

  const cleanEmail    = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');

  // ── reserved account guard ────────────────────────────────────────────────
  if (RESERVED_EMAILS.includes(cleanEmail)) {
    res.status(400);
    throw new Error('This email address is reserved and cannot be registered.');
  }

  // ── uniqueness checks ─────────────────────────────────────────────────────
  const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already registered.');
  }

  const usernameExists = await prisma.user.findUnique({ where: { username: cleanUsername } });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already taken.');
  }

  // ── create user ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      realName,
      username:  cleanUsername,
      email:     cleanEmail,
      password:  hashedPassword,
      role:      'customer',
      provider:  'email',
    },
  });

  res.status(201).json({
    id:       user.id,
    realName: user.realName,
    username: user.username,
    email:    user.email,
    role:     user.role,
    token:    generateToken(user.id),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
//  Body: { emailOrUsername, password }
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    res.status(400);
    throw new Error('Email/username and password are required.');
  }

  const identifier = emailOrUsername.trim().toLowerCase();

  // Find by email OR by username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email:    identifier },
        { username: identifier },
      ],
    },
  });

  if (!user || !user.password) {
    res.status(401);
    throw new Error('Invalid credentials.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401);
    throw new Error('Invalid credentials.');
  }

  res.json({
    id:       user.id,
    realName: user.realName,
    username: user.username,
    email:    user.email,
    role:     user.role,
    avatar:   user.avatar,
    points:   user.points,
    token:    generateToken(user.id),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/oauth
//  Body: { name, email, provider, avatar }
// ─────────────────────────────────────────────────────────────────────────────
export const oauthLoginOrRegister = asyncHandler(async (req, res) => {
  const { name, email, provider, avatar } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required for social login.');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (RESERVED_EMAILS.includes(cleanEmail)) {
    res.status(403);
    throw new Error(
      'Store Owner and Admin accounts cannot be accessed via OAuth. ' +
      'Sign in with your email and password.'
    );
  }

  let user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  if (user) {
    // Update provider / avatar if missing
    const updates = {};
    if (provider && user.provider === 'email') updates.provider = provider;
    if (avatar && !user.avatar) updates.avatar = avatar;

    if (Object.keys(updates).length) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }
  } else {
    // Derive a unique username from email prefix
    const baseUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '_');
    let   finalUsername = baseUsername;
    let   attempt = 0;

    while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
      attempt++;
      finalUsername = `${baseUsername}_${attempt}`;
    }

    user = await prisma.user.create({
      data: {
        realName: name || `${provider || 'OAuth'} User`,
        username: finalUsername,
        email:    cleanEmail,
        provider: provider || 'google',
        avatar:   avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        role:   'customer',
        points: 250,
        isDemo: false,
      },
    });
  }

  res.json({
    id:       user.id,
    realName: user.realName,
    username: user.username,
    email:    user.email,
    role:     user.role,
    provider: user.provider,
    avatar:   user.avatar,
    points:   user.points,
    token:    generateToken(user.id),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
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
    },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json(user);
});
