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
  const { orderItems, shippingAddress, discountCode, paymentMethod } = req.body;

  if (!orderItems?.length || !shippingAddress) {
    res.status(400);
    throw new Error('Order items and shipping address are required.');
  }

  // ── resolve user (authenticated or guest customer) ────────────────────────
  let userId = req.user?.id;
  if (!userId) {
    const customerEmail = (
      req.body.user?.email ||
      req.body.email ||
      shippingAddress.email ||
      ''
    ).trim().toLowerCase();

    const customerName = (
      shippingAddress.fullName ||
      req.body.user?.realName ||
      req.body.user?.name ||
      'Guest Customer'
    ).trim();

    if (customerEmail) {
      let customer = await prisma.user.findUnique({
        where: { email: customerEmail },
      });
      if (!customer) {
        const generatedUsername =
          customerEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') +
          '_' +
          Math.random().toString(36).substring(2, 6);
        customer = await prisma.user.create({
          data: {
            realName: customerName,
            username: generatedUsername,
            email: customerEmail,
            role: 'customer',
            provider: 'email',
            phone: shippingAddress.phone || null,
          },
        });
      }
      userId = customer.id;
    } else {
      let defaultGuest = await prisma.user.findFirst({
        where: { email: 'guest@elix.lk' },
      });
      if (!defaultGuest) {
        defaultGuest = await prisma.user.create({
          data: {
            realName: customerName || 'Guest Customer',
            username: 'guest_' + Math.random().toString(36).substring(2, 7),
            email: 'guest@elix.lk',
            role: 'customer',
            provider: 'system',
          },
        });
      }
      userId = defaultGuest.id;
    }
  }

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0
  );
  const deliveryFee = Number(req.body.deliveryFee) >= 0 ? Number(req.body.deliveryFee) : 250;
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

    await prisma.discount.update({
      where: { id: discount.id },
      data:  { usedCount: { increment: 1 } },
    });
  }

  const totalPrice = Math.max(0, itemsPrice + deliveryFee - discountAmount);

  // ── resolve valid product IDs & clean sizes for OrderItem relations ───────
  const VALID_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const allDbProducts = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
  });
  const fallbackProduct = allDbProducts[0];

  const processedItems = orderItems.map((item) => {
    let targetProductId = item.productId || item.id;
    // If composite key like "cmv...-L-Black", strip suffixes
    if (typeof targetProductId === 'string' && targetProductId.includes('-')) {
      const parts = targetProductId.split('-');
      const matched = allDbProducts.find((p) => p.id === parts[0]);
      if (matched) {
        targetProductId = matched.id;
      }
    }

    // Verify existence in DB
    let validProd = allDbProducts.find((p) => p.id === targetProductId);
    if (!validProd && item.slug) {
      validProd = allDbProducts.find((p) => p.slug === item.slug);
    }
    if (!validProd && item.name) {
      validProd = allDbProducts.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
    }
    if (!validProd && fallbackProduct) {
      validProd = fallbackProduct;
    }

    const rawSize = (item.size || '').toString().trim().toUpperCase();
    const size = VALID_SIZES.includes(rawSize) ? rawSize : null;

    return {
      productId: validProd ? validProd.id : targetProductId,
      name:      item.name || validProd?.name || 'SheXz Apparel',
      image:     item.image || '/images/products/remorse-tee.jpg',
      price:     Number(item.price) || 0,
      quantity:  Math.max(1, Math.round(Number(item.quantity) || 1)),
      size,
      color:     item.color || null,
    };
  });

  // ── create order with nested items + shipping address ─────────────────────
  const order = await prisma.order.create({
    data: {
      userId,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice,
      deliveryFee,
      discountAmount,
      totalPrice,
      status: 'Pending',
      orderItems: {
        create: processedItems,
      },
      shippingAddress: {
        create: {
          fullName:   shippingAddress.fullName || 'Customer',
          phone:      shippingAddress.phone || '',
          street:     shippingAddress.street || '',
          city:       shippingAddress.city || 'Colombo',
          postalCode: shippingAddress.postalCode || '',
        },
      },
    },
    include: {
      user: {
        select: { id: true, realName: true, email: true, phone: true },
      },
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
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@elix.lk').toLowerCase();
  const ownerEmail = (process.env.OWNER_EMAIL || 'sheranadeesha39@gmail.com').toLowerCase();
  const userEmail = (req.user?.email || '').toLowerCase();

  const isAdmin =
    req.user?.role === 'admin' ||
    req.user?.role === 'owner' ||
    userEmail === adminEmail ||
    userEmail === ownerEmail;

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: req.user.id },
    include: {
      user:            { select: { id: true, realName: true, email: true, phone: true } },
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
