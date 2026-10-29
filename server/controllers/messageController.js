import asyncHandler from 'express-async-handler';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data folder and messages.json exist
const ensureStorage = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    // Initial sample messages for the ELIX Colombo atelier desk
    const initialMessages = [
      {
        id: 'msg_' + Date.now() + '_1',
        name: 'Kavinda Perera',
        email: 'kavinda.p@gmail.com',
        phone: '+94 77 345 6789',
        inquiryType: 'Size & Fit Advice',
        orderNumber: '',
        message: 'Hi team, I am 5\'11 and prefer a relaxed streetwear drape for the 220 GSM heavyweight tee. Should I go with size L or XL for an oversized boxy silhouette?',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: 'msg_' + Date.now() + '_2',
        name: 'Sanduni De Silva',
        email: 'sanduni.desilva@yahoo.com',
        phone: '+94 71 890 1234',
        inquiryType: 'Order Support',
        orderNumber: 'ELX-84920',
        message: 'Could you verify if my order #ELX-84920 has been handed over to Domex Courier? Looking forward to receiving the oversized black tee before Friday.',
        status: 'unread',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: 'msg_' + Date.now() + '_3',
        name: 'Nadeem Farook',
        email: 'nadeem@urbanlk.com',
        phone: '+94 70 555 4321',
        inquiryType: 'Wholesale / Bulk',
        orderNumber: '',
        message: 'We are interested in stocking ELIX Colombo streetwear at our flagship boutique in Colombo 07. Do you provide wholesale catalogues and tiered volume pricing?',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(initialMessages, null, 2), 'utf8');
  }
};

const readMessages = () => {
  ensureStorage();
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeMessages = (messages) => {
  ensureStorage();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
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

  const messages = readMessages();
  const newMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    inquiryType: (inquiryType || 'General Inquiry').trim(),
    orderNumber: (orderNumber || '').trim(),
    message: message.trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  messages.unshift(newMessage);
  writeMessages(messages);

  res.status(201).json(newMessage);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/messages (Admin view)
// ─────────────────────────────────────────────────────────────────────────────
export const getMessages = asyncHandler(async (_req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/messages/:id (Update status e.g. read, unread, replied)
// ─────────────────────────────────────────────────────────────────────────────
export const updateMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const messages = readMessages();
  const index = messages.findIndex((m) => m.id === id);

  if (index === -1) {
    res.status(404);
    throw new Error('Message not found.');
  }

  if (status) {
    messages[index].status = status;
  }
  messages[index].updatedAt = new Date().toISOString();

  writeMessages(messages);
  res.json(messages[index]);
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/messages/:id (Delete message)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const messages = readMessages();
  const filtered = messages.filter((m) => m.id !== id);

  if (filtered.length === messages.length) {
    res.status(404);
    throw new Error('Message not found.');
  }

  writeMessages(filtered);
  res.json({ message: 'Customer inquiry removed successfully.' });
});
