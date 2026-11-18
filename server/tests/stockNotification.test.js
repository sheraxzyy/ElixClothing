import assert from 'assert';
import stockNotificationService from '../services/StockNotificationService.js';
import prisma from '../config/db.js';

export async function runStockNotificationTests() {
  console.log('\n--- Running Stock Notification & Restock Alert Tests ---');

  const testProduct = await prisma.product.findFirst();
  if (!testProduct) {
    console.log('ℹ Notice: No product found to test stock notification');
    return true;
  }

  const testEmail = `waitlist_tester_${Date.now()}@example.com`;
  const testSize = 'L';

  // Test 1: Subscribe to waitlist
  const res1 = await stockNotificationService.subscribe({
    email: testEmail,
    productId: testProduct.id,
    size: testSize,
  });
  assert.ok(res1.subscription, 'Subscription record must be created');
  assert.strictEqual(res1.subscription.email, testEmail);
  assert.strictEqual(res1.subscription.status, 'active');
  console.log('✓ Test 1 Passed: Successfully subscribed customer to back-in-stock waitlist');

  // Test 2: Idempotent duplicate subscription prevention
  const res2 = await stockNotificationService.subscribe({
    email: testEmail,
    productId: testProduct.id,
    size: testSize,
  });
  assert.strictEqual(res2.subscription.id, res1.subscription.id, 'Duplicate request must return existing record');
  console.log('✓ Test 2 Passed: Duplicate waitlist request properly deduplicated');

  // Clean up test entry
  await prisma.stockNotification.delete({
    where: { id: res1.subscription.id },
  });

  return true;
}

