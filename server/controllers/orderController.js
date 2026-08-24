import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/orders   (protected — logged-in customers)
//  Body: { orderItems, shippingAddress, discountCode? }
//
//  orderItems: [{ productId, name, image, price, quantity, size?, color? }]
//  shippingAddress: { fullName, phone, street, city, postalCode }
// ─────────────────────────────────────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, discountCode } = req.body;

  if (!orderItems?.length || !shippingAddress) {
    res.status(400);
    throw new Error('Order items and shipping address are required.');
  }

  const itemsPrice   = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const deliveryFee  = 250;
  let   discountAmount = 0;

  // ── validate & apply discount code ────────────────────────────────────────
  if (discountCode) {
    const discount = await prisma.discount.findUnique({
      where: { code: discountCode.toUpperCase() },
    });

    if (
      !discount ||
      !discount.active ||
      discount.expiryDate < new Date() ||
      (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit)
    ) {
      res.status(400);
      throw new Error('Invalid or expired discount code.');
    }

    discountAmount =
      discount.type === 'percentage'
        ? Math.min((itemsPrice * discount.value) / 100, itemsPrice)
        : Math.min(discount.value, itemsPrice);

    // Increment used count
    await prisma.discount.update({
      where: { id: discount.id },
      data:  { usedCount: { increment: 1 } },
    });
  }

  const totalPrice = itemsPrice + deliveryFee - discountAmount;

  // ── create order with nested items + shipping address ─────────────────────
  const order = await prisma.order.create({
    data: {
      userId:        req.user.id,
      itemsPrice,
      deliveryFee,
      discountAmount,
      totalPrice,
      orderItems: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          name:      item.name,
          image:     item.image,
          price:     Number(item.price),
          quantity:  Number(item.quantity),
          size:      item.size   || null,
          color:     item.color  || null,
        })),
      },
      shippingAddress: {
        create: {
          fullName:   shippingAddress.fullName,
          phone:      shippingAddress.phone,
          street:     shippingAddress.street,
          city:       shippingAddress.city,
          postalCode: shippingAddress.postalCode,
        },
      },
    },
    include: {
      orderItems:      true,
      shippingAddress: true,
    },
  });

  res.status(201).json(order);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/orders   (protected — own orders for customers, all for admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getOrders = asyncHandler(async (req, res) => {
  const isAdmin =
    req.user.role === 'admin' || req.user.role === 'owner';

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: req.user.id },
    include: {
      user:            { select: { id: true, realName: true, email: true } },
      orderItems:      true,
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/orders/:id   (protected)
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user:            { select: { id: true, realName: true, email: true } },
      orderItems:      true,
      shippingAddress: true,
    },
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  const isAdmin =
    req.user.role === 'admin' || req.user.role === 'owner';

  if (!isAdmin && order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this order.');
  }

  res.json(order);
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/orders/:id/status   (admin only)
//  Body: { status }
// ─────────────────────────────────────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id }     = req.params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  const data = { status };
  if (status === 'Delivered') data.deliveredAt = new Date();

  const updated = await prisma.order.update({
    where: { id },
    data,
    include: {
      orderItems:      true,
      shippingAddress: true,
    },
  });

  res.json(updated);
});
