import prisma from '../config/db.js';

class DropService {
  computeDropStatus(drop) {
    if (!drop.published) return drop.status === 'Draft' ? 'Draft' : drop.status;
    if (drop.status === 'Cancelled') return 'Cancelled';

    const now = new Date();
    const scheduled = new Date(drop.scheduledAt);

    if (drop.status === 'Live' || scheduled <= now) {
      const hasStock = drop.products?.some(
        (dp) => dp.exclusiveStock > 0 || (dp.product?.sizes?.some((s) => s.stock > 0))
      );
      if (drop.products?.length > 0 && !hasStock) {
        return 'SoldOut';
      }
      return 'Live';
    }

    return 'Upcoming';
  }

  async getPublicDrops() {
    const rawDrops = await prisma.drop.findMany({
      where: { published: true },
      include: {
        products: {
          include: {
            product: {
              include: {
                sizes: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    const now = new Date();
    const activeDrops = [];
    const upcomingDrops = [];
    const previousDrops = [];

    for (const drop of rawDrops) {
      const computedStatus = this.computeDropStatus(drop);
      const enhancedDrop = {
        ...drop,
        serverTime: now.toISOString(),
        computedStatus,
      };

      if (computedStatus === 'Live') {
        activeDrops.push(enhancedDrop);
      } else if (computedStatus === 'Upcoming' || computedStatus === 'Scheduled') {
        upcomingDrops.push(enhancedDrop);
      } else {
        previousDrops.push(enhancedDrop);
      }
    }

    return {
      serverTime: now.toISOString(),
      active: activeDrops,
      upcoming: upcomingDrops,
      previous: previousDrops,
    };
  }

  async getDropBySlugOrId(identifier) {
    const drop = await prisma.drop.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                sizes: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!drop) {
      const err = new Error('Drop not found');
      err.status = 404;
      throw err;
    }

    const computedStatus = this.computeDropStatus(drop);
    return {
      ...drop,
      serverTime: new Date().toISOString(),
      computedStatus,
    };
  }

  async getAllDropsAdmin() {
    return prisma.drop.findMany({
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, imageUrl: true, sizes: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDrop(data) {
    const { title, slug, description, banner, scheduledAt, timezone, status, published, productIds } = data;

    const formattedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    return prisma.drop.create({
      data: {
        title,
        slug: formattedSlug,
        description: description || '',
        banner: banner || '/images/hero-drop.jpg',
        scheduledAt: new Date(scheduledAt || Date.now() + 86400000),
        timezone: timezone || 'Asia/Colombo',
        status: status || 'Upcoming',
        published: published !== undefined ? published : true,
        products: productIds?.length
          ? {
              create: productIds.map((p) => ({
                productId: typeof p === 'string' ? p : p.productId,
                exclusiveStock: typeof p === 'object' && p.stock ? Number(p.stock) : 50,
                dropPrice: typeof p === 'object' && p.price ? Number(p.price) : null,
              })),
            }
          : undefined,
      },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
  }

  async updateDrop(id, data) {
    const { title, slug, description, banner, scheduledAt, timezone, status, published, productIds } = data;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title;
    if (slug !== undefined) updatePayload.slug = slug;
    if (description !== undefined) updatePayload.description = description;
    if (banner !== undefined) updatePayload.banner = banner;
    if (scheduledAt !== undefined) updatePayload.scheduledAt = new Date(scheduledAt);
    if (timezone !== undefined) updatePayload.timezone = timezone;
    if (status !== undefined) updatePayload.status = status;
    if (published !== undefined) updatePayload.published = published;

    return prisma.$transaction(async (tx) => {
      if (Array.isArray(productIds)) {
        await tx.dropProduct.deleteMany({ where: { dropId: id } });
        if (productIds.length > 0) {
          await tx.dropProduct.createMany({
            data: productIds.map((p) => ({
              dropId: id,
              productId: typeof p === 'string' ? p : p.productId,
              exclusiveStock: typeof p === 'object' && p.stock ? Number(p.stock) : 50,
              dropPrice: typeof p === 'object' && p.price ? Number(p.price) : null,
            })),
          });
        }
      }

      return tx.drop.update({
        where: { id },
        data: updatePayload,
        include: {
          products: {
            include: { product: true },
          },
        },
      });
    });
  }

  async deleteDrop(id) {
    return prisma.drop.delete({ where: { id } });
  }

  async decrementVariantStock(productId, size, quantity) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productSize.findFirst({
        where: { productId, size },
      });

      if (!variant || variant.stock < quantity) {
        throw new Error(`Insufficient stock for product size ${size}. Remaining: ${variant ? variant.stock : 0}`);
      }

      const updated = await tx.productSize.update({
        where: { id: variant.id },
        data: { stock: { decrement: quantity } },
      });

      return updated;
    });
  }
}

export default new DropService();

