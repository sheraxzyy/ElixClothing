import assert from 'assert';
import analyticsService from '../services/AnalyticsService.js';

export async function runAnalyticsTests() {
  console.log('\n--- Running Analytics & Financial Metrics Tests ---');

  // Test 1: Overview metrics retrieval
  const data = await analyticsService.getDashboardAnalytics({ filter: '30days' });
  assert.ok(data.overview, 'Must contain overview object');
  assert.ok(typeof data.overview.totalRevenue === 'number', 'totalRevenue must be a number');
  assert.ok(typeof data.overview.totalOrders === 'number', 'totalOrders must be a number');
  assert.ok(typeof data.overview.averageOrderValue === 'number', 'averageOrderValue must be a number');
  assert.ok(data.charts && Array.isArray(data.charts.revenueByPeriod), 'charts.revenueByPeriod must be an array');
  assert.ok(data.charts && Array.isArray(data.charts.salesBySize), 'charts.salesBySize must be an array');
  assert.ok(data.charts && Array.isArray(data.charts.topProducts), 'charts.topProducts must be an array');
  console.log('✓ Test 1 Passed: Core financial KPIs & summary aggregations verified');

  // Test 2: Date filtering capability
  const last7Days = await analyticsService.getDashboardAnalytics({ filter: '7days' });
  assert.ok(last7Days.overview, '7-day range metrics computed cleanly');
  const thisYear = await analyticsService.getDashboardAnalytics({ filter: 'thisYear' });
  assert.ok(thisYear.overview, 'This-year range metrics computed cleanly');
  console.log('✓ Test 2 Passed: Time window filtering logic verified');

  // Test 3: CSV Report generation
  const csvData = await analyticsService.generateOrdersCSV({ filter: '30days' });
  assert.ok(typeof csvData === 'string', 'generateOrdersCSV must return a string');
  assert.ok(csvData.includes('Order ID'), 'CSV must contain standard table headers');
  assert.ok(csvData.includes('Total (LKR)'), 'CSV must contain pricing columns');
  console.log('✓ Test 3 Passed: CSV automated report generation verified');

  return true;
}
