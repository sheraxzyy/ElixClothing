import prisma from '../config/db.js';

class RecentlyViewedService {
  async recordView(userId, productId) {
    if (!userId || !productId) return null;

    const now = new Date();

    const record = await prisma.recentlyViewed.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        viewedAt: now,
      },
      create: {
        userId,
        productId,
        viewedAt: now,
      },
    });

    const userViews = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      select: { id: true },
    });

    if (userViews.length > 10) {
      const idsToDelete = userViews.slice(10).map((v) => v.id);
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    return record;
  }

  async getUserRecentlyViewed(userId) {
    if (!userId) return [];

    const history = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: {
        product: {
          include: {
            sizes: true,
            images: true,
          },
        },
      },
    });

    return history
      .filter((item) => item.product)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        viewedAt: item.viewedAt,
        product: {
          ...item.product,
          inStock: item.product.sizes?.some((s) => s.stock > 0),
          stockQuantity: item.product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0,
          images: item.product.images?.length
            ? item.product.images.map((img) => img.url)
            : [item.product.imageUrl],
        },
      }));
  }

  async mergeGuestHistory(userId, guestProductIds) {
    if (!userId || !Array.isArray(guestProductIds) || !guestProductIds.length) {
      return this.getUserRecentlyViewed(userId);
    }

    const uniqueProductIds = [...new Set(guestProductIds)].slice(0, 10);
    const now = new Date();

    for (let i = 0; i < uniqueProductIds.length; i++) {
      const productId = uniqueProductIds[i];
      const timestamp = new Date(now.getTime() - i * 1000);
      try {
        await prisma.recentlyViewed.upsert({
          where: {
            userId_productId: { userId, productId },
          },
          update: {
            viewedAt: timestamp,
          },
          create: {
            userId,
            productId,
            viewedAt: timestamp,
          },
        });
      } catch (err) {
        // Ignore non-existent
      }
    }

    return this.getUserRecentlyViewed(userId);
  }

  async clearUserHistory(userId) {
    if (!userId) return;
    await prisma.recentlyViewed.deleteMany({
      where: { userId },
    });
  }
}

export default new RecentlyViewedService();

