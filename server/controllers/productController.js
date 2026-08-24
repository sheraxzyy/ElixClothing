import asyncHandler from 'express-async-handler';
import prisma from '../config/db.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Full product select — used consistently across all queries
 * so the API response shape is always the same.
 */
const productSelect = {
  id:          true,
  name:        true,
  slug:        true,
  description: true,
  imageUrl:    true,
  price:       true,
  priority:    true,
  category:    true,
  isFeatured:  true,
  isBestSeller: true,
  rating:      true,
  numReviews:  true,
  createdAt:   true,
  images:      { select: { id: true, url: true } },
  sizes:       { select: { size: true, stock: true } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products
//  Query: search, category, minPrice, maxPrice, sort, size
// ─────────────────────────────────────────────────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const { search = '', category, size, minPrice, maxPrice, sort } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'All' && category !== 'All T-Shirts') {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (size) {
    where.sizes = { some: { size } };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  let orderBy = [{ priority: 'asc' }, { createdAt: 'desc' }];
  if (sort === 'price-asc')  orderBy = { price: 'asc'  };
  if (sort === 'price-desc') orderBy = { price: 'desc' };
  if (sort === 'newest')     orderBy = { createdAt: 'desc' };
  if (sort === 'rating')     orderBy = { rating: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: 100,
    select: productSelect,
  });

  res.json(products);
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/:id  (Finds by ID or by Slug)
// ─────────────────────────────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id },
        { slug: id },
      ],
    },
    select: productSelect,
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  res.json(product);
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/products   (admin / owner only)
//  Required body: { imageUrl, name, description, price, priority }
//  Optional body: { category, slug, isFeatured, isBestSeller,
//                   additionalImages[], sizes[{size,stock}] }
// ─────────────────────────────────────────────────────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const {
    imageUrl,
    name,
    description,
    price,
    priority,
    // optional
    category      = 'T-Shirts',
    slug: rawSlug,
    isFeatured    = false,
    isBestSeller  = false,
    additionalImages = [],  // array of URL strings
    sizes = [],             // array of { size, stock }
  } = req.body;

  // ── required-field guard ──────────────────────────────────────────────────
  if (!imageUrl || !name || !description || price == null || priority == null) {
    res.status(400);
    throw new Error(
      'Required fields missing. Please provide: imageUrl, name, description, price, priority.'
    );
  }

  const slug = rawSlug && rawSlug.trim() ? rawSlug.trim().toLowerCase() : slugify(name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    res.status(400);
    throw new Error(`A product with slug "${slug}" already exists in the database.`);
  }

  const defaultSizes = sizes.length > 0 ? sizes : [
    { size: 'S', stock: 10 },
    { size: 'M', stock: 15 },
    { size: 'L', stock: 15 },
    { size: 'XL', stock: 10 },
    { size: 'XXL', stock: 5 },
  ];

  const product = await prisma.product.create({
    data: {
      name:        name.trim(),
      slug,
      description: description.trim(),
      imageUrl:    imageUrl.trim(),
      price:       Number(price),
      priority:    Number(priority),
      category:    category.trim() || 'T-Shirts',
      isFeatured:  Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      images: {
        create: (additionalImages || []).filter(Boolean).map((url) => ({ url: url.trim() })),
      },
      sizes: {
        create: defaultSizes.map(({ size, stock }) => ({
          size,
          stock: Number(stock) || 0,
        })),
      },
    },
    select: productSelect,
  });

  res.status(201).json(product);
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/products/:id   (admin / owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) {
    res.status(404);
    throw new Error('Product not found in database.');
  }

  const {
    name,
    description,
    imageUrl,
    price,
    priority,
    category,
    isFeatured,
    isBestSeller,
    additionalImages,
    sizes: newSizes,
  } = req.body;

  const data = {};
  if (name        !== undefined) data.name        = name.trim();
  if (description !== undefined) data.description = description.trim();
  if (imageUrl    !== undefined) data.imageUrl    = imageUrl.trim();
  if (price       !== undefined) data.price       = Number(price);
  if (priority    !== undefined) data.priority    = Number(priority);
  if (category    !== undefined) data.category    = category.trim();
  if (isFeatured  !== undefined) data.isFeatured  = Boolean(isFeatured);
  if (isBestSeller !== undefined) data.isBestSeller = Boolean(isBestSeller);

  // Replace gallery images if sent
  if (Array.isArray(additionalImages)) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    data.images = {
      create: additionalImages.filter(Boolean).map((url) => ({ url: url.trim() })),
    };
  }

  // Replace sizes if sent
  if (Array.isArray(newSizes)) {
    await prisma.productSize.deleteMany({ where: { productId: id } });
    data.sizes = {
      create: newSizes.map(({ size, stock }) => ({
        size,
        stock: Number(stock) || 0,
      })),
    };
  }

  const updated = await prisma.product.update({
    where:  { id },
    data,
    select: productSelect,
  });

  res.json(updated);
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/products/:id   (admin / owner only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) {
    res.status(404);
    throw new Error('Product not found in database.');
  }

  await prisma.product.delete({ where: { id } });
  res.json({ message: 'Product deleted from database successfully.' });
});
