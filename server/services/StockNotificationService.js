import prisma from '../config/db.js';
import emailService from './EmailNotificationService.js';

class StockNotificationService {
  async subscribe({ email, productId, size, color, userId }) {
    if (!email || !productId || !size) {
      const err = new Error('Email, productId, and size are required');
      err.status = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanSize = size.trim().toUpperCase();

    const existing = await prisma.stockNotification.findFirst({
      where: {
        email: cleanEmail,
        productId,
        size: cleanSize,
        status: 'active',
      },
    });

    if (existing) {
      return { message: 'You are already subscribed to restock alerts for this variant.', subscription: existing };
    }

    const subscription = await prisma.stockNotification.create({
      data: {
        email: cleanEmail,
        productId,
        size: cleanSize,
        color: color || null,
        userId: userId || null,
        status: 'active',
      },
      include: {
        product: { select: { name: true, price: true } },
      },
    });

    return { message: 'Subscribed successfully. We will notify you the moment this piece returns.', subscription };
  }

  async unsubscribe(id) {
    const updated = await prisma.stockNotification.update({
      where: { id },
      data: { status: 'unsubscribed' },
    });
    return updated;
  }

  async checkAndNotifyRestock(productId, size, newStock) {
    if (newStock <= 0) return { notifiedCount: 0 };

    const matchingSubs = await prisma.stockNotification.findMany({
      where: {
        productId,
        size,
        status: 'active',
      },
      include: {
        product: true,
      },
    });

    if (!matchingSubs.length) return { notifiedCount: 0 };

    let notifiedCount = 0;
    const now = new Date();

    for (const sub of matchingSubs) {
      try {
        await emailService.sendBackInStockNotification(sub, sub.product);
        await prisma.stockNotification.update({
          where: { id: sub.id },
          data: {
            status: 'notified',
            notifiedAt: now,
          },
        });
        notifiedCount++;
      } catch (err) {
        console.error(`Failed to send restock alert to ${sub.email}:`, err.message);
      }
    }

    return { notifiedCount };
  }

  async getAdminStockInsights() {
    const [allSubscriptions, demandByProduct] = await Promise.all([
      prisma.stockNotification.findMany({
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
          user: { select: { id: true, realName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.stockNotification.groupBy({
        by: ['productId', 'size'],
        where: { status: 'active' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
    ]);

    const productIds = [...new Set(demandByProduct.map((d) => d.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, imageUrl: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const enrichedDemand = demandByProduct.map((d) => ({
      ...d,
      count: d._count.id,
      product: productMap.get(d.productId) || { name: 'Unknown Product' },
    }));

    return {
      subscriptions: allSubscriptions,
      demand: enrichedDemand,
    };
  }
}

export default new StockNotificationService();

