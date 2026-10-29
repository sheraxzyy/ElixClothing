import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as productService from '../services/productService';
import { Product, User } from '../types';
import { Shield, Package, Users, RefreshCw, Plus, Search, Trash2, Edit, Crown, Lock, LogOut, CheckCircle2, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';

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

  // Active Admin Section: 'products' (Store) | 'users' (Accounts)
  const [adminSection, setAdminSection] = useState<'products' | 'users'>('products');

  // Admin Auth Gate State
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [adminEmailInput, setAdminEmailInput] = useState<string>('admin@elix.lk');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [authMode, setAuthMode] = useState<'passkey' | 'credentials'>('passkey');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // STORE / PRODUCTS STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // 5 Required Inputs for Product: imageUrl, name, description, price, priority
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
      if (loadUsersList) loadUsersList();
    }
  }, [isMasterAdmin, loadUsersList]);

  // Handle Product Create
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.imageUrl.trim() || !productForm.name.trim() || !productForm.description.trim() || !productForm.price || !productForm.priority) {
      addToast({
        title: 'Validation Error',
        message: 'Please provide all 5 required fields: Image URL, Name, Description, Price, and Priority.',
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
        message: `"${productForm.name}" has been stored in PostgreSQL database with priority ${productForm.priority}.`,
        type: 'success',
      });

      setIsAddProductModalOpen(false);
      setProductForm({
        imageUrl: '',
        name: '',
        description: '',
        price: '',
        priority: '1',
        category: 'T-Shirts',
        isFeatured: true,
        isBestSeller: false,
      });
      await loadProducts();
    } catch (err: any) {
      addToast({
        title: 'Database Error',
        message: err.response?.data?.message || err.message || 'Failed to save product to database.',
        type: 'error',
      });
    }
  };

  // Handle Product Edit
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
        message: `Changes to "${productForm.name}" were saved to PostgreSQL database.`,
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

  // Handle Product Delete
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    const target = deleteConfirmProduct;
    setDeleteConfirmProduct(null);

    try {
      await productService.deleteProduct(target.id);
      addToast({
        title: 'Product Deleted',
        message: `"${target.name}" was permanently removed from PostgreSQL database.`,
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

  // ─────────────────────────────────────────────────────────────────────────────
  // USERS MANAGEMENT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modal states for Users
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Form states for Add User
  const [newUserData, setNewUserData] = useState({
    realName: '',
    username: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
  });

  // Form states for Edit User
  const [editFormData, setEditFormData] = useState({
    realName: '',
    username: '',
    email: '',
    role: 'customer',
    phone: '',
  });

  const handleUnlockWithPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginWithAdminKey(passkeyInput);
      if (res) {
        addToast({
          title: 'Admin Clearance Granted',
          message: 'Welcome to the ELIX Atelier Console.',
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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList
      .filter((u) => {
        const matchesSearch =
          (u.realName || u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const isOwnerOrAdmin = u.role === 'admin' || u.role === 'owner';

        const matchesRole =
          selectedRoleFilter === 'ALL' ||
          (selectedRoleFilter === 'ADMIN' && isOwnerOrAdmin) ||
          (selectedRoleFilter === 'CUSTOMER' && !isOwnerOrAdmin);

        return matchesSearch && matchesRole;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'newest') return (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1;
        if (sortBy === 'oldest') return (a.createdAt || 0) > (b.createdAt || 0) ? 1 : -1;
        return 0;
      });
  }, [usersList, searchTerm, selectedRoleFilter, sortBy]);

  // Handle User Create
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.realName || !newUserData.username || !newUserData.email || !newUserData.password) {
      addToast({ title: 'Error', message: 'Please fill in all required user fields.', type: 'error' });
      return;
    }
    try {
      await adminAddUser(newUserData);
      addToast({
        title: 'Account Created in Database',
        message: `Account for ${newUserData.realName} (@${newUserData.username}) was saved to PostgreSQL.`,
        type: 'success',
      });
      setIsAddModalOpen(false);
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
        message: `Changes to ${editFormData.realName}'s account saved to PostgreSQL.`,
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
        message: `Account for ${target.realName || target.name} was deleted from database.`,
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

  // Filtered Products
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
  // RESTRICTED ACCESS GATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isMasterAdmin) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card animate-fade-in-up luxury-border-glow">
          <div className="admin-lock-icon">
            <Lock size={36} color="var(--accent-purple)" />
          </div>
          <div className="admin-lock-badge">STRICTLY RESTRICTED</div>
          <h2 className="admin-lock-title">ELIX Atelier Security Gate</h2>
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

          {/* Auth Tab Switcher */}
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
                {authLoading ? 'Verifying with Database…' : 'Unlock Atelier Console'}
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
                {authLoading ? 'Authenticating with PostgreSQL…' : 'Authenticate Admin Account'}
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
  // MAIN ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page-container">
      {/* Top Header Bar */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="brand-link" style={{ fontSize: '1.3rem', letterSpacing: '0.15em' }}>
            <span>ELIX</span>
            <span className="brand-badge">ATELIER CONSOLE</span>
          </Link>
          <span className="admin-status-pill">
            <span className="pulse-dot" /> PostgreSQL Connected
          </span>
        </div>

        <div className="admin-header-right">
          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              className={`btn btn-sm ${adminSection === 'products' ? 'btn-glow' : 'btn-secondary'}`}
              onClick={() => setAdminSection('products')}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={14} /> Store Products ({products.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${adminSection === 'users' ? 'btn-glow' : 'btn-secondary'}`}
              onClick={() => setAdminSection('users')}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Users size={14} /> User Accounts ({usersList.length})
            </button>
          </div>

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

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* SECTION 1: STORE PRODUCTS MANAGEMENT */}
        {adminSection === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
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
                  title="Reload from PostgreSQL"
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

            {/* Error banner if products failed to load */}
            {productsError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> {productsError}
              </div>
            )}

            {/* Search toolbar */}
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

            {/* Products Table */}
            {productsLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading products from PostgreSQL database…</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No products found in PostgreSQL database.</p>
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

        {/* SECTION 2: USERS MANAGEMENT */}
        {adminSection === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
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
                    setIsAddModalOpen(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add User
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search users by name, username, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Users Table */}
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
                        No user records found in PostgreSQL database.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>
                          {u.realName || u.name || 'ELIX Member'}
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

      {/* MODAL: ADD / EDIT STORE PRODUCT */}
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
              {/* 1. Image URL */}
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

              {/* 2. Name */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Product Name <span style={{ color: 'var(--accent-purple)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELIX Oversized Cyber Graphic"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* 3. Description */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Description <span style={{ color: 'var(--accent-purple)' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="220 GSM heavyweight combed cotton oversized streetwear tee with custom drop shoulder fit..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* 4. Price & 5. Priority in a row */}
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

              {/* Additional optional flags */}
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
              Are you sure you want to permanently delete <strong>{deleteConfirmProduct.name}</strong> from the PostgreSQL database?
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
      {(isAddModalOpen || editingUser) && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '480px', width: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingUser ? 'Edit User Account' : 'Create User Account (PostgreSQL)'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
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
                    setIsAddModalOpen(false);
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
              Are you sure you want to remove <strong>{deleteConfirmUser.realName || deleteConfirmUser.name}</strong> (@{deleteConfirmUser.username || deleteConfirmUser.email}) from the PostgreSQL database?
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
