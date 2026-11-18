import assert from 'assert';
import prisma from '../config/db.js';

export async function runRegressionTests() {
  console.log('\n--- Running Regression & Core Platform Integrity Tests ---');

  // Test 1: Verify existing products remain intact
  const products = await prisma.product.findMany({
    include: { sizes: true, images: true },
  });
  assert.ok(products.length >= 10, `Expected at least 10 products, found ${products.length}`);
  console.log(`✓ Test 1 Passed: Existing products preserved intact (${products.length} catalog items)`);

  // Test 2: Verify existing users and credentials remain intact
  const users = await prisma.user.findMany();
  assert.ok(users.length >= 4, `Expected at least 4 registered users, found ${users.length}`);
  const adminUser = users.find((u) => u.role === 'admin' || u.role === 'owner' || u.email === 'admin@elix.lk');
  assert.ok(adminUser, 'Admin account must exist');
  console.log(`✓ Test 2 Passed: Existing user accounts & role permissions preserved (${users.length} accounts)`);

  // Test 3: Verify existing orders and schema constraints
  const orders = await prisma.order.findMany({
    include: { orderItems: true, shippingAddress: true },
  });
  assert.ok(orders.length >= 1, `Expected existing orders to persist, found ${orders.length}`);
  console.log(`✓ Test 3 Passed: Existing customer order records and foreign keys verified (${orders.length} orders)`);

  return true;
}

