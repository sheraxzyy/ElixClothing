import api from './api';
import { OrderType } from '../types';

const STORAGE_KEY = 'elix_store_orders';

const INITIAL_DEMO_ORDERS: OrderType[] = [
  {
    id: 'ELX-92184',
    userId: 'usr_demo_01',
    user: {
      id: 'usr_demo_01',
      realName: 'Senesh Bandara',
      email: 'senesh.b@gmail.com',
    },
    paymentMethod: 'Cash on Delivery',
    itemsPrice: 7500,
    deliveryFee: 0,
    discountAmount: 0,
    totalPrice: 7500,
    status: 'Pending',
    isPaid: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    orderItems: [
      {
        id: 'item_1',
        name: 'ELIX "REMORSE" Oversized Heavyweight Tee',
        image: '/images/products/remorse-tee.jpg',
        price: 3750,
        quantity: 2,
        size: 'L',
        color: 'Vintage Acid Washed Black',
      },
    ],
    shippingAddress: {
      fullName: 'Senesh Bandara',
      phone: '+94 77 123 9988',
      street: 'No. 42, Havelock Road',
      city: 'Colombo 05',
      postalCode: '00500',
    },
  },
  {
    id: 'ELX-84920',
    userId: 'usr_demo_02',
    user: {
      id: 'usr_demo_02',
      realName: 'Sanduni De Silva',
      email: 'sanduni.desilva@yahoo.com',
    },
    paymentMethod: 'Visa / MasterCard',
    itemsPrice: 4200,
    deliveryFee: 450,
    discountAmount: 200,
    totalPrice: 4450,
    status: 'Processing',
    isPaid: true,
    paidAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    orderItems: [
      {
        id: 'item_2',
        name: 'ELIX "ANOMALY" 220 GSM Cyber Graphic',
        image: '/images/products/anomaly-tee.jpg',
        price: 4200,
        quantity: 1,
        size: 'XL',
        color: 'Pitch Black',
      },
    ],
    shippingAddress: {
      fullName: 'Sanduni De Silva',
      phone: '+94 71 890 1234',
      street: '28/4, Peradeniya Road',
      city: 'Kandy',
      postalCode: '20000',
    },
  },
  {
    id: 'ELX-73105',
    userId: 'usr_demo_03',
    user: {
      id: 'usr_demo_03',
      realName: 'Tariq Mansoor',
      email: 'tariq.m@hotmail.com',
    },
    paymentMethod: 'Mintpay 3x Installments',
    itemsPrice: 11250,
    deliveryFee: 0,
    discountAmount: 500,
    totalPrice: 10750,
    status: 'Delivered',
    isPaid: true,
    paidAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    orderItems: [
      {
        id: 'item_3',
        name: 'ELIX "NOSTALGIA" Boxy Fit Heavyweight Tee',
        image: '/images/products/nostalgia-tee.jpg',
        price: 3750,
        quantity: 1,
        size: 'M',
        color: 'Bone White',
      },
      {
        id: 'item_4',
        name: 'ELIX "CYBERNETIC" Distressed Graphic',
        image: '/images/products/cyber-tee.jpg',
        price: 3750,
        quantity: 2,
        size: 'L',
        color: 'Smoky Grey',
      },
    ],
    shippingAddress: {
      fullName: 'Tariq Mansoor',
      phone: '+94 76 999 1122',
      street: '15/B Beach Road, Mount Lavinia',
      city: 'Dehiwala-Mount Lavinia',
      postalCode: '10370',
    },
  },
];

const getStoredOrders = (): OrderType[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_ORDERS;
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
};

const saveStoredOrders = (orders: OrderType[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage', err);
  }
};

export const getOrders = async (): Promise<OrderType[]> => {
  try {
    const res = await api.get('/orders');
    if (Array.isArray(res.data)) {
      const local = getStoredOrders();
      const demoIds = new Set(['ELX-92184', 'ELX-84920', 'ELX-73105']);

      if (res.data.length > 0) {
        const backendIds = new Set(res.data.map((o: any) => o.id));
        // Keep real backend orders + any unsynced local user orders (excluding demo orders)
        const unSyncedLocal = local.filter((o) => !backendIds.has(o.id) && !demoIds.has(o.id));
        const merged = [...res.data, ...unSyncedLocal];
        saveStoredOrders(merged);
        return merged;
      } else {
        // Backend responded with empty array
        const realLocal = local.filter((o) => !demoIds.has(o.id));
        if (realLocal.length > 0) {
          return realLocal;
        }
        return res.data;
      }
    }
  } catch (err) {
    console.warn('Orders API not accessible, using stored orders:', err);
  }
  return getStoredOrders();
};

export const createOrder = async (orderPayload: {
  orderItems: any[];
  shippingAddress: any;
  paymentMethod?: string;
  itemsPrice: number;
  deliveryFee: number;
  discountAmount?: number;
  totalPrice: number;
  email?: string;
  user?: { id?: string; realName?: string; email: string };
}): Promise<OrderType> => {
  const generatedId = 'ELX-' + Math.floor(10000 + Math.random() * 90000);
  const newOrder: OrderType = {
    id: generatedId,
    userId: orderPayload.user?.id || 'guest',
    user: orderPayload.user,
    paymentMethod: orderPayload.paymentMethod || 'Cash on Delivery',
    itemsPrice: orderPayload.itemsPrice,
    deliveryFee: orderPayload.deliveryFee,
    discountAmount: orderPayload.discountAmount || 0,
    totalPrice: orderPayload.totalPrice,
    status: 'Pending',
    isPaid: orderPayload.paymentMethod !== 'Cash on Delivery',
    createdAt: new Date().toISOString(),
    orderItems: orderPayload.orderItems.map((item) => ({
      id: 'item_' + Math.random().toString(36).substring(2, 7),
      productId: item.productId || item.id,
      name: item.name,
      image: item.image || item.images?.[0] || '/images/products/remorse-tee.jpg',
      price: Number(item.price),
      quantity: Number(item.quantity || 1),
      size: item.size || 'M',
      color: item.color || 'Standard',
    })),
    shippingAddress: orderPayload.shippingAddress,
  };

  try {
    const res = await api.post('/orders', orderPayload);
    if (res.data && res.data.id) {
      const current = getStoredOrders();
      const updated = [res.data, ...current.filter((o) => o.id !== res.data.id)];
      saveStoredOrders(updated);
      return res.data;
    }
  } catch (err) {
    console.warn('Backend order creation deferred, cached locally:', err);
  }

  const current = getStoredOrders();
  const updated = [newOrder, ...current];
  saveStoredOrders(updated);
  return newOrder;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderType['status']
): Promise<OrderType | null> => {
  try {
    const res = await api.put(`/orders/${orderId}/status`, { status });
    if (res.data) {
      const current = getStoredOrders();
      const updated = current.map((o) => (o.id === orderId ? { ...o, status } : o));
      saveStoredOrders(updated);
      return res.data;
    }
  } catch {
    // Local fallback
  }

  const current = getStoredOrders();
  let updatedOrder: OrderType | null = null;
  const updated = current.map((o) => {
    if (o.id === orderId) {
      updatedOrder = { ...o, status, updatedAt: new Date().toISOString() };
      return updatedOrder;
    }
    return o;
  });
  saveStoredOrders(updated);
  return updatedOrder;
};

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  const current = getStoredOrders();
  const updated = current.filter((o) => o.id !== orderId);
  saveStoredOrders(updated);
  return true;
};
