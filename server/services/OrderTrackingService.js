import prisma from '../config/db.js';
import emailService from './EmailNotificationService.js';

export const ORDER_STATUS_WORKFLOW = [
  'Pending',
  'Confirmed',
  'Processing',
  'PreparingForShipment',
  'Shipped',
  'OutForDelivery',
  'Delivered',
  'Cancelled',
  'DeliveryFailed',
  'Returned',
];

class OrderTrackingService {
  normalizeStatus(status) {
    const map = {
      'Order Placed': 'Pending',
      'Payment Confirmed': 'Confirmed',
      'Preparing for Shipment': 'PreparingForShipment',
      'Out for Delivery': 'OutForDelivery',
      'Delivery Failed': 'DeliveryFailed',
    };
    return map[status] || status;
  }

  isValidStatusTransition(currentStatus, nextStatus) {
    const curr = this.normalizeStatus(currentStatus);
    const next = this.normalizeStatus(nextStatus);
    if (curr === next) return true;
    const currIdx = ORDER_STATUS_WORKFLOW.indexOf(curr);
    const nextIdx = ORDER_STATUS_WORKFLOW.indexOf(next);
    if (currIdx === -1 || nextIdx === -1) return false;
    // Terminal states cannot move backwards
    if (curr === 'Delivered' || curr === 'Cancelled' || curr === 'Returned') return false;
    return true;
  }

  async getOrderTracking(orderId, user) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, realName: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: { select: { id: true, name: true, slug: true, imageUrl: true } },
          },
        },
        shippingAddress: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!order) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    const isAdmin =
      user &&
      (user.role === 'admin' ||
        user.role === 'owner' ||
        user.email === process.env.ADMIN_EMAIL ||
        user.email === process.env.OWNER_EMAIL);

    if (!isAdmin && order.userId !== user?.id) {
      const error = new Error('Not authorized to access this order');
      error.status = 403;
      throw error;
    }

    return order;
  }

  async updateTracking(orderId, updateData, user) {
    const {
      status,
      description,
      courierName,
      trackingNumber,
      estimatedDelivery,
      internalNotes,
      location,
    } = updateData;

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!existing) {
      const error = new Error('Order not found');
      error.status = 404;
      throw error;
    }

    const targetStatus = status || existing.status;
    const now = new Date();

    const orderUpdatePayload = {
      status: targetStatus,
      updatedAt: now,
    };

    if (courierName !== undefined) orderUpdatePayload.courierName = courierName;
    if (trackingNumber !== undefined) orderUpdatePayload.trackingNumber = trackingNumber;
    if (estimatedDelivery !== undefined) {
      orderUpdatePayload.estimatedDelivery = estimatedDelivery ? new Date(estimatedDelivery) : null;
    }
    if (internalNotes !== undefined) orderUpdatePayload.internalNotes = internalNotes;

    if (targetStatus === 'Shipped' && !existing.shippedAt) {
      orderUpdatePayload.shippedAt = now;
    }
    if (targetStatus === 'Delivered') {
      orderUpdatePayload.deliveredAt = now;
      orderUpdatePayload.isPaid = true;
      if (!existing.paidAt) orderUpdatePayload.paidAt = now;
    }

    const [updatedOrder, newEvent] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: orderUpdatePayload,
        include: {
          user: { select: { id: true, realName: true, email: true } },
          shippingAddress: true,
          orderItems: true,
        },
      }),
      prisma.orderTrackingEvent.create({
        data: {
          orderId,
          status: targetStatus,
          description: description || `Order status updated to ${targetStatus}.`,
          courierName: courierName || existing.courierName || null,
          trackingNumber: trackingNumber || existing.trackingNumber || null,
          location: location || null,
          updatedBy: user?.realName || user?.username || 'Staff Administrator',
          timestamp: now,
        },
      }),
    ]);

    emailService.sendTrackingUpdate(updatedOrder, newEvent).catch((err) => {
      console.warn('Background email tracking notification deferred:', err.message);
    });

    return { order: updatedOrder, event: newEvent };
  }
}

export default new OrderTrackingService();
