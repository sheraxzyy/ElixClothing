import React, { useState, useEffect } from 'react';
import * as stockNotificationService from '../../services/stockNotificationService';
import { StockNotificationType } from '../../types';
import { Bell, RefreshCw, Flame } from 'lucide-react';

export const AdminStockNotificationsView: React.FC = () => {
  const [data, setData] = useState<{
    subscriptions: StockNotificationType[];
    demand: Array<{
      productId: string;
      size: string;
      count: number;
      product: { id: string; name: string; slug: string; imageUrl?: string };
    }>;
  }>({ subscriptions: [], demand: [] });
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await stockNotificationService.getAdminStockInsights();
      setData(res);
    } catch (err) {
      console.warn('Failed to load stock notification insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121212] border border-[#222]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#d4ff00]" />
            <h2 className="text-lg font-mono font-bold uppercase tracking-tight text-white">
              BACK-IN-STOCK NOTIFICATIONS & DEMAND INTELLIGENCE
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            Monitor customer waitlists for sold-out silhouettes, evaluate variant restock demand, and
            track automated dispatch logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white"
          title="Refresh insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#d4ff00] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
            SCANNING RESTOCK SUBSCRIPTIONS...
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#d4ff00] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#d4ff00]" />
              HIGH-DEMAND RESTOCK REQUESTS BY SILHOUETTE & SIZE
            </h3>

            {data.demand.length === 0 ? (
              <p className="text-xs font-mono text-gray-500 py-4">
                NO ACTIVE RESTOCK SUBSCRIPTIONS AT THIS TIME
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.demand.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="p-4 rounded-xl bg-[#0e0e0e] border border-[#242424] space-y-2 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-white uppercase truncate">
                        {item.product?.name || 'ELIX Apparel'}
                      </p>
                      <p className="text-[11px] font-mono text-gray-400">
                        Size: <span className="text-[#d4ff00] font-bold">{item.size}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-[#d4ff00]">
                        {item.count}
                      </span>
                      <p className="text-[9px] font-mono text-gray-500 uppercase">Waitlist</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
              RECENT CUSTOMER SUBSCRIPTIONS ({data.subscriptions.length})
            </h3>

            {data.subscriptions.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 font-mono">
                NO CUSTOMER NOTIFICATIONS RECORDED
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#222] text-gray-500 uppercase text-[11px]">
                      <th className="py-3 px-4">Customer Email</th>
                      <th className="py-3 px-4">Silhouette</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Subscribed At</th>
                      <th className="py-3 px-4">Notified At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b border-[#1a1a1a] hover:bg-[#161616]">
                        <td className="py-3 px-4 text-white font-bold">{sub.email}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {sub.product?.name || sub.productId}
                        </td>
                        <td className="py-3 px-4 text-[#d4ff00] font-bold">{sub.size}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              sub.status === 'notified'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : sub.status === 'unsubscribed'
                                ? 'bg-gray-800 text-gray-400'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {sub.notifiedAt ? new Date(sub.notifiedAt).toLocaleString() : 'Pending Restock'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStockNotificationsView;

