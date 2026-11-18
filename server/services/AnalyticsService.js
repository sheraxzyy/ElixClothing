import prisma from '../config/db.js';

class AnalyticsService {
  getDateRange(filter = '30days', startDate, endDate) {
    const now = new Date();
    let start = new Date();
    let end = new Date(now);

    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (startDate) start = new Date(startDate);
        if (endDate) end = new Date(endDate);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  async getDashboardAnalytics({ filter = '30days', startDate, endDate } = {}) {
    const { start, end } = this.getDateRange(filter, startDate, endDate);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, price: true, costPrice: true } },
          },
        },
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalCustomers = await prisma.user.count({ where: { role: 'customer' } });

    const allSizes = await prisma.productSize.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true } },
      },
    });

    const lowStockThreshold = 5;
    const lowStockSizes = allSizes.filter((s) => s.stock > 0 && s.stock <= lowStockThreshold);
    const outOfStockSizes = allSizes.filter((s) => s.stock === 0);

    let totalRevenue = 0;
    let grossSales = 0;
    let netSales = 0;
    let refundTotals = 0;
    let completedOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let estimatedCostOfGoods = 0;

    const sizeDistribution = {};
    const colorDistribution = {};
    const productSalesMap = {};
    const customerOrderCounts = {};
    const revenueByDayMap = {};

    orders.forEach((order) => {
      const isCancelled = order.status === 'Cancelled' || order.status === 'DeliveryFailed';
      const isDelivered = order.status === 'Delivered';
      const isPending = order.status === 'Pending' || order.status === 'Order Placed';

      if (isDelivered) deliveredOrdersCount++;
      if (isPending) pendingOrdersCount++;
      if (isCancelled) {
        cancelledOrdersCount++;
        refundTotals += order.totalPrice;
        return;
      }

      completedOrdersCount++;
      totalRevenue += order.totalPrice;
      grossSales += order.itemsPrice + order.deliveryFee;
      netSales += order.totalPrice;

      const dayKey = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDayMap[dayKey]) {
        revenueByDayMap[dayKey] = { date: dayKey, revenue: 0, orders: 0 };
      }
      revenueByDayMap[dayKey].revenue += order.totalPrice;
      revenueByDayMap[dayKey].orders += 1;

      if (order.userId) {
        customerOrderCounts[order.userId] = (customerOrderCounts[order.userId] || 0) + 1;
      }

      order.orderItems.forEach((item) => {
        const itemSize = item.size || 'Standard';
        const itemColor = item.color || 'Standard';
        const units = item.quantity || 1;
        const subtotal = item.price * units;

        sizeDistribution[itemSize] = (sizeDistribution[itemSize] || 0) + units;
        colorDistribution[itemColor] = (colorDistribution[itemColor] || 0) + units;

        const prodId = item.productId;
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = {
            id: prodId,
            name: item.name,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[prodId].unitsSold += units;
        productSalesMap[prodId].revenue += subtotal;

        const unitCost = item.product?.costPrice || (item.price * 0.4);
        estimatedCostOfGoods += unitCost * units;
      });
    });

    const averageOrderValue = completedOrdersCount > 0 ? Math.round(totalRevenue / completedOrdersCount) : 0;
    const estimatedProfit = Math.max(0, netSales - estimatedCostOfGoods);

    const repeatCustomerCount = Object.values(customerOrderCounts).filter((count) => count > 1).length;
    const totalOrderingCustomers = Object.keys(customerOrderCounts).length;
    const repeatCustomerRate = totalOrderingCustomers > 0
      ? Math.round((repeatCustomerCount / totalOrderingCustomers) * 100)
      : 0;

    const revenueByPeriod = Object.values(revenueByDayMap).sort((a, b) => a.date.localeCompare(b.date));
    const salesBySize = Object.entries(sizeDistribution).map(([size, count]) => ({ size, count }));
    const salesByColor = Object.entries(colorDistribution).map(([color, count]) => ({ color, count }));
    const topProducts = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);

    return {
      overview: {
        totalRevenue,
        grossSales,
        netSales,
        totalOrders: orders.length,
        totalCustomers,
        averageOrderValue,
        deliveredOrders: deliveredOrdersCount,
        pendingOrders: pendingOrdersCount,
        cancelledOrders: cancelledOrdersCount,
        refundTotals,
        lowStockCount: lowStockSizes.length,
        repeatCustomerRate,
        estimatedProfit,
      },
      charts: {
        revenueByPeriod,
        salesBySize,
        salesByColor,
        topProducts,
      },
      inventoryInsights: {
        lowStockProducts: lowStockSizes.slice(0, 15),
        outOfStockProducts: outOfStockSizes.slice(0, 15),
      },
    };
  }

  async generateOrdersCSV({ filter = '30days', startDate, endDate } = {}) {
    const { start, end } = this.getDateRange(filter, startDate, endDate);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: { select: { realName: true, email: true } },
        shippingAddress: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'City',
      'Status',
      'Items Count',
      'Payment Method',
      'Total (LKR)',
      'Courier',
      'Tracking Number',
    ];

    const rows = orders.map((o) => {
      const itemsCount = o.orderItems.reduce((acc, i) => acc + i.quantity, 0);
      return [
        `"${o.id}"`,
        `"${o.createdAt.toISOString()}"`,
        `"${(o.shippingAddress?.fullName || o.user?.realName || 'Customer').replace(/"/g, '""')}"`,
        `"${(o.user?.email || '').replace(/"/g, '""')}"`,
        `"${(o.shippingAddress?.phone || '').replace(/"/g, '""')}"`,
        `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
        `"${o.status}"`,
        itemsCount,
        `"${o.paymentMethod}"`,
        o.totalPrice,
        `"${(o.courierName || '').replace(/"/g, '""')}"`,
        `"${(o.trackingNumber || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export default new AnalyticsService();

