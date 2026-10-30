import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

const INITIAL_SEED_MESSAGES = [
  {
    name: 'Kavinda Perera',
    email: 'kavinda.p@gmail.com',
    phone: '+94 77 345 6789',
    inquiryType: 'Size & Fit Advice',
    orderNumber: '',
    message: "Hi team, I am 5'11 and prefer a relaxed streetwear drape for the 220 GSM heavyweight tee. Should I go with size L or XL for an oversized boxy silhouette?",
    status: 'read',
  },
  {
    name: 'Sanduni De Silva',
    email: 'sanduni.desilva@yahoo.com',
    phone: '+94 71 890 1234',
    inquiryType: 'Order Support',
    orderNumber: 'ELX-84920',
    message: 'Could you verify if my order #ELX-84920 has been handed over to Domex Courier? Looking forward to receiving the oversized black tee before Friday.',
    status: 'read',
  },
  {
    name: 'Nadeem Farook',
    email: 'nadeem@urbanlk.com',
    phone: '+94 70 555 4321',
    inquiryType: 'Wholesale / Bulk',
    orderNumber: '',
    message: 'We are interested in stocking SheXz Colombo streetwear at our flagship boutique in Colombo 07. Do you provide wholesale catalogues and tiered volume pricing?',
    status: 'read',
  },
];

// In-memory fallback if DB is unreachable
let inMemoryFallback = [];

// Seed initial messages into DB if empty
const seedInitialMessagesIfEmpty = async () => {
  try {
    const count = await prisma.message.count();
    if (count === 0) {
      for (const msg of INITIAL_SEED_MESSAGES) {
        await prisma.message.create({
          data: {
            id: 'msg_seed_' + Math.random().toString(36).substring(2, 9),
            ...msg,
          },
        });
      }
    }
  } catch (err) {
    console.warn('Could not auto-seed messages into DB:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/messages (Public — from Contact page)
// ─────────────────────────────────────────────────────────────────────────────
export const createMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, inquiryType, orderNumber, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required.');
  }

  const generatedId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload = {
    id: generatedId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    inquiryType: (inquiryType || 'General Inquiry').trim(),
    orderNumber: (orderNumber || '').trim(),
    message: message.trim(),
    status: 'unread',
  };

  try {
    const newMessage = await prisma.message.create({
      data: payload,
    });
    return res.status(201).json(newMessage);
  } catch (dbErr) {
    console.error('Failed to save message to PostgreSQL, saving to memory fallback:', dbErr.message);
    const fallbackMessage = {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryFallback.unshift(fallbackMessage);
    return res.status(201).json(fallbackMessage);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/messages (Admin view)
// ─────────────────────────────────────────────────────────────────────────────
export const getMessages = asyncHandler(async (_req, res) => {
  try {
    await seedInitialMessagesIfEmpty();
    const dbMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (inMemoryFallback.length > 0) {
      const dbIds = new Set(dbMessages.map((m) => m.id));
      const combined = [...dbMessages, ...inMemoryFallback.filter((m) => !dbIds.has(m.id))];
      return res.json(combined);
    }

    return res.json(dbMessages);
  } catch (dbErr) {
    console.warn('Prisma message fetch failed, using fallback:', dbErr.message);
    if (inMemoryFallback.length === 0) {
      return res.json(
        INITIAL_SEED_MESSAGES.map((m, idx) => ({
          id: `seed_msg_${idx + 1}`,
          ...m,
          createdAt: new Date().toISOString(),
        }))
      );
    }
    return res.json(inMemoryFallback);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/messages/:id (Update status e.g. read, unread, replied)
// ─────────────────────────────────────────────────────────────────────────────
export const updateMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.message.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return res.json(updated);
  } catch (dbErr) {
    const found = inMemoryFallback.find((m) => m.id === id);
    if (found) {
      found.status = status;
      found.updatedAt = new Date().toISOString();
      return res.json(found);
    }
    res.status(404);
    throw new Error('Message not found.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/messages/:id (Delete message)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.message.delete({
      where: { id },
    });
    return res.json({ message: 'Customer inquiry removed successfully.' });
  } catch (dbErr) {
    const idx = inMemoryFallback.findIndex((m) => m.id === id);
    if (idx !== -1) {
      inMemoryFallback.splice(idx, 1);
      return res.json({ message: 'Customer inquiry removed successfully.' });
    }
    res.status(404);
    throw new Error('Message not found.');
  }
});
