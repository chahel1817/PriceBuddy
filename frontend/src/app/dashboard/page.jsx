"use client";

import React from 'react';
import {
  TrendingDown, Package, TrendingUp,
  DollarSign, ShoppingCart, ExternalLink, Plus, BarChart3, RefreshCcw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useRouter } from 'next/navigation';
import AddProductModal from "@/components/AddProductModal";
import OnboardingModal from "@/components/OnboardingModal";

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-brand-card border border-brand-border p-6 rounded-2xl hover:border-brand-cyan/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm font-medium">{title}</span>
      <div className="p-2 bg-brand-bg rounded-xl border border-brand-border group-hover:border-brand-cyan/20 transition-all">
        <Icon className="text-brand-cyan w-5 h-5" />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      {change !== null && (
        <div className={`flex items-center gap-1 text-sm mt-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span className="font-semibold">{change}</span>
          <span className="text-gray-500 font-normal ml-1">vs last month</span>
        </div>
      )}
      {change === null && (
        <p className="text-xs text-gray-700 mt-2 font-medium italic">No data yet</p>
      )}
    </div>
  </div>
);


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";


export default function Dashboard() {
  const [range, setRange] = React.useState('1M');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [productsList, setProductsList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);
  const router = useRouter();

  const ranges = ['7D', '1M', '3M', '6M', '1Y'];

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;

      if (!userId) {
        setProductsList([]);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/products?user_id=${userId}`, { cache: 'no-store' });
      const result = await res.json();
      if (result.success) {
        const mapped = result.data.map(p => {
          let prev = null;
          let trendType = 'neutral';
          let percentage = "0%";

          if (p.history && p.history.length > 0) {
            const last = parseFloat(p.history[0].price);
            const beforeLast = p.history.length > 1 ? parseFloat(p.history[1].price) : last;

            if (last < beforeLast) {
              trendType = 'down';
              percentage = ((beforeLast - last) / beforeLast * 100).toFixed(0) + '%';
            } else if (last > beforeLast) {
              trendType = 'up';
              percentage = ((last - beforeLast) / beforeLast * 100).toFixed(0) + '%';
            }
          }

          return {
            id: p.id,
            name: p.name,
            productImage: p.image_url || null,
            category: p.category,
            price: p.last_price ? `$${parseFloat(p.last_price).toLocaleString()}` : 'Syncing...',
            prevPrice: prev,
            trend: trendType,
            change: percentage,
            updated: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...',
            store: p.store || 'Marketplace',
            storeLogo: p.storeLogo
          };
        });
        setProductsList(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
    if (typeof window !== "undefined") {
      const shown = localStorage.getItem("onboardingShown");
      if (!shown) {
        setIsOnboardingOpen(true);
        localStorage.setItem("onboardingShown", "true");
      }
    }
  }, [fetchProducts]);

  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Market Overview</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Live Updates</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <p>Real-time price intelligence and competitive analytics.</p>
              {lastUpdated && (
                <>
                  <span className="w-1 h-1 bg-gray-700 rounded-full" />
                  <p className="text-xs italic font-medium">
                    Last synced: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex bg-brand-card p-1 rounded-xl border border-brand-border">
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  range === r
                    ? "bg-brand-cyan text-brand-bg shadow-lg shadow-brand-cyan/20"
                    : "text-gray-500 hover:text-white"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Tracked Products" value={productsList.length.toLocaleString()} change={null} isPositive={true} icon={Package} />
          <StatCard title="Avg. Price Drop" value="—" change={null} isPositive={true} icon={TrendingDown} />
          <StatCard title="Total Savings" value="—" change={null} isPositive={true} icon={DollarSign} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Price History Comparison ─────────────────────────── */}
          <div className="bg-brand-card border border-brand-border rounded-2xl relative group overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/40 to-brand-cyan/0" />
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan/10 group-hover:bg-brand-cyan/30 transition-colors duration-300" />

            <div className="flex items-start justify-between p-6 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white uppercase tracking-wider text-sm">Price History</h3>
                  {productsList.length > 0
                    ? <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black">📉 Live</span>
                    : <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700 font-black">No Data</span>
                  }
                </div>
                <p className="text-gray-600 text-[11px] font-medium">Price movements over time</p>
              </div>
            </div>

            <div className="flex-1 px-4 pb-5 min-h-[250px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center px-6">
                <div className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-brand-cyan/50" />
                </div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No price history available</p>
                <p className="text-[10px] text-gray-700">Add products and wait for the next price sync</p>
              </div>
            </div>
          </div>

          {/* ── Category Price Trends ────────────────────────────── */}
          <div className="bg-brand-card border border-brand-border rounded-2xl relative group overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500/0 via-violet-500/30 to-violet-500/0" />
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/10 group-hover:bg-violet-500/30 transition-colors duration-300" />

            <div className="flex items-start justify-between p-6 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white uppercase tracking-wider text-sm">Category Trends</h3>
                  <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full border border-gray-700 font-black">No Data</span>
                </div>
                <p className="text-gray-600 text-[11px] font-medium">Aggregated price trend across all tracked categories</p>
              </div>
            </div>

            <div className="flex-1 px-4 pb-5 min-h-[250px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-center px-6">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-violet-400/50" />
                </div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No category data</p>
                <p className="text-[10px] text-gray-700">Trends will appear as your products are updated</p>
              </div>
            </div>
          </div>
        </div>


        {/* Table Section */}
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-brand-border/50">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Recently Tracked Products</h3>
              <p className="text-gray-500 text-xs">Monitor live price changes from Amazon & eBay</p>
            </div>
            <button className="text-[10px] font-bold text-brand-cyan hover:underline tracking-widest uppercase">View All Products</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-bg/50 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold text-brand-cyan/50">#ID</th>
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold text-center">Trend Signal</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold">Change</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw className="w-6 h-6 text-brand-cyan animate-spin" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Syncing with server...</span>
                      </div>
                    </td>
                  </tr>
                ) : productsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 uppercase text-[10px] font-black tracking-widest">
                      Your database is empty. Add products to start tracking.
                    </td>
                  </tr>
                ) : (
                  productsList.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-[#0f2a3c]/40 cursor-pointer transition-all duration-300 text-sm group">
                      <td className="px-6 py-5 text-gray-600 font-mono text-xs">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-brand-border p-1 group-hover:border-brand-cyan/20 transition-all text-center flex items-center justify-center">
                            {p.productImage
                              ? <img src={p.productImage} alt={p.name} className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                              : <Package className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-white group-hover:text-brand-cyan transition-colors">{p.name}</span>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {p.storeLogo && (
                                <div className="h-4 bg-white rounded flex items-center justify-center px-1">
                                  <img src={p.storeLogo} alt={p.store} className="h-3 w-auto object-contain" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-400 font-medium tracking-tight">{p.category}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border",
                            p.trend === 'down'
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : p.trend === 'up'
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          )}>
                            {p.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : p.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />}
                            {p.trend === 'down' ? 'Downward' : p.trend === 'up' ? 'Rising' : 'Steady'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-black">{p.price}</span>
                          <span className="text-[10px] text-gray-600 font-bold">Last check: {p.updated}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`text-xs font-black ${p.trend === 'down' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.trend === 'down' ? '-' : '+'}{p.change.replace(/[+-]/, '')}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 text-center">
                          <button
                            className="p-2 hover:bg-brand-cyan/20 rounded-lg transition-all group/btn"
                            data-tooltip-id="global-tooltip"
                            data-tooltip-content="Open in Store"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-600 group-hover/btn:text-brand-cyan" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="Track a new product URL"
          >
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><Plus className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Add Product</h4><p className="text-gray-500 text-xs mt-1">Start tracking a new product</p></div>
          </div>
          <div
            onClick={() => router.push('/products')}
            className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="Configure price drop notifications"
          >
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><ShoppingCart className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Set Alert</h4><p className="text-gray-500 text-xs mt-1">Get notified on price drops</p></div>
          </div>
          <div
            onClick={() => router.push('/analytics')}
            className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="Download detailed analysis"
          >
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><BarChart3 className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">View Reports</h4><p className="text-gray-500 text-xs mt-1">Analyze pricing trends</p></div>
          </div>
        </div>
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-cyan text-brand-bg rounded-full shadow-lg shadow-brand-cyan/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus className="w-8 h-8 font-black" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
          Add New Product
        </span>
      </button>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <ReactTooltip
        id="global-tooltip"
        style={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', padding: '8px 12px', fontSize: '12px', zIndex: 100 }}
      />
    </div>
  );
}
