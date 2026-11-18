import { runOrderTrackingTests } from './orderTracking.test.js';
import { runDropSystemTests } from './dropSystem.test.js';
import { runAnalyticsTests } from './analytics.test.js';
import { runStockNotificationTests } from './stockNotification.test.js';
import { runRecentlyViewedTests } from './recentlyViewed.test.js';
import { runRegressionTests } from './regression.test.js';
import prisma from '../config/db.js';

async function main() {
  console.log('====================================================');
  console.log('ELIX ADVANCED STREETWEAR PLATFORM – AUTOMATED TEST SUITE');
  console.log('====================================================');

  const suites = [
    { name: 'Order Tracking & 10-Status Workflow', fn: runOrderTrackingTests },
    { name: 'ELIX Drop Release Platform & Concurrency', fn: runDropSystemTests },
    { name: 'Analytics & Financial KPIs Engine', fn: runAnalyticsTests },
    { name: 'Back-In-Stock Waitlist System', fn: runStockNotificationTests },
    { name: 'Recently Viewed Products & Cap Management', fn: runRecentlyViewedTests },
    { name: 'Platform Regression & Database Integrity', fn: runRegressionTests },
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const suite of suites) {
    try {
      await suite.fn();
      passedCount++;
    } catch (err) {
      console.error(`\n❌ FAILED SUITE [${suite.name}]:`, err);
      failedCount++;
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL TEST SUITES: ${suites.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('====================================================');

  await prisma.$disconnect();

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL SUITES PASSED CLEANLY WITH ZERO REGRESSIONS.\n');
    process.exit(0);
  }
}

main().catch(async (e) => {
  console.error('Test runner fatal error:', e);
  await prisma.$disconnect();
  process.exit(1);
});

