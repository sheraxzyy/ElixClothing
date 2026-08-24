/**
 * ELIX — Prisma Seed (TypeScript)
 *
 * Run:  npx ts-node --esm prisma/seed.ts
 *   or: npm run seed   (after adding script to package.json)
 *
 * Seeds:
 *  - Store Owner + Admin accounts
 *  - Sample products with sizes & gallery images
 *  - Discount codes
 */

import { PrismaClient, Role, Provider, DiscountType, Size } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── seed data ───────────────────────────────────────────────────────────────

const MASTER_PASSWORD = 'March3@2211';

const ADMIN_USERS = [
  {
    realName: 'Store Owner',
    username:  'store_owner',
    email:     'sheranadeesha39@gmail.com',
    role:      Role.owner,
    points:    100000,
  },
  {
    realName: 'ELIX Admin',
    username:  'elix_admin',
    email:     'admin@elix.lk',
    role:      Role.admin,
    points:    50000,
  },
];

const PRODUCTS: Array<{
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  priority: number;
  category: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  additionalImages: string[];
  sizes: Array<{ size: Size; stock: number }>;
}> = [
  {
    name:        'ELIX Oversized 01',
    description: 'A premium oversized streetwear tee with bold minimal branding and relaxed island-ready fit.',
    imageUrl:    '/assets/placeholder-1.jpg',
    price:       4200,
    priority:    1,
    category:    'T-Shirts',
    isFeatured:  true,
    isBestSeller: true,
    additionalImages: [],
    sizes: [
      { size: Size.S,   stock: 12 },
      { size: Size.M,   stock: 16 },
      { size: Size.L,   stock: 14 },
      { size: Size.XL,  stock: 9  },
      { size: Size.XXL, stock: 5  },
    ],
  },
  {
    name:        'ELIX Shadow',
    description: 'Premium oversized black tee with subtle tonal print, elevated for a refined street edit.',
    imageUrl:    '/assets/placeholder-2.jpg',
    price:       4500,
    priority:    2,
    category:    'T-Shirts',
    isFeatured:  true,
    isBestSeller: true,
    additionalImages: [],
    sizes: [
      { size: Size.M,   stock: 10 },
      { size: Size.L,   stock: 11 },
      { size: Size.XL,  stock: 8  },
      { size: Size.XXL, stock: 4  },
    ],
  },
  {
    name:        'ELIX Core',
    description: 'A refined oversized essential crafted for premium comfort and statement layering.',
    imageUrl:    '/assets/placeholder-3.jpg',
    price:       3900,
    priority:    3,
    category:    'T-Shirts',
    isFeatured:  false,
    isBestSeller: false,
    additionalImages: [],
    sizes: [
      { size: Size.S,  stock: 9  },
      { size: Size.M,  stock: 14 },
      { size: Size.L,  stock: 12 },
      { size: Size.XL, stock: 7  },
    ],
  },
];

const DISCOUNTS: Array<{
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  daysUntilExpiry: number;
  usageLimit: number;
}> = [
  {
    code:            'ELIX10',
    description:     '10% off your first order.',
    type:            DiscountType.percentage,
    value:           10,
    daysUntilExpiry: 30,
    usageLimit:      100,
  },
  {
    code:            'STREET50',
    description:     'LKR 500 off streetwear essentials.',
    type:            DiscountType.fixed,
    value:           500,
    daysUntilExpiry: 60,
    usageLimit:      50,
  },
];

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting ELIX seed...');

  // ── 1. Admin / Owner users ──────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 12);

  for (const adminData of ADMIN_USERS) {
    await prisma.user.upsert({
      where:  { email: adminData.email },
      update: {},
      create: {
        realName: adminData.realName,
        username:  adminData.username,
        email:     adminData.email,
        password:  hashedPassword,
        role:      adminData.role,
        provider:  Provider.email,
        points:    adminData.points,
        isDemo:    false,
      },
    });
    console.log(`  ✓ User seeded: ${adminData.email} (${adminData.role})`);
  }

  // ── 2. Products ─────────────────────────────────────────────────────────────
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);

    const product = await prisma.product.upsert({
      where:  { slug },
      update: {
        name:         p.name,
        description:  p.description,
        imageUrl:     p.imageUrl,
        price:        p.price,
        priority:     p.priority,
        category:     p.category,
        isFeatured:   p.isFeatured,
        isBestSeller: p.isBestSeller,
      },
      create: {
        name:         p.name,
        slug,
        description:  p.description,
        imageUrl:     p.imageUrl,
        price:        p.price,
        priority:     p.priority,
        category:     p.category,
        isFeatured:   p.isFeatured,
        isBestSeller: p.isBestSeller,
      },
    });

    // Gallery images (delete & re-insert for idempotency)
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (p.additionalImages.length) {
      await prisma.productImage.createMany({
        data: p.additionalImages.map((url) => ({ productId: product.id, url })),
      });
    }

    // Sizes & stock (upsert per size)
    for (const s of p.sizes) {
      await prisma.productSize.upsert({
        where:  { productId_size: { productId: product.id, size: s.size } },
        update: { stock: s.stock },
        create: { productId: product.id, size: s.size, stock: s.stock },
      });
    }

    console.log(`  ✓ Product seeded: ${p.name}`);
  }

  // ── 3. Discounts ────────────────────────────────────────────────────────────
  for (const d of DISCOUNTS) {
    const expiryDate = new Date(
      Date.now() + d.daysUntilExpiry * 24 * 60 * 60 * 1000
    );

    await prisma.discount.upsert({
      where:  { code: d.code },
      update: { active: true, expiryDate, usageLimit: d.usageLimit },
      create: {
        code:        d.code,
        description: d.description,
        type:        d.type,
        value:       d.value,
        expiryDate,
        usageLimit:  d.usageLimit,
        active:      true,
      },
    });
    console.log(`  ✓ Discount seeded: ${d.code}`);
  }

  console.log('\n✅  Seed complete!');
  console.log('   Store Owner  →  sheranadeesha39@gmail.com');
  console.log('   Admin        →  admin@elix.lk');
  console.log(`   Password     →  ${MASTER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌  Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
