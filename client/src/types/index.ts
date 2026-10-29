export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
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

export interface OrderType {
  id: string;
  userId?: string;
  user?: {
    id?: string;
    realName?: string;
    email: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  deliveryFee: number;
  discountAmount?: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  isPaid?: boolean;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItemType[];
  shippingAddress: ShippingAddressType;
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
