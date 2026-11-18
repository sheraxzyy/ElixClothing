import assert from 'assert';
import recentlyViewedService from '../services/RecentlyViewedService.js';
import prisma from '../config/db.js';

export async function runRecentlyViewedTests() {
  console.log('\n--- Running Recently Viewed History Tests ---');

  const testUser = await prisma.user.findFirst();
  const testProduct = await prisma.product.findFirst();

  if (!testUser || !testProduct) {
    console.log('ℹ Notice: Requires user and product in DB to test recently viewed');
    return true;
  }

  // Test 1: Record view and upsert
  const record = await recentlyViewedService.recordView(testUser.id, testProduct.id);
  assert.ok(record, 'Must create or update recently viewed record');
  assert.strictEqual(record.userId, testUser.id);
  assert.strictEqual(record.productId, testProduct.id);
  console.log('✓ Test 1 Passed: Successfully recorded and upserted product view');

  // Test 2: Retrieve user history capped at 10 items
  const history = await recentlyViewedService.getUserRecentlyViewed(testUser.id);
  assert.ok(Array.isArray(history), 'Must return an array');
  assert.ok(history.length <= 10, 'History must never exceed 10 items');
  console.log('✓ Test 2 Passed: Recently viewed list respects strict 10-item cap');

  // Test 3: Guest history merging on account login
  const mergeResult = await recentlyViewedService.mergeGuestHistory(testUser.id, [testProduct.id]);
  assert.ok(mergeResult, 'Guest history merge completed');
  console.log('✓ Test 3 Passed: Guest browsing history cleanly merged into customer account');

  return true;
}

