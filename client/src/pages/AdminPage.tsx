import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import * as messageService from '../services/messageService';
import { Product, User, OrderType, CustomerMessage } from '../types';
import {
  Shield,
  Package,
  Users,
  RefreshCw,
  Plus,
  Search,
  Trash2,
  Edit,
  Lock,
  LogOut,
  AlertTriangle,
  Eye,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Printer,
  Copy,
  Check,
  TrendingUp,
  CreditCard,
  Truck,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';

type AdminSection = 'overview' | 'orders' | 'messages' | 'products' | 'users';

const AdminPage: React.FC = () => {
  const {
    user,
    isMasterAdmin,
    usersList = [],
    loadUsersList,
    loginWithAdminKey,
    login,
    logout,
    adminAddUser,
    adminUpdateUser,
    adminDeleteUser,
  } = useAuth();

  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active Admin Section Navigation
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');

  // Admin Auth Gate State
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [adminEmailInput, setAdminEmailInput] = useState<string>('admin@elix.lk');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [authMode, setAuthMode] = useState<'passkey' | 'credentials'>('passkey');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. ORDERS STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch {
      // handled in service
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderType['status']) => {
    setStatusUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      if (updated) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder(updated);
        }
        addToast({
          title: 'Order Status Updated',
          message: `Order #${orderId} marked as "${newStatus}".`,
          type: 'success',
        });
      }
    } catch {
      addToast({
        title: 'Update Error',
        message: 'Failed to update order status.',
        type: 'error',
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to remove order #${orderId}?`)) return;
    try {
      await orderService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (viewingOrder?.id === orderId) setViewingOrder(null);
      addToast({
        title: 'Order Removed',
        message: `Order #${orderId} removed from console.`,
        type: 'info',
      });
    } catch {
      addToast({
        title: 'Error',
        message: 'Could not delete order.',
        type: 'error',
      });
    }
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const query = orderSearch.toLowerCase();
        const matchesQuery =
          o.id.toLowerCase().includes(query) ||
          (o.shippingAddress?.fullName || '').toLowerCase().includes(query) ||
          (o.shippingAddress?.phone || '').toLowerCase().includes(query) ||
          (o.shippingAddress?.city || '').toLowerCase().includes(query) ||
          (o.user?.email || '').toLowerCase().includes(query);

        const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderSearch, orderStatusFilter]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CUSTOMER MESSAGES STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messageSearch, setMessageSearch] = useState<string>('');
  const [messageStatusFilter, setMessageStatusFilter] = useState<string>('ALL');
  const [messageCategoryFilter, setMessageCategoryFilter] = useState<string>('ALL');
  const [viewingMessage, setViewingMessage] = useState<CustomerMessage | null>(null);

  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const data = await messageService.getMessages();
      setMessages(data);
    } catch {
      // handled
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleToggleMessageRead = async (msg: CustomerMessage) => {
    const nextStatus: CustomerMessage['status'] = msg.status === 'unread' ? 'read' : 'unread';
    try {
      const updated = await messageService.updateMessageStatus(msg.id, nextStatus);
      if (updated) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
        if (viewingMessage?.id === msg.id) {
          setViewingMessage(updated);
        }
      }
    } catch {
      // error toast
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Delete this customer inquiry?')) return;
    try {
      await messageService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (viewingMessage?.id === id) setViewingMessage(null);
      addToast({
        title: 'Message Removed',
        message: 'Inquiry has been deleted.',
        type: 'info',
      });
    } catch {
      addToast({
        title: 'Error',
        message: 'Failed to delete message.',
        type: 'error',
      });
    }
  };

  const handleOpenMessage = async (msg: CustomerMessage) => {
    setViewingMessage(msg);
    if (msg.status === 'unread') {
      try {
        const updated = await messageService.updateMessageStatus(msg.id, 'read');
        if (updated) {
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
        }
      } catch {
        // silent
      }
    }
  };

  const filteredMessages = useMemo(() => {
    return messages
      .filter((m) => {
        const query = messageSearch.toLowerCase();
        const matchesQuery =
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          (m.phone || '').toLowerCase().includes(query) ||
          (m.orderNumber || '').toLowerCase().includes(query) ||
          m.message.toLowerCase().includes(query);

        const matchesStatus =
          messageStatusFilter === 'ALL' || m.status === messageStatusFilter;
        const matchesCategory =
          messageCategoryFilter === 'ALL' || m.inquiryType === messageCategoryFilter;

        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, messageSearch, messageStatusFilter, messageCategoryFilter]);

  const unreadMessagesCount = useMemo(() => {
    return messages.filter((m) => m.status === 'unread').length;
  }, [messages]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending').length;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  }, [orders]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. STORE / PRODUCTS STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState({
    imageUrl: '',
    name: '',
    description: '',
    price: '',
    priority: '1',
    category: 'T-Shirts',
    isFeatured: true,
    isBestSeller: false,
  });

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await productService.getProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err: any) {
      setProductsError(err.response?.data?.message || 'Failed to fetch products from database.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin) {
      loadProducts();
      loadOrders();
      loadMessages();
      if (loadUsersList) loadUsersList();
    }
  }, [isMasterAdmin, loadUsersList]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !productForm.imageUrl.trim() ||
      !productForm.name.trim() ||
      !productForm.description.trim() ||
      !productForm.price ||
      !productForm.priority
    ) {
      addToast({
        title: 'Validation Error',
        message: 'Please provide all required fields.',
        type: 'error',
      });
      return;
    }

    try {
      await productService.createProduct({
        imageUrl: productForm.imageUrl.trim(),
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        priority: Number(productForm.priority),
        category: productForm.category || 'T-Shirts',
        isFeatured: Boolean(productForm.isFeatured),
        isBestSeller: Boolean(productForm.isBestSeller),
      });

      addToast({
        title: 'Product Published',
        message: `"${productForm.name}" saved with priority #${productForm.priority}.`,
        type: 'success',
      });

      setIsAddProductModalOpen(false);
      setProductForm({
        imageUrl: '',
        name: '',
        description: '',
        price: '',
        priority: String(products.length + 1),
        category: 'T-Shirts',
        isFeatured: true,
        isBestSeller: false,
      });
      await loadProducts();
    } catch (err: any) {
      addToast({
        title: 'Database Error',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      imageUrl: prod.imageUrl || (prod.images && prod.images[0]?.url) || (prod.images && prod.images[0]) || '',
      name: prod.name || '',
      description: prod.description || '',
      price: String(prod.price || ''),
      priority: String(prod.priority ?? 1),
      category: prod.category || 'T-Shirts',
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await productService.updateProduct(editingProduct.id, {
        imageUrl: productForm.imageUrl.trim(),
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        priority: Number(productForm.priority),
        category: productForm.category,
        isFeatured: productForm.isFeatured,
        isBestSeller: productForm.isBestSeller,
      });

      addToast({
        title: 'Product Updated',
        message: `Changes to "${productForm.name}" were saved.`,
        type: 'success',
      });

      setEditingProduct(null);
      await loadProducts();
    } catch (err: any) {
      addToast({
        title: 'Update Error',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    const target = deleteConfirmProduct;
    setDeleteConfirmProduct(null);

    try {
      await productService.deleteProduct(target.id);
      addToast({
        title: 'Product Deleted',
        message: `"${target.name}" was permanently removed.`,
        type: 'info',
      });
      await loadProducts();
    } catch (err: any) {
      addToast({
        title: 'Delete Error',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p: any) => {
        const search = productSearch.toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(search) ||
          (p.description || '').toLowerCase().includes(search) ||
          (p.category || '').toLowerCase().includes(search)
        );
      })
      .sort((a: any, b: any) => (Number(a.priority) || 0) - (Number(b.priority) || 0));
  }, [products, productSearch]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. USERS MANAGEMENT STATE & HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const [newUserData, setNewUserData] = useState({
    realName: '',
    username: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
  });

  const [editFormData, setEditFormData] = useState({
    realName: '',
    username: '',
    email: '',
    role: 'customer',
    phone: '',
  });

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        (u.realName || u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());

      const isOwnerOrAdmin = u.role === 'admin' || u.role === 'owner';
      const matchesRole =
        selectedRoleFilter === 'ALL' ||
        (selectedRoleFilter === 'ADMIN' && isOwnerOrAdmin) ||
        (selectedRoleFilter === 'CUSTOMER' && !isOwnerOrAdmin);

      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchTerm, selectedRoleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.realName || !newUserData.username || !newUserData.email || !newUserData.password) {
      addToast({ title: 'Error', message: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    try {
      await adminAddUser(newUserData);
      addToast({
        title: 'User Created',
        message: `Account for ${newUserData.realName} (@${newUserData.username}) created.`,
        type: 'success',
      });
      setIsAddUserModalOpen(false);
      setNewUserData({ realName: '', username: '', email: '', password: '', role: 'customer', phone: '' });
    } catch (err: any) {
      addToast({
        title: 'Creation Failed',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleOpenEditUser = (targetUser: User) => {
    setEditingUser(targetUser);
    setEditFormData({
      realName: targetUser.realName || targetUser.name || '',
      username: targetUser.username || '',
      email: targetUser.email || '',
      role: targetUser.role || 'customer',
      phone: targetUser.phone || '',
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await adminUpdateUser(editingUser.id, editFormData);
      addToast({
        title: 'Account Updated',
        message: `Saved changes to ${editFormData.realName}'s account.`,
        type: 'success',
      });
      setEditingUser(null);
    } catch (err: any) {
      addToast({
        title: 'Update Error',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const target = deleteConfirmUser;
    setDeleteConfirmUser(null);
    try {
      await adminDeleteUser(target.id);
      addToast({
        title: 'Account Removed',
        message: `Account for ${target.realName || target.name} was deleted.`,
        type: 'info',
      });
    } catch (err: any) {
      addToast({
        title: 'Delete Error',
        message: err.response?.data?.message || err.message,
        type: 'error',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTH GATE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleUnlockWithPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginWithAdminKey(passkeyInput);
      if (res) {
        addToast({
          title: 'Admin Clearance Granted',
          message: 'Welcome to the SheXz Atelier Console.',
          type: 'success',
        });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Invalid Master Passkey.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUnlockWithCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await login({ emailOrUsername: adminEmailInput, password: adminPasswordInput });
      if (res) {
        if (res.isAdmin || res.role === 'admin' || res.role === 'owner') {
          addToast({
            title: 'Admin Authenticated',
            message: `Signed in as ${res.name || res.username}.`,
            type: 'success',
          });
        } else {
          setAuthError('This account does not have store administrator clearance.');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate admin account.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RESTRICTED ACCESS GATE VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isMasterAdmin) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card animate-fade-in-up luxury-border-glow">
          <div className="admin-lock-icon">
            <Lock size={36} color="var(--accent-purple)" />
          </div>
          <div className="admin-lock-badge">STRICTLY RESTRICTED</div>
          <h2 className="admin-lock-title">SheXz Atelier Security Gate</h2>
          <p className="admin-lock-sub">
            This administration console is confidential and accessible solely by the authorized store owner and admin accounts.
          </p>

          {user && (
            <div className="admin-logged-in-notice">
              <span>👤 Signed in as: <strong>{user.name || user.username}</strong> ({user.role})</span>
              <span style={{ fontSize: '0.78rem', color: '#f87171', display: 'block', marginTop: '0.25rem' }}>
                Standard customer accounts do not have clearance for this atelier console.
              </span>
            </div>
          )}

          {authError && (
            <div className="admin-lock-error">
              <span>⚠️ {authError}</span>
            </div>
          )}

          <div className="admin-gate-tabs">
            <button
              type="button"
              className={`admin-gate-tab ${authMode === 'passkey' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('passkey');
                setAuthError('');
              }}
            >
              Master Passkey
            </button>
            <button
              type="button"
              className={`admin-gate-tab ${authMode === 'credentials' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('credentials');
                setAuthError('');
              }}
            >
              Admin Credentials
            </button>
          </div>

          {authMode === 'passkey' ? (
            <form onSubmit={handleUnlockWithPasskey}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="gate-passkey">Master Passkey</label>
                <input
                  id="gate-passkey"
                  type="password"
                  required
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter authorized master password"
                  className="form-control"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-glow btn-full luxury-hover"
                disabled={authLoading}
              >
                {authLoading ? 'Verifying Credentials…' : 'Unlock Atelier Console'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUnlockWithCredentials}>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '0.8rem' }}>
                <label className="form-label" htmlFor="gate-admin-email">Admin Email or Username</label>
                <input
                  id="gate-admin-email"
                  type="text"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label className="form-label" htmlFor="gate-admin-pw">Password</label>
                <input
                  id="gate-admin-pw"
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className="form-control"
                />
              </div>
              <button
                type="submit"
                className="btn btn-glow btn-full luxury-hover"
                disabled={authLoading}
              >
                {authLoading ? 'Authenticating with Database…' : 'Authenticate Admin Account'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Return to Main Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER: ORDER STATUS BADGE COMPONENT
  // ─────────────────────────────────────────────────────────────────────────────
  const renderStatusBadge = (status: OrderType['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="order-status-badge status-pending">● Pending</span>;
      case 'Confirmed':
        return <span className="order-status-badge status-confirmed">✓ Confirmed</span>;
      case 'Processing':
        return <span className="order-status-badge status-processing">⚙ Processing</span>;
      case 'Shipped':
        return <span className="order-status-badge status-shipped">🚚 Shipped</span>;
      case 'Delivered':
        return <span className="order-status-badge status-delivered">★ Delivered</span>;
      case 'Cancelled':
        return <span className="order-status-badge status-cancelled">✕ Cancelled</span>;
      default:
        return <span className="order-status-badge">{status}</span>;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN ARRANGE ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page-container">
      {/* Top Header Bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="brand-link" style={{ fontSize: '1.3rem', letterSpacing: '0.15em' }}>
            <span>SheXz</span>
            <span className="brand-badge" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(139,92,246,0.3)', color: '#fff' }}>
              ATELIER CONSOLE
            </span>
          </Link>
          <span className="admin-status-pill">
            <span className="pulse-dot" /> Live Store Active
          </span>
        </div>

        <div className="admin-header-right">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              👤 <strong>{user?.name || user?.username}</strong>
            </span>
            <span className="brand-badge" style={{ background: 'rgba(139, 92, 246, 0.25)', color: '#c084fc', fontSize: '0.7rem' }}>
              {user?.role || 'admin'}
            </span>
          </div>

          <Link to="/" className="btn btn-secondary btn-sm luxury-hover" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ExternalLink size={14} /> Storefront
          </Link>

          <button
            type="button"
            className="btn btn-secondary btn-sm luxury-hover"
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        {/* TOP KPI OVERVIEW CARDS */}
        <div className="admin-kpi-grid">
          {/* Card 1: Revenue */}
          <div className="admin-kpi-card">
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Store Revenue</span>
              <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="admin-kpi-value" style={{ color: '#34d399' }}>
              LKR {totalRevenue.toLocaleString()}
            </div>
            <div className="admin-kpi-sub">
              <span>All confirmed & fulfilled orders</span>
            </div>
          </div>

          {/* Card 2: Orders */}
          <div
            className="admin-kpi-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setAdminSection('orders')}
          >
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Total Orders</span>
              <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className="admin-kpi-value">
              {orders.length}
            </div>
            <div className="admin-kpi-sub">
              {pendingOrdersCount > 0 ? (
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>● {pendingOrdersCount} pending dispatch</span>
              ) : (
                <span style={{ color: '#34d399' }}>✓ All orders processed</span>
              )}
            </div>
          </div>

          {/* Card 3: Products */}
          <div
            className="admin-kpi-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setAdminSection('products')}
          >
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Store Products</span>
              <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                <Package size={18} />
              </div>
            </div>
            <div className="admin-kpi-value">
              {products.length}
            </div>
            <div className="admin-kpi-sub">
              <span>{products.filter((p: any) => p.isFeatured).length} featured drops</span>
            </div>
          </div>

          {/* Card 4: Customer Messages */}
          <div
            className="admin-kpi-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setAdminSection('messages')}
          >
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">Customer Inquiries</span>
              <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <MessageSquare size={18} />
              </div>
            </div>
            <div className="admin-kpi-value">
              {messages.length}
            </div>
            <div className="admin-kpi-sub">
              {unreadMessagesCount > 0 ? (
                <span style={{ color: '#f87171', fontWeight: 700 }}>● {unreadMessagesCount} unread message{unreadMessagesCount > 1 ? 's' : ''}</span>
              ) : (
                <span style={{ color: '#34d399' }}>✓ Inbox all caught up</span>
              )}
            </div>
          </div>

          {/* Card 5: Users */}
          <div
            className="admin-kpi-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setAdminSection('users')}
          >
            <div className="admin-kpi-header">
              <span className="admin-kpi-title">User Accounts</span>
              <div className="admin-kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="admin-kpi-value">
              {usersList.length}
            </div>
            <div className="admin-kpi-sub">
              <span>{usersList.filter((u) => u.role === 'admin' || u.role === 'owner').length} admins active</span>
            </div>
          </div>
        </div>

        {/* ARRANGE NAVIGATION BAR */}
        <nav className="admin-nav-bar">
          <button
            type="button"
            className={`admin-nav-pill ${adminSection === 'overview' ? 'active' : ''}`}
            onClick={() => setAdminSection('overview')}
          >
            <LayoutDashboard size={16} /> Overview
          </button>

          <button
            type="button"
            className={`admin-nav-pill ${adminSection === 'orders' ? 'active' : ''}`}
            onClick={() => setAdminSection('orders')}
          >
            <ShoppingBag size={16} /> Orders
            <span className="admin-nav-pill-badge">{orders.length}</span>
            {pendingOrdersCount > 0 && (
              <span className="admin-nav-pill-badge" style={{ background: 'rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                {pendingOrdersCount} new
              </span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-pill ${adminSection === 'messages' ? 'active' : ''}`}
            onClick={() => setAdminSection('messages')}
          >
            <MessageSquare size={16} /> Customer Messages
            <span className="admin-nav-pill-badge">{messages.length}</span>
            {unreadMessagesCount > 0 && (
              <span className="admin-nav-pill-badge admin-badge-unread">
                {unreadMessagesCount} unread
              </span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-pill ${adminSection === 'products' ? 'active' : ''}`}
            onClick={() => setAdminSection('products')}
          >
            <Package size={16} /> Store Products
            <span className="admin-nav-pill-badge">{products.length}</span>
          </button>

          <button
            type="button"
            className={`admin-nav-pill ${adminSection === 'users' ? 'active' : ''}`}
            onClick={() => setAdminSection('users')}
          >
            <Users size={16} /> User Accounts
            <span className="admin-nav-pill-badge">{usersList.length}</span>
          </button>
        </nav>

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: OVERVIEW (EXECUTIVE SUMMARY)
           ───────────────────────────────────────────────────────────────────── */}
        {adminSection === 'overview' && (
          <div className="animate-fade-in">
            {/* Quick Actions Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Atelier Executive Overview
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Real-time command center for SheXz streetwear orders, customer messages, and drops.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary luxury-hover"
                  onClick={() => {
                    loadOrders();
                    loadMessages();
                    loadProducts();
                    if (loadUsersList) loadUsersList();
                    addToast({ title: 'Refreshed', message: 'Atelier console synchronized.', type: 'info' });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Refresh All
                </button>
                <button
                  type="button"
                  className="btn btn-glow luxury-hover"
                  onClick={() => {
                    setProductForm({
                      imageUrl: '',
                      name: '',
                      description: '',
                      price: '',
                      priority: String(products.length + 1),
                      category: 'T-Shirts',
                      isFeatured: true,
                      isBestSeller: false,
                    });
                    setIsAddProductModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
            </div>

            {/* 2-Column Overview Layout */}
            <div className="admin-overview-grid">
              {/* Left Column: Recent Orders */}
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} color="var(--accent-purple)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Customer Orders</h3>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAdminSection('orders')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    View All ({orders.length}) →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    No orders placed yet.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {orders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#13151f', flexShrink: 0 }}>
                            <img
                              src={order.orderItems[0]?.image || '/images/products/remorse-tee.jpg'}
                              alt="Item"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                                #{order.id}
                              </strong>
                              {renderStatusBadge(order.status)}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {order.shippingAddress?.fullName} · {order.orderItems?.length} item{order.orderItems?.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'right' }}>
                          <div>
                            <span style={{ display: 'block', fontWeight: 700, color: '#34d399', fontSize: '0.95rem' }}>
                              LKR {order.totalPrice?.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {/* Orders View Button */}
                          <button
                            type="button"
                            className="btn-orders-view"
                            onClick={() => setViewingOrder(order)}
                            title="View Full Order Details"
                          >
                            <Eye size={13} /> View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Customer Messages Stream */}
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Customer Inquiries</h3>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAdminSection('messages')}
                    style={{ fontSize: '0.78rem' }}
                  >
                    View All ({messages.length}) →
                  </button>
                </div>

                {messages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                    No customer inquiries received yet.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {messages.slice(0, 4).map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => handleOpenMessage(msg)}
                        style={{
                          background: msg.status === 'unread' ? 'rgba(6, 182, 212, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          border: msg.status === 'unread' ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem 1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {msg.status === 'unread' && <span className="unread-glow-dot" />}
                            <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{msg.name}</strong>
                          </div>
                          <span className="inquiry-badge inquiry-order" style={{ fontSize: '0.68rem' }}>
                            {msg.inquiryType}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.message}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          <span>{msg.email}</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: ORDERS MANAGEMENT WITH ORDERS VIEW BUTTON
           ───────────────────────────────────────────────────────────────────── */}
        {adminSection === 'orders' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Orders & Islandwide Dispatch
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Inspect customer purchases, print fulfillment invoices, and update live shipment tracking.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary luxury-hover"
                  onClick={loadOrders}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Refresh Orders
                </button>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search by Order ID, name, phone, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {['ALL', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${orderStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setOrderStatusFilter(st)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading orders from store database…</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                <ShoppingBag size={40} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No orders matching current filter.</p>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>New customer checkouts will appear here instantly.</span>
              </div>
            ) : (
              <div className="table-responsive" style={{ background: 'rgba(15, 18, 28, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '1rem' }}>Order ID & Date</th>
                      <th style={{ padding: '1rem' }}>Customer</th>
                      <th style={{ padding: '1rem' }}>Items</th>
                      <th style={{ padding: '1rem' }}>Payment</th>
                      <th style={{ padding: '1rem' }}>Total (LKR)</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem' }}>
                          <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)', display: 'block' }}>
                            #{ord.id}
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {new Date(ord.createdAt).toLocaleDateString()} · {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: '#fff', fontWeight: 600, display: 'block' }}>
                            {ord.shippingAddress?.fullName || ord.user?.realName || 'Guest Customer'}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {ord.shippingAddress?.phone} · {ord.shippingAddress?.city}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {ord.orderItems?.slice(0, 2).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image || '/images/products/remorse-tee.jpg'}
                                alt={item.name}
                                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                                title={`${item.name} (${item.size || 'M'}) x${item.quantity}`}
                              />
                            ))}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {ord.orderItems?.length} item{ord.orderItems?.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block' }}>
                            {ord.paymentMethod}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: ord.isPaid ? '#34d399' : '#fbbf24' }}>
                            {ord.isPaid ? '● Paid' : '○ Payment on Delivery'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                          LKR {ord.totalPrice?.toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {renderStatusBadge(ord.status)}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            {/* THE ORDERS VIEW BUTTON */}
                            <button
                              type="button"
                              className="btn-orders-view"
                              onClick={() => setViewingOrder(ord)}
                              title="Inspect Order Details & Update Status"
                            >
                              <Eye size={14} /> View
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm luxury-hover"
                              onClick={() => handleDeleteOrder(ord.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', padding: '0.35rem 0.5rem' }}
                              title="Remove Order"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: CUSTOMER MESSAGES
           ───────────────────────────────────────────────────────────────────── */}
        {adminSection === 'messages' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Customer Messages & Inquiries
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Direct inquiries received from the SheXz Colombo studio contact desk.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary luxury-hover"
                  onClick={loadMessages}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Refresh Inquiries
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search by customer, email, text..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['ALL', 'unread', 'read'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${messageStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setMessageStatusFilter(st)}
                    style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}
                  >
                    {st === 'ALL' ? 'All Messages' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Inbox Grid */}
            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading customer inquiries…</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                <MessageSquare size={40} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No inquiries matching current criteria.</p>
              </div>
            ) : (
              <div className="message-inbox-grid">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-inbox-card ${msg.status === 'unread' ? 'unread' : ''}`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-full)',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#fff',
                            fontSize: '0.95rem',
                          }}
                        >
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#fff', fontSize: '0.98rem' }}>{msg.name}</strong>
                            {msg.status === 'unread' && <span className="unread-glow-dot" />}
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {msg.email} {msg.phone ? `· ${msg.phone}` : ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="inquiry-badge inquiry-order">{msg.inquiryType}</span>
                        {msg.orderNumber && (
                          <span className="inquiry-badge" style={{ color: 'var(--accent-cyan)' }}>
                            #{msg.orderNumber}
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.25rem' }}>
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                      {msg.message}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.85rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm luxury-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMessage(msg);
                        }}
                        style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={12} /> View Full
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm luxury-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMessageRead(msg);
                        }}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {msg.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm luxury-hover"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(msg.id);
                        }}
                        style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.75rem' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: STORE PRODUCTS
           ───────────────────────────────────────────────────────────────────── */}
        {adminSection === 'products' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Store Products Management
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Manage storefront drops, image URLs, prices, and priority rankings saved in PostgreSQL.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary luxury-hover"
                  onClick={loadProducts}
                  title="Reload from database"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
                <button
                  type="button"
                  className="btn btn-glow luxury-hover"
                  onClick={() => {
                    setProductForm({
                      imageUrl: '',
                      name: '',
                      description: '',
                      price: '',
                      priority: String(products.length + 1),
                      category: 'T-Shirts',
                      isFeatured: true,
                      isBestSeller: false,
                    });
                    setIsAddProductModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add Store Product
                </button>
              </div>
            </div>

            {productsError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {productsError}
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search products by name, description, category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading products from database…</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No products found.</p>
                <button
                  type="button"
                  className="btn btn-glow"
                  onClick={() => setIsAddProductModalOpen(true)}
                >
                  Create First Product
                </button>
              </div>
            ) : (
              <div className="table-responsive" style={{ background: 'rgba(15, 18, 28, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '1rem' }}>Priority</th>
                      <th style={{ padding: '1rem' }}>Preview</th>
                      <th style={{ padding: '1rem' }}>Name & Slug</th>
                      <th style={{ padding: '1rem' }}>Description</th>
                      <th style={{ padding: '1rem' }}>Price (LKR)</th>
                      <th style={{ padding: '1rem' }}>Badges</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod: any) => (
                      <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          #{prod.priority}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <img
                            src={prod.imageUrl || (prod.images && prod.images[0]?.url) || (prod.images && prod.images[0]) || '/images/products/remorse-tee.jpg'}
                            alt={prod.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <strong style={{ display: 'block', color: '#fff' }}>{prod.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>/{prod.slug}</span>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '280px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prod.description}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                          LKR {Number(prod.price).toLocaleString()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {prod.isFeatured && <span className="product-badge badge-featured" style={{ marginRight: '0.3rem' }}>Live</span>}
                          {prod.isBestSeller && <span className="product-badge badge-bestseller">Top</span>}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm luxury-hover"
                            onClick={() => handleOpenEditProduct(prod)}
                            style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm luxury-hover"
                            onClick={() => setDeleteConfirmProduct(prod)}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            SECTION: USER ACCOUNTS
           ───────────────────────────────────────────────────────────────────── */}
        {adminSection === 'users' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  Registered Database Accounts
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Direct live view of User records stored in PostgreSQL via Prisma.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary luxury-hover"
                  onClick={loadUsersList}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} /> Refresh Users
                </button>
                <button
                  type="button"
                  className="btn btn-glow luxury-hover"
                  onClick={() => {
                    setNewUserData({ realName: '', username: '', email: '', password: '', role: 'customer', phone: '' });
                    setIsAddUserModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add User
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search users by name, username, email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['ALL', 'CUSTOMER', 'ADMIN'].map((rf) => (
                  <button
                    key={rf}
                    type="button"
                    className={`filter-pill ${selectedRoleFilter === rf ? 'active' : ''}`}
                    onClick={() => setSelectedRoleFilter(rf)}
                  >
                    {rf}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive" style={{ background: 'rgba(15, 18, 28, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>User / Real Name</th>
                    <th style={{ padding: '1rem' }}>Username</th>
                    <th style={{ padding: '1rem' }}>Email Address</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Points</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No user records found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>
                          {u.realName || u.name || 'SheXz Member'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--accent-cyan)' }}>
                          @{u.username || 'user'}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            className="brand-badge"
                            style={{
                              background: u.role === 'owner' ? 'rgba(234, 179, 8, 0.2)' : u.role === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.08)',
                              color: u.role === 'owner' ? '#facc15' : u.role === 'admin' ? '#c084fc' : '#e2e8f0',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          {u.points ?? 200} pts
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm luxury-hover"
                            onClick={() => handleOpenEditUser(u)}
                            style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit size={13} /> Edit
                          </button>
                          {u.role !== 'owner' && u.email !== 'sheranadeesha39@gmail.com' && u.email !== 'admin@elix.lk' && (
                            <button
                              type="button"
                              className="btn btn-sm luxury-hover"
                              onClick={() => setDeleteConfirmUser(u)}
                              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: ORDERS VIEW (ORDER INSPECTION & DISPATCH SLIP)
         ───────────────────────────────────────────────────────────────────── */}
      {viewingOrder && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Order Inspection</h3>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(viewingOrder.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedOrderId ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    #{viewingOrder.id}
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                  title="Print Dispatch Slip"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Live Status Switcher */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>
                  Fulfillment Status
                </span>
                <div>{renderStatusBadge(viewingOrder.status)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Change to:</span>
                <select
                  value={viewingOrder.status}
                  disabled={statusUpdating}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.id, e.target.value as OrderType['status'])}
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} /> Shipping Destination
                </h4>
                <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {viewingOrder.shippingAddress?.fullName}
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                  {viewingOrder.shippingAddress?.street},<br />
                  {viewingOrder.shippingAddress?.city} {viewingOrder.shippingAddress?.postalCode}
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  📞 {viewingOrder.shippingAddress?.phone}
                  {viewingOrder.shippingAddress?.phone && (
                    <a
                      href={`https://wa.me/${viewingOrder.shippingAddress.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(viewingOrder.shippingAddress.fullName)}%2C%20regarding%20your%20SheXz%20Order%20%23${viewingOrder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#34d399', marginLeft: '0.5rem', textDecoration: 'underline' }}
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={14} /> Payment & Account
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.25rem' }}>
                  Method: <strong>{viewingOrder.paymentMethod}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: viewingOrder.isPaid ? '#34d399' : '#fbbf24', marginBottom: '0.5rem' }}>
                  Status: {viewingOrder.isPaid ? 'Payment Confirmed' : 'Cash on Delivery Pending'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Email: {viewingOrder.user?.email || 'N/A'}
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                Ordered Streetwear Items ({viewingOrder.orderItems?.length})
              </h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {viewingOrder.orderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.image || '/images/products/remorse-tee.jpg'}
                        alt={item.name}
                        style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block' }}>{item.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Size: {item.size || 'M'} · Qty: {item.quantity} · LKR {Number(item.price).toLocaleString()} each
                        </span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>
                      LKR {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>Items Subtotal:</span>
                <span>LKR {viewingOrder.itemsPrice?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>Islandwide Delivery Fee:</span>
                <span>{viewingOrder.deliveryFee === 0 ? 'FREE' : `LKR ${viewingOrder.deliveryFee}`}</span>
              </div>
              {viewingOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.35rem' }}>
                  <span>Discount Applied:</span>
                  <span>- LKR {viewingOrder.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#fff', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span>Grand Total:</span>
                <span style={{ color: '#34d399' }}>LKR {viewingOrder.totalPrice?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setViewingOrder(null)}
              >
                Close View
              </button>
              <button
                type="button"
                className="btn btn-glow luxury-hover"
                style={{ flex: 1 }}
                onClick={() => {
                  handleUpdateOrderStatus(viewingOrder.id, 'Shipped');
                }}
              >
                Mark as Dispatched 🚚
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: CUSTOMER MESSAGE READER
         ───────────────────────────────────────────────────────────────────── */}
      {viewingMessage && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '580px', width: '92%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="inquiry-badge inquiry-order" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                  {viewingMessage.inquiryType}
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem 0' }}>{viewingMessage.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Received on {new Date(viewingMessage.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Sender Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                <a href={`mailto:${viewingMessage.email}`} style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                  {viewingMessage.email}
                </a>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block' }}>Phone / WhatsApp</span>
                <span style={{ color: '#fff', fontSize: '0.88rem' }}>
                  {viewingMessage.phone || 'Not provided'}
                </span>
              </div>
            </div>

            {viewingMessage.orderNumber && (
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                Referenced Order: <strong>#{viewingMessage.orderNumber}</strong>
              </div>
            )}

            {/* Message Body */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                Customer Inquiry Message:
              </span>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-md)', padding: '1.25rem', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {viewingMessage.message}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href={`mailto:${viewingMessage.email}?subject=${encodeURIComponent(`SheXz Colombo Studio Support: Re: ${viewingMessage.inquiryType}`)}&body=${encodeURIComponent(`Hi ${viewingMessage.name},\n\nThank you for reaching out to SheXz.\n\n`)}`}
                className="btn btn-glow luxury-hover"
                style={{ flex: 1, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Mail size={14} /> Reply via Email
              </a>

              {viewingMessage.phone && (
                <a
                  href={`https://wa.me/${viewingMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${viewingMessage.name}, this is the SheXz Colombo Atelier team responding to your inquiry regarding ${viewingMessage.inquiryType}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary luxury-hover"
                  style={{ flex: 1, textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#34d399' }}
                >
                  <Phone size={14} /> WhatsApp Reply
                </a>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleToggleMessageRead(viewingMessage)}
                style={{ flex: 1 }}
              >
                {viewingMessage.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT STORE PRODUCT
         ───────────────────────────────────────────────────────────────────── */}
      {(isAddProductModalOpen || editingProduct) && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '580px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>
                {editingProduct ? 'Edit Store Product' : 'Add Store Product (PostgreSQL)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddProductModalOpen(false);
                  setEditingProduct(null);
                }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Image URL <span style={{ color: 'var(--accent-purple)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... or /images/products/remorse-tee.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="form-control"
                />
                {productForm.imageUrl && (
                  <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      style={{ maxHeight: '100px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Product Name <span style={{ color: 'var(--accent-purple)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SheXz Oversized Cyber Graphic"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Description <span style={{ color: 'var(--accent-purple)' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="220 GSM heavyweight combed cotton oversized streetwear tee..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Price (LKR) <span style={{ color: 'var(--accent-purple)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50}
                    placeholder="3000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Priority Number <span style={{ color: 'var(--accent-purple)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    placeholder="1 (Top Priority)"
                    value={productForm.priority}
                    onChange={(e) => setProductForm({ ...productForm, priority: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    />
                    <span>Featured Live Drop</span>
                  </label>
                  <label className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.isBestSeller}
                      onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    />
                    <span>Best Seller</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setIsAddProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-glow luxury-hover"
                  style={{ flex: 1 }}
                >
                  {editingProduct ? 'Save Changes' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PRODUCT CONFIRM */}
      {deleteConfirmProduct && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '440px', width: '90%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#f87171' }}>
              Delete Product?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete <strong>{deleteConfirmProduct.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDeleteConfirmProduct(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn luxury-hover"
                style={{ flex: 1, background: '#ef4444', color: '#fff' }}
                onClick={handleDeleteProduct}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT USER */}
      {(isAddUserModalOpen || editingUser) && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '480px', width: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingUser ? 'Edit User Account' : 'Create User Account (PostgreSQL)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddUserModalOpen(false);
                  setEditingUser(null);
                }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingUser ? handleSaveEditUser : handleCreateUser}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Real Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={editingUser ? editFormData.realName : newUserData.realName}
                  onChange={(e) =>
                    editingUser
                      ? setEditFormData({ ...editFormData, realName: e.target.value })
                      : setNewUserData({ ...newUserData, realName: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex_rivera"
                  value={editingUser ? editFormData.username : newUserData.username}
                  onChange={(e) =>
                    editingUser
                      ? setEditFormData({ ...editFormData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                      : setNewUserData({ ...newUserData, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={editingUser ? editFormData.email : newUserData.email}
                  onChange={(e) =>
                    editingUser
                      ? setEditFormData({ ...editFormData, email: e.target.value })
                      : setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="form-control"
                />
              </div>

              {!editingUser && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="form-control"
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Role</label>
                <select
                  value={editingUser ? editFormData.role : newUserData.role}
                  onChange={(e) =>
                    editingUser
                      ? setEditFormData({ ...editFormData, role: e.target.value })
                      : setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="form-control"
                >
                  <option value="customer">customer (Standard Member)</option>
                  <option value="admin">admin (Store Administrator)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-glow luxury-hover"
                  style={{ flex: 1 }}
                >
                  {editingUser ? 'Save User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRM */}
      {deleteConfirmUser && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '440px', width: '90%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#f87171' }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong>{deleteConfirmUser.realName || deleteConfirmUser.name}</strong> from database?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDeleteConfirmUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn luxury-hover"
                style={{ flex: 1, background: '#ef4444', color: '#fff' }}
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
