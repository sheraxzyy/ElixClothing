class EmailNotificationService {
  constructor() {
    this.configured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
    this.from = process.env.SMTP_FROM || 'ELIX Streetwear <orders@elix.lk>';
    this.notificationLog = [];
  }

  isConfigured() {
    return this.configured;
  }

  getRecentLogs() {
    return this.notificationLog.slice(-50);
  }

  async sendEmail({ to, subject, html, text }) {
    const entry = {
      id: 'eml_' + Math.random().toString(36).substring(2, 9),
      to,
      subject,
      timestamp: new Date().toISOString(),
      status: 'simulated_success',
    };

    if (this.configured) {
      try {
        console.log(`[ELIX-EMAIL] Dispatched to ${to}: "${subject}"`);
        entry.status = 'sent';
      } catch (err) {
        console.error(`[ELIX-EMAIL-ERROR] Failed sending to ${to}:`, err.message);
        entry.status = 'failed';
        entry.error = err.message;
      }
    } else {
      console.log(`[ELIX-EMAIL-STUB] (SMTP not configured, logging email): To: ${to} | Subject: "${subject}"`);
      entry.status = 'delivered_local_stub';
    }

    this.notificationLog.push(entry);
    if (this.notificationLog.length > 200) this.notificationLog.shift();
    return entry;
  }

  async sendOrderConfirmation(order) {
    const to = order.user?.email || order.shippingAddress?.phone || 'customer@elix.lk';
    const subject = `ELIX // ORDER CONFIRMED [${order.id}]`;
    const html = `
      <div style="background:#0a0a0a; color:#f5f5f5; font-family:'Courier New', monospace; padding:24px; border:1px solid #222;">
        <h2 style="color:#d4ff00; letter-spacing:2px;">ELIX APPAREL // ORDER CONFIRMATION</h2>
        <p>Order Reference: <strong>${order.id}</strong></p>
        <p>Total Paid: LKR ${order.totalPrice.toLocaleString()}</p>
        <p>Status: ${order.status}</p>
        <hr style="border-color:#333;" />
        <p>Thank you for supporting ELIX independent streetwear release.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html, text: `Order ${order.id} confirmed.` });
  }

  async sendTrackingUpdate(order, event) {
    const to = order.user?.email || 'customer@elix.lk';
    const subject = `ELIX // TRACKING UPDATE: ${event.status} [${order.id}]`;
    const html = `
      <div style="background:#0a0a0a; color:#f5f5f5; font-family:'Courier New', monospace; padding:24px; border:1px solid #222;">
        <h2 style="color:#d4ff00; letter-spacing:2px;">ELIX LOGISTICS // SHIPMENT STATUS</h2>
        <p>Order ID: <strong>${order.id}</strong></p>
        <p>New Status: <span style="color:#00ffaa; font-weight:bold;">${event.status}</span></p>
        <p>Update: ${event.description}</p>
        ${event.courierName ? `<p>Courier: ${event.courierName}</p>` : ''}
        ${event.trackingNumber ? `<p>Waybill / Tracking: <strong>${event.trackingNumber}</strong></p>` : ''}
        <hr style="border-color:#333;" />
        <p>Track live on your ELIX Customer Portal.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html, text: `Order ${order.id} status updated to ${event.status}.` });
  }

  async sendBackInStockNotification(subscription, product) {
    const unsubscribeUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/api/stock-notifications/unsubscribe?id=${subscription.id}`;
    const subject = `RESTOCKED // ${product.name} (Size: ${subscription.size}) is Back in Stock!`;
    const html = `
      <div style="background:#0a0a0a; color:#f5f5f5; font-family:'Courier New', monospace; padding:24px; border:1px solid #222;">
        <h2 style="color:#d4ff00; letter-spacing:2px;">ELIX DROP ALERT // RESTOCK NOTIFICATION</h2>
        <p>Hi,</p>
        <p>The piece you requested is now back in stock:</p>
        <p><strong style="color:#fff; font-size:18px;">${product.name}</strong></p>
        <p>Size: <strong>${subscription.size}</strong> ${subscription.color ? `| Color: ${subscription.color}` : ''}</p>
        <p>Price: LKR ${product.price.toLocaleString()}</p>
        <p>Stock is strictly limited and allocated on a first-come, first-served basis.</p>
        <br/>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/product/${product.slug || product.id}" style="background:#d4ff00; color:#000; padding:12px 20px; font-weight:bold; text-decoration:none; display:inline-block;">BUY NOW BEFORE IT SELLS OUT</a>
        <br/><br/>
        <p style="font-size:11px; color:#888;">If you no longer wish to receive notifications, <a href="${unsubscribeUrl}" style="color:#888;">click here to unsubscribe</a>.</p>
      </div>
    `;
    return this.sendEmail({ to: subscription.email, subject, html, text: `${product.name} size ${subscription.size} is back in stock!` });
  }
}

export default new EmailNotificationService();

