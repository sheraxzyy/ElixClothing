import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

/**
 * protect — verifies JWT and attaches req.user (without password)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Not authorized, token invalid.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id:       true,
      realName: true,
      username: true,
      email:    true,
      role:     true,
      provider: true,
      avatar:   true,
      points:   true,
      isDemo:   true,
      phone:    true,
    },
  });

  if (!user) {
    res.status(401);
    throw new Error('User not found.');
  }

  req.user = user;
  next();
});

/**
 * admin — allows only admin / owner roles (called after protect)
 */
export const admin = (req, res, next) => {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elix.lk').toLowerCase();
  const ownerEmail = (process.env.OWNER_EMAIL || 'sheranadeesha39@gmail.com').toLowerCase();
  const userEmail = (req.user?.email || '').toLowerCase();

  if (
    req.user &&
    (req.user.role === 'admin' ||
      req.user.role === 'owner' ||
      userEmail === adminEmail ||
      userEmail === ownerEmail)
  ) {
    next();
  } else {
    res.status(403);
    throw new Error('Admin or Store Owner access required.');
  }
};

/**
 * optionalProtect — verifies JWT if present and attaches req.user, but does not block if unauthenticated (for guest checkout)
 */
export const optionalProtect = asyncHandler(async (req, _res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:       true,
        realName: true,
        username: true,
        email:    true,
        role:     true,
        provider: true,
        avatar:   true,
        points:   true,
        isDemo:   true,
        phone:    true,
      },
    });
    req.user = user || null;
  } catch {
    req.user = null;
  }

  next();
});

