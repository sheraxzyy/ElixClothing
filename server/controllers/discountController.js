import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/discounts   (admin only)
//  Body: { code, type, value, expiryDate, usageLimit?, active?, description? }
// ─────────────────────────────────────────────────────────────────────────────
export const createDiscount = asyncHandler(async (req, res) => {
  const { code, type, value, expiryDate, usageLimit, active, description } =
    req.body;

  if (!code || !type || value == null || !expiryDate) {
    res.status(400);
    throw new Error('Fields code, type, value and expiryDate are required.');
  }

  const existing = await prisma.discount.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (existing) {
    res.status(400);
    throw new Error(`Discount code "${code.toUpperCase()}" already exists.`);
  }

  const discount = await prisma.discount.create({
    data: {
      code:        code.toUpperCase(),
      type,
      value:       Number(value),
      expiryDate:  new Date(expiryDate),
      usageLimit:  usageLimit != null ? Number(usageLimit) : 0,
      active:      active !== false,
      description: description || '',
    },
  });

  res.status(201).json(discount);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/discounts   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const getDiscounts = asyncHandler(async (req, res) => {
  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(discounts);
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/discounts/:id   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const discount = await prisma.discount.findUnique({ where: { id } });
  if (!discount) {
    res.status(404);
    throw new Error('Discount not found.');
  }

  const { code, type, value, expiryDate, usageLimit, active, description } =
    req.body;

  const data = {};
  if (code        !== undefined) data.code        = code.toUpperCase();
  if (type        !== undefined) data.type        = type;
  if (value       !== undefined) data.value       = Number(value);
  if (expiryDate  !== undefined) data.expiryDate  = new Date(expiryDate);
  if (usageLimit  !== undefined) data.usageLimit  = Number(usageLimit);
  if (active      !== undefined) data.active      = Boolean(active);
  if (description !== undefined) data.description = description;

  const updated = await prisma.discount.update({ where: { id }, data });
  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/discounts/:id   (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteDiscount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const discount = await prisma.discount.findUnique({ where: { id } });
  if (!discount) {
    res.status(404);
    throw new Error('Discount not found.');
  }

  await prisma.discount.delete({ where: { id } });
  res.json({ message: 'Discount deleted.' });
});
