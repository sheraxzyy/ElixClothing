export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  costPrice?: number;
  originalPrice?: number;
  imageUrl?: string;
  images: string[];
  availableColors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  featured?: boolean;
  bestSeller?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  fabric?: string;
  fit?: string;
  care?: string;
  tags?: string[];
  details?: string[];
}

export interface CartItem {
  id: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  images?: string[];
  category?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  realName?: string;
  username?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  provider?: string;
  avatar?: string;
  points?: number;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface ToastItem {
  id: string;
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'error' | 'cart' | 'warning';
  duration?: number;
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product | CartItem, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

export interface AuthContextType {
  user: User | null;
  usersList: User[];
  loading: boolean;
  error: string | null;
  registeredCount: number;
  isMasterAdmin: boolean;
  login: (credentials: { emailOrUsername?: string; email?: string; username?: string; password?: string; remember?: boolean }) => Promise<User | null>;
  register: (data: { realName: string; name?: string; username: string; email: string; password?: string; repeatPassword?: string; phone?: string; autoLogin?: boolean }) => Promise<User | null>;
  oauthLogin: (data: { name: string; email: string; provider: string; avatar?: string }) => Promise<User | null>;
  logout: () => void;
  refreshUsers: () => Promise<User[]>;
  makeAdmin: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  updateUserRole?: (userId: string, role: string) => Promise<boolean>;
  loginWithAdminKey?: (key: string) => Promise<boolean>;
  adminAddUser?: (userData: any) => Promise<any>;
  adminUpdateUser?: (userId: string, userData: any) => Promise<any>;
  adminDeleteUser?: (userId: string) => Promise<boolean>;
  loadUsersList?: () => Promise<void>;
  setError: (err: string | null) => void;
}

export interface OrderItemType {
  id?: string;
  productId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ShippingAddressType {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
}

export interface OrderTrackingEventType {
  id: string;
  orderId: string;
  status: string;
  description: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  location?: string | null;
  updatedBy?: string;
  timestamp: string;
}

export interface OrderType {
  id: string;
  orderId?: string;
  userId?: string;
  user?: {
    id?: string;
    realName?: string;
    email: string;
    phone?: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  deliveryFee: number;
  discountAmount?: number;
  totalPrice: number;
  status:
    | 'Pending'
    | 'Order Placed'
    | 'Payment Confirmed'
    | 'Confirmed'
    | 'Processing'
    | 'PreparingForShipment'
    | 'Preparing for Shipment'
    | 'Shipped'
    | 'OutForDelivery'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'DeliveryFailed'
    | 'Delivery Failed'
    | 'Returned'
    | string;
  isPaid?: boolean;
  paidAt?: string;
  deliveredAt?: string;
  shippedAt?: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
  trackingEvents?: OrderTrackingEventType[];
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItemType[];
  shippingAddress: ShippingAddressType;
}

export type DropStatus = 'Draft' | 'Scheduled' | 'Upcoming' | 'Live' | 'SoldOut' | 'Ended' | 'Cancelled';

export interface DropProductType {
  id: string;
  dropId: string;
  productId: string;
  exclusiveStock: number;
  dropPrice?: number | null;
  product?: Product;
}

export interface DropType {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner: string;
  scheduledAt: string;
  timezone: string;
  status: DropStatus;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  products: DropProductType[];
}

export interface StockNotificationType {
  id: string;
  userId?: string | null;
  email: string;
  productId: string;
  size: string;
  color?: string | null;
  status: 'active' | 'notified' | 'unsubscribed';
  createdAt: string;
  notifiedAt?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    price: number;
  };
}

export interface RecentlyViewedItem {
  id: string;
  productId: string;
  viewedAt: string;
  product: Product;
}

export interface CustomerMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  orderNumber?: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export type VisualMode = 'normal' | 'ultra';

export interface VisualModeContextType {
  mode: VisualMode;
  isUltra: boolean;
  setMode: (mode: VisualMode) => void;
  toggleMode: () => void;
  triggerCinematicLoader: (durationMs?: number, label?: string) => void;
  isLoaderActive: boolean;
  loaderLabel: string;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  grossSales: number;
  netSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundTotals: number;
  lowStockCount: number;
  repeatCustomerRate: number;
  estimatedProfit: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  charts: {
    revenueByPeriod: { date: string; revenue: number; orders: number }[];
    salesBySize: { size: string; count: number; revenue: number }[];
    salesByColor: { color: string; count: number; revenue: number }[];
    topProducts: { id: string; name: string; unitsSold: number; revenue: number }[];
  };
  inventoryInsights: {
    lowStockProducts: any[];
    outOfStockProducts: any[];
    noSalesProducts: any[];
  };
}
