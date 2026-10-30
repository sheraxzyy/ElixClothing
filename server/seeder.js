import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Discount from './models/Discount.js';

dotenv.config();

const products = [
  {
    name: 'SheXz Oversized 01',
    slug: 'shexz-oversized-01',
    description: 'A premium oversized streetwear tee with bold minimal branding and relaxed island-ready fit.',
    category: 'T-Shirts',
    price: 4200,
    images: ['/assets/placeholder-1.jpg'],
    availableColors: ['Black', 'White', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'S', stock: 12 },
      { size: 'M', stock: 16 },
      { size: 'L', stock: 14 },
      { size: 'XL', stock: 9 },
      { size: 'XXL', stock: 5 },
    ],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'SheXz Shadow',
    slug: 'shexz-shadow',
    description: 'Premium oversized black tee with subtle tonal print, elevated for a refined street edit.',
    category: 'T-Shirts',
    price: 4500,
    images: ['/assets/placeholder-2.jpg'],
    availableColors: ['Black'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    sizeStock: [
      { size: 'M', stock: 10 },
      { size: 'L', stock: 11 },
      { size: 'XL', stock: 8 },
      { size: 'XXL', stock: 4 },
    ],
    isFeatured: true,
    isBestSeller: true,
  },
  {
    name: 'SheXz Core',
    slug: 'shexz-core',
    description: 'A refined oversized essential crafted for premium comfort and statement layering.',
    category: 'T-Shirts',
    price: 3900,
    images: ['/assets/placeholder-3.jpg'],
    availableColors: ['White', 'Storm Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStock: [
      { size: 'S', stock: 9 },
      { size: 'M', stock: 14 },
      { size: 'L', stock: 12 },
      { size: 'XL', stock: 7 },
    ],
    isFeatured: false,
    isBestSeller: false,
  },
];

const discounts = [
  {
    code: 'ELIX10',
    type: 'percentage',
    value: 10,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    active: true,
    description: '10% off your first order.',
  },
  {
    code: 'STREET50',
    type: 'fixed',
    value: 500,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 50,
    active: true,
    description: 'LKR 500 off streetwear essentials.',
  },
];

const importData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Ensure server/.env exists with your MongoDB connection string.');
    }

    console.log('MONGO_URI:', process.env.MONGO_URI ? '[REDACTED]' : 'undefined');
    await connectDB();

    console.log('Clearing existing data...');

    await Product.deleteMany();
    await User.deleteMany();
    await Discount.deleteMany();

    const masterPassword = await bcrypt.hash('March3@2211', 12);

    await User.create([
      {
        name: 'Store Owner',
        email: 'Sheranadeesha39@gmail.com',
        password: masterPassword,
        role: 'owner',
        points: 100000,
      },
      {
        name: 'SheXz Admin',
        email: 'admin@elix.lk',
        password: masterPassword,
        role: 'admin',
        points: 50000,
      },
    ]);

    await Product.insertMany(products);
    await Discount.insertMany(discounts);

    console.log('Seed data imported successfully!');
    console.log('Store Owner email: Sheranadeesha39@gmail.com');
    console.log('Admin email: admin@elix.lk');
    console.log('Password for both accounts: March3@2211');

    process.exit(0);
  } catch (error) {
    console.error('Seed import error:', error.message);
    process.exit(1);
  }
};

importData();
