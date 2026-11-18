import React, { useState, useEffect } from 'react';
import * as analyticsService from '../../services/analyticsService';
import { AnalyticsData } from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  RotateCcw,
  Percent,
  Download,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
} from 'lucide-react';

export const AdminAnalyticsView: React.FC = () => {
  const [filter, setFilter] = useState<string>('30days');
  const [startDate] = useState<string>('');
  const [endDate] = useState<string>('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getAnalytics(filter, startDate, endDate);
      setData(res);
    } catch (err) {
      console.warn('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await analyticsService.exportOrdersCsv(filter, startDate, endDate);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setExporting(false);
    }
  };

  const overview = data?.overview;
  const charts = data?.charts;

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121212] border border-[#222]">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'today', label: 'Today' },
            { key: 'yesterday', label: 'Yesterday' },
            { key: '7days', label: 'Last 7 Days' },
            { key: '30days', label: 'Last 30 Days' },
            { key: '90days', label: 'Last 90 Days' },
            { key: 'thisMonth', label: 'This Month' },
            { key: 'lastMonth', label: 'Previous Month' },
            { key: 'thisYear', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                filter === item.key
                  ? 'bg-[#d4ff00] text-black font-bold shadow-md shadow-[#d4ff00]/10'
                  : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2a2a2a]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-[#1c1c1c] border border-[#333] hover:border-[#d4ff00] text-[#d4ff00] font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'EXPORTING CSV...' : 'EXPORT CSV REPORT'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#d4ff00] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
            AGGREGATING POSTGRESQL FINANCIAL METRICS...
          </p>
        </div>
      ) : overview ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#d4ff00]" />
                TOTAL NET REVENUE
              </span>
              <div className="text-2xl font-black font-mono text-[#d4ff00]">
                LKR {overview.totalRevenue.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">Completed & settled sales</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                GROSS SALES (PRE-DISCOUNT)
              </span>
              <div className="text-2xl font-black font-mono text-white">
                LKR {overview.grossSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">Items price + delivery fee</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                ESTIMATED GROSS PROFIT
              </span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                LKR {overview.estimatedProfit.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">Calculated after cost of goods</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                AVERAGE ORDER VALUE
              </span>
              <div className="text-2xl font-black font-mono text-white">
                LKR {overview.averageOrderValue.toLocaleString()}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">Per completed checkout</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-yellow-400" />
                TOTAL ORDERS
              </span>
              <div className="text-2xl font-black font-mono text-white">{overview.totalOrders}</div>
              <p className="text-[11px] text-gray-500 font-mono">
                {overview.deliveredOrders} delivered • {overview.pendingOrders} pending
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                TOTAL REGISTERED CUSTOMERS
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {overview.totalCustomers}
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Repeat rate: {overview.repeatCustomerRate}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                CANCELLED / REFUNDS
              </span>
              <div className="text-2xl font-black font-mono text-red-400">
                {overview.cancelledOrders} orders
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                LKR {overview.refundTotals.toLocaleString()} total
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#121212] border border-[#242424] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                LOW-STOCK VARIANTS
              </span>
              <div className="text-2xl font-black font-mono text-amber-400">
                {overview.lowStockCount} SKUs
              </div>
              <p className="text-[11px] text-gray-500 font-mono">&le; 5 units remaining</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#d4ff00]" />
                  REVENUE BY DAY
                </h3>
                <span className="text-[11px] font-mono text-gray-500">
                  {charts?.revenueByPeriod.length || 0} active days
                </span>
              </div>

              {charts?.revenueByPeriod && charts.revenueByPeriod.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="h-44 flex items-end gap-2 border-b border-[#222] pb-2">
                    {charts.revenueByPeriod.map((point) => {
                      const max = Math.max(...charts.revenueByPeriod.map((p) => p.revenue), 1);
                      const heightPercent = Math.max(8, Math.round((point.revenue / max) * 100));

                      return (
                        <div
                          key={point.date}
                          className="flex-1 flex flex-col items-center gap-1 group relative"
                        >
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-[#333] px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap z-20 pointer-events-none">
                            {point.date}: LKR {point.revenue.toLocaleString()} ({point.orders} orders)
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#d4ff00] rounded-t group-hover:bg-[#bce400] transition-colors"
                          />
                          <span className="text-[8px] font-mono text-gray-500 truncate w-full text-center">
                            {point.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  NO COMPLETED CHECKOUTS RECORDED IN THIS DATE INTERVAL
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  SALES BY SIZE BREAKDOWN
                </h3>
              </div>

              {charts?.salesBySize && charts.salesBySize.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {charts.salesBySize.map((item) => {
                    const totalUnits = charts.salesBySize.reduce((acc, s) => acc + s.count, 0);
                    const pct = totalUnits > 0 ? Math.round((item.count / totalUnits) * 100) : 0;

                    return (
                      <div key={item.size} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white">Size {item.size}</span>
                          <span className="text-gray-400">
                            {item.count} units ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-[#d4ff00] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-500 font-mono">
                  NO VARIANT LEVEL SALES IN THIS PERIOD
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121212] border border-[#242424] space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#d4ff00]">
              TOP BEST-SELLING PRODUCTS IN INTERVAL
            </h3>

            {charts?.topProducts && charts.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#222] text-gray-500 uppercase">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4 text-right">Units Sold</th>
                      <th className="py-3 px-4 text-right">Net Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charts.topProducts.map((p) => (
                      <tr key={p.id} className="border-b border-[#1c1c1c] hover:bg-[#161616]">
                        <td className="py-3 px-4 text-white font-bold">{p.name}</td>
                        <td className="py-3 px-4 text-right text-gray-300">{p.unitsSold} units</td>
                        <td className="py-3 px-4 text-right text-[#d4ff00] font-bold">
                          LKR {p.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500 font-mono">
                NO ORDERS FOUND FOR SELECTED DATE RANGE
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminAnalyticsView;

