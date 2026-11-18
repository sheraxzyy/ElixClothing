import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as orderService from '../services/orderService';
import { formatPrice } from '../services/productService';
import { OrderType, OrderTrackingEventType } from '../types';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  HelpCircle,
  X,
  CreditCard,
  Mail,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import useSound from '../hooks/useSound';
import { useToast } from '../context/ToastContext';

interface StatusStep {
  key: string;
  label: string;
  desc: string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: 'Pending', label: 'Order Placed', desc: 'Order details recorded and awaiting processing' },
  { key: 'Confirmed', label: 'Order Confirmed', desc: 'Payment verified and transaction approved' },
  { key: 'Processing', label: 'Processing', desc: 'Items picked and verified at ELIX Atelier' },
  { key: 'PreparingForShipment', label: 'Packed & Sealed', desc: 'Custom packaging sealed and assigned to dispatch' },
  { key: 'Shipped', label: 'Shipped', desc: 'Handed over to courier and in active transit' },
  { key: 'OutForDelivery', label: 'Out for Delivery', desc: 'Courier agent on route to delivery destination' },
  { key: 'Delivered', label: 'Delivered', desc: 'Package successfully handed over to customer' },
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('id') || '';

  const { user } = useAuth();
  const { addToast } = useToast();
  const { playClick } = useSound();

  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId);
  const [emailInput, setEmailInput] = useState<string>(user?.email || '');
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [myOrders, setMyOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadMyOrders();
      if (!emailInput && user.email) {
        setEmailInput(user.email);
      }
    }
    if (initialOrderId) {
      handleLookup(initialOrderId);
    }
  }, [user, initialOrderId]);

  const loadMyOrders = async () => {
    try {
      const orders = await orderService.getOrders();
      setMyOrders(orders);
    } catch {
      // Handled silently
    }
  };

  const handleLookup = async (idToLookUp?: string) => {
    const targetId = (idToLookUp || orderIdInput).trim();

    if (!targetId) {
      setError('Please provide a valid ELIX Order ID (e.g. ELX-92184).');
      return;
    }

    if (emailInput.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setError('Please enter a valid email address for customer verification.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      playClick();
      const data = await orderService.getOrderTracking(targetId);

      // Email security / verification check if email entered
      if (emailInput.trim()) {
        const orderEmail =
          data.user?.email ||
          data.shippingAddress?.email ||
          data.email ||
          '';

        if (
          orderEmail &&
          orderEmail.toLowerCase() !== emailInput.trim().toLowerCase() &&
          !user?.isAdmin
        ) {
          setError(
            'The verification email provided does not match the customer record for this Order ID. Please verify your order confirmation email.'
          );
          setCurrentOrder(null);
          setLoading(false);
          return;
        }
      }

      setCurrentOrder(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(
          `Order #${targetId} was not found. Please double-check your order ID or reference number.`
        );
      } else if (err.response?.status === 403) {
        setError(
          'Security Notice: This order belongs to an authenticated customer account. Please sign in to verify and view this shipment.'
        );
      } else {
        setError(
          'Could not retrieve tracking details. Please verify your order number and try again.'
        );
      }
      setCurrentOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    playClick();
    setOrderIdInput('');
    if (!user) setEmailInput('');
    setCurrentOrder(null);
    setError('');
  };

  const handleCopyWaybill = (trackingNo: string) => {
    playClick();
    navigator.clipboard.writeText(trackingNo);
    setCopiedTracking(true);
    addToast({
      title: 'Tracking Number Copied',
      message: `${trackingNo} copied to your clipboard.`,
      type: 'info',
    });
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const isCancelled =
      currentStatus === 'Cancelled' ||
      currentStatus === 'DeliveryFailed' ||
      currentStatus === 'Delivery Failed' ||
      currentStatus === 'Returned';
    if (isCancelled) return 'cancelled';

    const indexMap: Record<string, number> = {
      Pending: 0,
      'Order Placed': 0,
      Confirmed: 1,
      'Payment Confirmed': 1,
      Processing: 2,
      PreparingForShipment: 3,
      'Preparing for Shipment': 3,
      Packed: 3,
      Shipped: 4,
      OutForDelivery: 5,
      'Out for Delivery': 5,
      Delivered: 6,
    };

    const currentIdx = indexMap[currentStatus] ?? 0;
    const stepIdx = indexMap[stepKey] ?? 0;

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'upcoming';
  };

  const isTerminalNegativeStatus =
    currentOrder?.status === 'Cancelled' ||
    currentOrder?.status === 'DeliveryFailed' ||
    currentOrder?.status === 'Delivery Failed' ||
    currentOrder?.status === 'Returned';

  return (
    <div className="track-page-wrapper">
      <div className="container">
        {/* SECTION A: HERO SECTION */}
        <div className="track-hero-section">
          <div className="track-hero-badge">
            <Truck size={14} className="text-cyan-400 animate-pulse" />
            <span>DISPATCH & SHIPMENT VERIFICATION</span>
          </div>
          <h1 className="track-hero-title">
            TRACK YOUR <span className="track-title-gradient">ORDER</span>
          </h1>
          <p className="track-hero-description">
            Enter your ELIX order reference number and verification email to view real-time courier milestones, transit waybills, and estimated delivery schedules.
          </p>
        </div>

        {/* SECTION B: ORDER SEARCH FORM */}
        <div className="track-search-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="track-search-form"
          >
            <div className="track-inputs-grid">
              {/* Field 1: Order ID */}
              <div className="track-input-field">
                <label htmlFor="track-order-id" className="track-input-label">
                  ORDER ID / NUMBER <span className="text-red-400">*</span>
                </label>
                <div className="track-input-wrap">
                  <Search className="track-input-icon" size={18} />
                  <input
                    id="track-order-id"
                    type="text"
                    placeholder="e.g. ELX-92184 or your order number"
                    value={orderIdInput}
                    onChange={(e) => setOrderIdInput(e.target.value)}
                    className="track-input"
                    autoComplete="off"
                  />
                  {orderIdInput && (
                    <button
                      type="button"
                      className="track-input-clear-icon"
                      onClick={() => setOrderIdInput('')}
                      aria-label="Clear order ID"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Customer Email Verification */}
              <div className="track-input-field">
                <label htmlFor="track-email" className="track-input-label">
                  CUSTOMER EMAIL <span className="track-optional-label">(Verification)</span>
                </label>
                <div className="track-input-wrap">
                  <Mail className="track-input-icon" size={18} />
                  <input
                    id="track-email"
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="track-input"
                    autoComplete="email"
                  />
                  {emailInput && (
                    <button
                      type="button"
                      className="track-input-clear-icon"
                      onClick={() => setEmailInput('')}
                      aria-label="Clear email"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="track-actions-row">
              <button
                type="submit"
                disabled={loading}
                className="elix-btn-primary track-submit-btn"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>LOCATING ORDER...</span>
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    <span>TRACK ORDER</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              {(orderIdInput || currentOrder || error) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="elix-btn-secondary track-clear-btn"
                >
                  <RotateCcw size={15} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </form>

          {/* Error Message Alert */}
          {error && (
            <div className="track-error-banner animate-fade-in">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <div className="track-error-text">
                <strong>Tracking Notice:</strong> {error}
              </div>
            </div>
          )}
        </div>

        {/* Recent Purchases Quick-Select for Authenticated Users */}
        {user && myOrders.length > 0 && !currentOrder && (
          <div className="track-recent-orders-section">
            <div className="track-recent-header">
              <span className="track-recent-title">YOUR RECENT PURCHASES</span>
              <span className="track-recent-count">{myOrders.length} Orders</span>
            </div>

            <div className="track-recent-grid">
              {myOrders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setOrderIdInput(order.id);
                    handleLookup(order.id);
                  }}
                  className="track-recent-card group"
                >
                  <div className="track-recent-card-body">
                    <div className="track-recent-order-no">
                      <span className="font-mono">#{order.id}</span>
                      <span className="track-order-status-tag">
                        {order.status}
                      </span>
                    </div>
                    <p className="track-recent-summary">
                      {order.orderItems?.length || 1} item
                      {(order.orderItems?.length || 1) === 1 ? '' : 's'} •{' '}
                      {formatPrice(order.totalPrice)}
                    </p>
                    <p className="track-recent-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={18} className="track-recent-chevron group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION C, D, E: DETAILED ORDER TRACKING INFORMATION */}
        {currentOrder && (
          <div className="track-details-container animate-fade-in">
            {/* Header Status Bar */}
            <div className="track-order-summary-header">
              <div className="track-header-left">
                <div className="track-order-id-badge">
                  <h2 className="track-order-title">ORDER #{currentOrder.id || currentOrder.orderId}</h2>
                  <span
                    className={`track-status-pill ${
                      isTerminalNegativeStatus
                        ? 'status-cancelled'
                        : currentOrder.status === 'Delivered'
                        ? 'status-delivered'
                        : 'status-active'
                    }`}
                  >
                    {currentOrder.status}
                  </span>
                </div>
                <p className="track-order-placed-date">
                  Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} at{' '}
                  {new Date(currentOrder.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="track-header-right">
                <span className="track-total-label">TOTAL AMOUNT</span>
                <span className="track-total-val">{formatPrice(currentOrder.totalPrice)}</span>
                <span className="track-payment-status">
                  Payment:{' '}
                  <strong>
                    {currentOrder.paymentMethod ||
                      (currentOrder.isPaid ? 'Card / Online Paid' : 'Cash on Delivery')}
                  </strong>
                </span>
              </div>
            </div>

            {/* Negative Terminal Status Alert (Cancelled / Failed) */}
            {isTerminalNegativeStatus && (
              <div className="track-terminal-alert">
                <AlertTriangle size={24} className="text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="track-terminal-title">Order Status: {currentOrder.status}</h4>
                  <p className="track-terminal-desc">
                    This order has been flagged as {currentOrder.status}. If you require assistance, wish to reinstate this order, or inquire about payments/refunds, our concierge team is available 24/7.
                  </p>
                  <Link
                    to={`/contact?inquiry=order&orderId=${currentOrder.id || currentOrder.orderId}`}
                    className="track-support-btn"
                  >
                    Contact Concierge Support <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* SECTION D: VISUAL ORDER PROGRESS TRACKER */}
            {!isTerminalNegativeStatus && (
              <div className="track-tracker-block">
                <div className="track-block-header">
                  <Clock size={16} className="text-cyan-400" />
                  <span>SHIPMENT TIMELINE & MILESTONES</span>
                </div>

                {/* Desktop Horizontal Tracker */}
                <div className="track-progress-desktop">
                  <div className="track-progress-line" />
                  <div className="track-steps-grid">
                    {STATUS_STEPS.map((step, idx) => {
                      const statusState = getStepStatus(step.key, currentOrder.status);
                      const isDone = statusState === 'completed';
                      const isActive = statusState === 'active';

                      return (
                        <div
                          key={step.key}
                          className={`track-step-item ${
                            isDone ? 'done' : isActive ? 'active' : 'upcoming'
                          }`}
                        >
                          <div className="track-step-node">
                            {isDone ? (
                              <CheckCircle2 size={18} className="track-done-icon" />
                            ) : (
                              <span className="track-step-number">{idx + 1}</span>
                            )}
                          </div>
                          <div className="track-step-info">
                            <span className="track-step-title">{step.label}</span>
                            <span className="track-step-desc">{step.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Vertical Tracker */}
                <div className="track-progress-mobile">
                  {STATUS_STEPS.map((step, idx) => {
                    const statusState = getStepStatus(step.key, currentOrder.status);
                    const isDone = statusState === 'completed';
                    const isActive = statusState === 'active';

                    return (
                      <div
                        key={step.key}
                        className={`track-step-mobile-row ${
                          isDone ? 'done' : isActive ? 'active' : 'upcoming'
                        }`}
                      >
                        <div className="track-mobile-node-col">
                          <div className="track-step-node">
                            {isDone ? (
                              <CheckCircle2 size={16} className="track-done-icon" />
                            ) : (
                              <span className="track-step-number">{idx + 1}</span>
                            )}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && <div className="track-mobile-connector" />}
                        </div>
                        <div className="track-mobile-step-content">
                          <span className="track-step-title">{step.label}</span>
                          <span className="track-step-desc">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Status Update Audit Trail */}
                {currentOrder.trackingEvents && currentOrder.trackingEvents.length > 0 && (
                  <div className="track-events-trail">
                    <h4 className="track-trail-title">LOGISTICS ACTIVITY AUDIT LOG</h4>
                    <div className="track-trail-list">
                      {currentOrder.trackingEvents.map((evt: OrderTrackingEventType) => (
                        <div key={evt.id} className="track-trail-item">
                          <div className="track-trail-main">
                            <span className="track-trail-status">{evt.status}</span>
                            <span className="track-trail-source">via {evt.updatedBy || 'Logistics'}</span>
                            <p className="track-trail-desc">{evt.description}</p>
                          </div>
                          <span className="track-trail-time">
                            {new Date(evt.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION E & F: RESPONSIVE TWO-COLUMN LAYOUT */}
            <div className="track-columns-grid">
              {/* Left Column: Ordered Items List */}
              <div className="track-items-card">
                <div className="track-card-header">
                  <Package size={16} className="text-purple-400" />
                  <span>PIECES IN THIS SHIPMENT ({currentOrder.orderItems?.length || 0})</span>
                </div>

                <div className="track-items-list">
                  {currentOrder.orderItems && currentOrder.orderItems.length > 0 ? (
                    currentOrder.orderItems.map((item, idx) => (
                      <div key={item.id || idx} className="track-item-row">
                        <img
                          src={item.image || '/images/products/remorse-tee.jpg'}
                          alt={item.name}
                          className="track-item-thumb"
                        />
                        <div className="track-item-details">
                          <h4 className="track-item-name">{item.name}</h4>
                          <div className="track-item-meta">
                            <span>Quantity: {item.quantity || 1}</span>
                            {item.size && <span>• Size: {item.size}</span>}
                            {item.color && <span>• Color: {item.color}</span>}
                          </div>
                          <div className="track-item-price">
                            {formatPrice(Number(item.price) * (Number(item.quantity) || 1))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="track-empty-items">No item details recorded for this shipment.</p>
                  )}
                </div>

                {/* Financial Summary breakdown */}
                <div className="track-breakdown-shelf">
                  <div className="track-breakdown-row">
                    <span>Items Subtotal</span>
                    <span>
                      {formatPrice(
                        currentOrder.itemsPrice ||
                          currentOrder.totalPrice - (currentOrder.deliveryFee || 0)
                      )}
                    </span>
                  </div>
                  <div className="track-breakdown-row">
                    <span>Islandwide Delivery</span>
                    <span>
                      {currentOrder.deliveryFee === 0
                        ? 'FREE'
                        : formatPrice(currentOrder.deliveryFee || 250)}
                    </span>
                  </div>
                  {currentOrder.discountAmount ? (
                    <div className="track-breakdown-row discount">
                      <span>Discount Applied</span>
                      <span>-{formatPrice(currentOrder.discountAmount)}</span>
                    </div>
                  ) : null}
                  <div className="track-breakdown-row total">
                    <span>Total Amount</span>
                    <span>{formatPrice(currentOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Delivery Information & Support */}
              <div className="track-delivery-card">
                <div className="track-card-header">
                  <MapPin size={16} className="text-emerald-400" />
                  <span>DELIVERY & DISPATCH INFORMATION</span>
                </div>

                <div className="track-delivery-body">
                  {/* Courier Partner */}
                  <div className="track-info-row">
                    <span className="track-info-label">COURIER DISPATCH</span>
                    <span className="track-info-value font-mono">
                      {currentOrder.courierName || 'ELIX Express Priority Dispatch'}
                    </span>
                  </div>

                  {/* Waybill / Tracking Number with Copy Action */}
                  <div className="track-info-row">
                    <span className="track-info-label">WAYBILL TRACKING NO.</span>
                    <div className="track-waybill-wrap">
                      <span className="track-waybill-code">
                        {currentOrder.trackingNumber ||
                          `ELX-TRK-${(currentOrder.id || currentOrder.orderId || '').replace(
                            /[^0-9]/g,
                            ''
                          ) || '8294'}`}
                      </span>
                      <button
                        type="button"
                        className="track-copy-btn"
                        onClick={() =>
                          handleCopyWaybill(
                            currentOrder.trackingNumber ||
                              `ELX-TRK-${(currentOrder.id || currentOrder.orderId || '').replace(
                                /[^0-9]/g,
                                ''
                              ) || '8294'}`
                          )
                        }
                        title="Copy tracking number"
                        aria-label="Copy tracking number"
                      >
                        {copiedTracking ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="track-info-row">
                    <span className="track-info-label">ESTIMATED DELIVERY</span>
                    <span className="track-info-value font-mono text-cyan-400">
                      {currentOrder.estimatedDelivery
                        ? new Date(currentOrder.estimatedDelivery).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '2 - 3 Business Days Islandwide'}
                    </span>
                  </div>

                  {/* Delivery Address */}
                  {currentOrder.shippingAddress && (
                    <div className="track-info-row">
                      <span className="track-info-label">SHIPPING RECIPIENT</span>
                      <div className="track-address-box">
                        <strong className="text-white block">
                          {currentOrder.shippingAddress.fullName || 'Recipient'}
                        </strong>
                        <p className="text-neutral-400 text-xs mt-0.5">
                          {currentOrder.shippingAddress.street}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          {currentOrder.shippingAddress.city}
                          {currentOrder.shippingAddress.postalCode
                            ? `, ${currentOrder.shippingAddress.postalCode}`
                            : ''}
                        </p>
                        {currentOrder.shippingAddress.phone && (
                          <p className="text-neutral-500 text-xs font-mono mt-1">
                            Phone: {currentOrder.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Concierge Support CTA */}
                  <div className="track-support-box">
                    <div className="track-support-header">
                      <HelpCircle size={16} className="text-neutral-400" />
                      <span>Need Assistance with this order?</span>
                    </div>
                    <p className="track-support-sub">
                      Our concierge is on standby to adjust address details or assist with courier handovers.
                    </p>
                    <Link
                      to={`/contact?inquiry=order&orderId=${
                        currentOrder.id || currentOrder.orderId
                      }`}
                      className="elix-btn-secondary track-contact-btn"
                      onClick={playClick}
                    >
                      Contact Customer Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
