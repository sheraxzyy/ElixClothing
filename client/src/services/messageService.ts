import api from './api';
import { CustomerMessage } from '../types';

const STORAGE_KEY = 'shexz_customer_messages';

const INITIAL_DEMO_MESSAGES: CustomerMessage[] = [
  {
    id: 'msg_demo_01',
    name: 'Kavinda Perera',
    email: 'kavinda.p@gmail.com',
    phone: '+94 77 345 6789',
    inquiryType: 'Size & Fit Advice',
    orderNumber: '',
    message: "Hi team, I am 5'11 and prefer a relaxed streetwear drape for the 220 GSM heavyweight tee. Should I go with size L or XL for an oversized boxy silhouette?",
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg_demo_02',
    name: 'Sanduni De Silva',
    email: 'sanduni.desilva@yahoo.com',
    phone: '+94 71 890 1234',
    inquiryType: 'Order Support',
    orderNumber: 'ELX-84920',
    message: 'Could you verify if my order #ELX-84920 has been handed over to Domex Courier? Looking forward to receiving the oversized black tee before Friday.',
    status: 'unread',
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'msg_demo_03',
    name: 'Nadeem Farook',
    email: 'nadeem@urbanlk.com',
    phone: '+94 70 555 4321',
    inquiryType: 'Wholesale / Bulk',
    orderNumber: '',
    message: 'We are interested in stocking SheXz Colombo streetwear at our flagship boutique in Colombo 07. Do you provide wholesale catalogues and tiered volume pricing?',
    status: 'read',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
  },
];

const getStoredMessages = (): CustomerMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_MESSAGES));
      return INITIAL_DEMO_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_MESSAGES;
  } catch {
    return INITIAL_DEMO_MESSAGES;
  }
};

const saveStoredMessages = (messages: CustomerMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to save messages to localStorage', err);
  }
};

export const getMessages = async (): Promise<CustomerMessage[]> => {
  try {
    const res = await api.get('/messages');
    if (Array.isArray(res.data)) {
      saveStoredMessages(res.data);
      return res.data;
    }
  } catch (err) {
    console.warn('API /messages unavailable, falling back to local store:', err);
  }
  return getStoredMessages();
};

export const sendMessage = async (
  payload: Omit<CustomerMessage, 'id' | 'createdAt' | 'status'>
): Promise<CustomerMessage> => {
  const localNewMsg: CustomerMessage = {
    ...payload,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    status: 'unread',
  };

  // Attempt backend dispatch
  try {
    const res = await api.post('/messages', payload);
    if (res.data && res.data.id) {
      const current = getStoredMessages();
      const updated = [res.data, ...current.filter((m) => m.id !== res.data.id)];
      saveStoredMessages(updated);
      return res.data;
    }
  } catch (err) {
    console.warn('Failed to dispatch message to server, saved locally:', err);
  }

  // Fallback to local storage
  const current = getStoredMessages();
  const updated = [localNewMsg, ...current];
  saveStoredMessages(updated);
  return localNewMsg;
};

export const updateMessageStatus = async (
  id: string,
  status: 'unread' | 'read' | 'replied'
): Promise<CustomerMessage | null> => {
  try {
    const res = await api.patch(`/messages/${id}`, { status });
    if (res.data) {
      const current = getStoredMessages();
      const updated = current.map((m) => (m.id === id ? { ...m, status } : m));
      saveStoredMessages(updated);
      return res.data;
    }
  } catch {
    // Local fallback
  }

  const current = getStoredMessages();
  let updatedMsg: CustomerMessage | null = null;
  const updated = current.map((m) => {
    if (m.id === id) {
      updatedMsg = { ...m, status };
      return updatedMsg;
    }
    return m;
  });
  saveStoredMessages(updated);
  return updatedMsg;
};

export const deleteMessage = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/messages/${id}`);
  } catch {
    // Local fallback
  }

  const current = getStoredMessages();
  const updated = current.filter((m) => m.id !== id);
  saveStoredMessages(updated);
  return true;
};
