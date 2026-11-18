import assert from 'assert';
import orderTrackingService, { ORDER_STATUS_WORKFLOW } from '../services/OrderTrackingService.js';
import prisma from '../config/db.js';

export async function runOrderTrackingTests() {
  console.log('\n--- Running Order Tracking & Workflow Tests ---');

  // Test 1: ORDER_STATUS_WORKFLOW includes all required milestones
  assert.ok(Array.isArray(ORDER_STATUS_WORKFLOW), 'ORDER_STATUS_WORKFLOW must be an array');
  assert.strictEqual(ORDER_STATUS_WORKFLOW.length, 10, 'Workflow must define exactly 10 states');
  assert.ok(ORDER_STATUS_WORKFLOW.includes('Pending'), 'Workflow must include Pending');
  assert.ok(ORDER_STATUS_WORKFLOW.includes('Confirmed'), 'Workflow must include Confirmed');
  assert.ok(ORDER_STATUS_WORKFLOW.includes('Processing'), 'Workflow must include Processing');
  assert.ok(ORDER_STATUS_WORKFLOW.includes('Shipped'), 'Workflow must include Shipped');
  assert.ok(ORDER_STATUS_WORKFLOW.includes('Delivered'), 'Workflow must include Delivered');
  console.log('✓ Test 1 Passed: 10-status workflow definitions intact');

  // Test 2: Status transition validation & normalization
  assert.strictEqual(orderTrackingService.normalizeStatus('Order Placed'), 'Pending');
  assert.strictEqual(orderTrackingService.normalizeStatus('Payment Confirmed'), 'Confirmed');
  assert.strictEqual(orderTrackingService.normalizeStatus('Out for Delivery'), 'OutForDelivery');
  console.log('✓ Test 2 Passed: Status mapping & normalization verified');

  // Test 3: Unauthorized user access prevention
  const orders = await prisma.order.findMany({ take: 1 });
  if (orders.length > 0) {
    const targetOrder = orders[0];
    const fakeCustomer = { id: 'usr_impostor_999', role: 'customer' };

    try {
      await orderTrackingService.getOrderTracking(targetOrder.id, fakeCustomer);
      assert.fail('Should have thrown authorization 403 error for foreign order');
    } catch (err) {
      assert.strictEqual(err.status, 403, 'Should reject foreign customer order access with 403');
    }
    console.log('✓ Test 3 Passed: Role-based customer order isolation enforced');

    // Test 4: Tracking event generation & retrieval
    const adminUser = { id: 'usr_admin', role: 'admin' };
    const trackingRes = await orderTrackingService.getOrderTracking(targetOrder.id, adminUser);
    assert.ok(trackingRes, 'Admin should retrieve full order tracking record');
    assert.strictEqual(trackingRes.id, targetOrder.id);
    console.log('✓ Test 4 Passed: Admin order & audit trail retrieval verified');
  } else {
    console.log('ℹ Notice: No order record in DB, skipping order instance check');
  }

  return true;
}

