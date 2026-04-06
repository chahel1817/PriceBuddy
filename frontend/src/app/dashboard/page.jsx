"use client";

import React from 'react';
import {
  TrendingDown, Package, TrendingUp,
  DollarSign, ShoppingCart, ExternalLink, Plus, BarChart3, RefreshCcw, Zap, ShieldCheck, Loader2, Search, Target
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
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterBelowTarget, setFilterBelowTarget] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("updated");
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [successData, setSuccessData] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);
  const [stats, setStats] = React.useState({ avgPriceDrop: 0, totalSavings: 0, productCount: 0 });
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
        if (result.stats) setStats(result.stats);
        const mapped = result.data.map(p => {
          let trendType = 'neutral';
          let percentage = "0%";

          // Use backend provided prev_price for cleaner trend calculation
          const current = parseFloat(p.last_price || 0);
          const prev = parseFloat(p.prev_price || 0);

          if (prev > 0) {
            if (current < prev) {
              trendType = 'down';
              percentage = ((prev - current) / prev * 100).toFixed(0) + '%';
            } else if (current > prev) {
              trendType = 'up';
              percentage = ((current - prev) / prev * 100).toFixed(0) + '%';
            }
          }

          return {
            id: p.id,
            name: p.name,
            productImage: p.image_url || null,
            category: p.category,
            price: p.last_price ? `₹${parseFloat(p.last_price).toLocaleString('en-IN')}` : 'Syncing...',
            trend: trendType,
            change: percentage,
            updated: p.scraped_at ? new Date(p.scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            store: p.store || 'Marketplace',
            storeLogo: p.storeLogo,
            target_price: p.target_price,
            price_val: current,
            scraped_at_val: p.scraped_at ? new Date(p.scraped_at).getTime() : 0
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
  }, [API_BASE_URL]);

  const handleUpdateTarget = async (productId, currentName) => {
    const val = targetInputs[productId];
    if (!val) return;

    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}/target-price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_price: parseFloat(val) })
      });
      const result = await res.json();

      if (result.success) {
        setProductsList(prev => prev.map(p =>
          p.id === productId ? { ...p, target_price: parseFloat(val) } : p
        ));

        setSuccessData({
          name: currentName,
          target: val,
          email: user?.email || 'your email'
        });
        setShowSuccessModal(true);
        setTargetInputs(prev => ({ ...prev, [productId]: '' }));
      }
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setIsUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

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

          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-4">
            <div className="flex items-center gap-3 bg-brand-card/50 p-1.5 rounded-2xl border border-brand-border h-fit shadow-lg">
              <button
                onClick={() => setFilterBelowTarget(!filterBelowTarget)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2.5",
                  filterBelowTarget
                    ? "bg-emerald-500 text-brand-bg shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-500/20"
                    : "text-gray-500 hover:text-white"
                )}
              >
                <Target className="w-3.5 h-3.5" />
                Deals Only
              </button>
            </div>

            <div className="h-8 w-px bg-brand-border/30 hidden lg:block" />

            <div className="relative group w-full md:w-72">
              <input
                type="text"
                placeholder="Search inventory assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-card/50 border border-brand-border rounded-2xl pl-5 pr-12 py-3 text-[11px] text-white focus:outline-none focus:border-brand-cyan/50 transition-all font-black placeholder:text-gray-700 shadow-inner group-hover:border-brand-cyan/20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {searchTerm ? (
                  <RefreshCcw className="w-4 h-4 text-brand-cyan animate-spin cursor-pointer" onClick={() => setSearchTerm("")} />
                ) : (
                  <Search className="w-4 h-4 text-gray-800 font-black group-hover:text-brand-cyan transition-colors" />
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-brand-border/30 hidden lg:block" />

            <div className="flex bg-brand-card/50 p-1.5 rounded-2xl border border-brand-border h-fit shadow-lg">
              {['Price', 'Trend', 'Category', 'Recent'].map((label, idx) => {
                const key = ['price_val', 'trend', 'category', 'updated'][idx];
                return (
                  <button
                    key={key}
                    onClick={() => setSortBy(key)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                      sortBy === key
                        ? "bg-brand-cyan text-brand-bg shadow-xl shadow-brand-cyan/40 ring-2 ring-brand-cyan/20"
                        : "text-gray-500 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Tracked Products" value={stats.productCount.toLocaleString()} change={null} isPositive={true} icon={Package} />
          <StatCard title="Avg. Price Drop" value={`₹${parseFloat(stats.avgPriceDrop || 0).toLocaleString('en-IN')}`} change={null} isPositive={true} icon={TrendingDown} />
          <StatCard title="Total Savings" value={`₹${parseFloat(stats.totalSavings || 0).toLocaleString('en-IN')}`} change={null} isPositive={true} icon={DollarSign} />
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
              <h3 className="font-black text-white uppercase tracking-wider text-sm italic">Live Tracking Board</h3>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Active nodes from Amazon & eBay</p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="text-[10px] font-black text-brand-cyan hover:text-white transition-colors tracking-widest uppercase flex items-center gap-2 group px-4 py-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl"
            >
              View All Assets
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-bg/50 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold text-brand-cyan/50">#ID</th>
                  <th className="px-6 py-4 font-bold">Product Intelligence</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold text-center">Trend Signal</th>
                  <th className="px-6 py-4 font-bold">Live Price</th>
                  <th className="px-6 py-4 font-bold text-brand-cyan">Target Goal</th>
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
                  productsList
                    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.store.toLowerCase().includes(searchTerm.toLowerCase()))
                    .filter(p => !filterBelowTarget || (p.target_price && p.price_val <= p.target_price))
                    .sort((a, b) => {
                      if (sortBy === 'price_val') return b.price_val - a.price_val;
                      if (sortBy === 'trend') return a.trend.localeCompare(b.trend);
                      if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
                      return b.scraped_at_val - a.scraped_at_val;
                    })
                    .map((p, idx) => {
                      const isGoodDeal = p.target_price && p.price_val <= p.target_price;
                      const isExpensive = p.target_price && p.price_val > p.target_price;

                      return (
                        <tr key={p.id} className="hover:bg-white/5 border-b border-white/[0.03] transition-all duration-200 group h-24">
                          <td className="px-6 py-4 text-gray-700 font-mono text-[10px]">{idx + 1}</td>
                          <td className="px-6 py-4 max-w-sm">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-brand-bg border border-brand-border p-1.5 group-hover:border-brand-cyan/30 transition-all shadow-xl flex items-center justify-center flex-shrink-0">
                                {p.productImage
                                  ? <img src={p.productImage} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                                  : <Package className="w-5 h-5 text-gray-700" />
                                }
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-black text-white group-hover:text-brand-cyan transition-colors tracking-tight text-xs uppercase line-clamp-2 leading-tight">{p.name}</span>
                                <div className="flex items-center gap-2">
                                  {p.storeLogo && (
                                    <div className="h-3.5 bg-white/90 rounded px-1 flex items-center shadow-sm">
                                      <img src={p.storeLogo} alt={p.store} className="h-2 w-auto object-contain" />
                                    </div>
                                  )}
                                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{p.store}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-brand-card border border-brand-border rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-widest">{p.category}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 border shadow-sm",
                                p.trend === 'down'
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : p.trend === 'up'
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                              )}>
                                {p.trend === 'down' ? 'DOWN' : p.trend === 'up' ? 'UP' : 'STEADY'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-base font-black tracking-tight",
                                isGoodDeal ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]" :
                                  isExpensive ? "text-rose-400" : "text-white"
                              )}>
                                {p.price}
                              </span>
                              <div className="text-[9px] font-black mt-0.5 uppercase tracking-widest text-gray-700">
                                LAST AT: {p.updated}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {p.target_price ? (
                              <div className="flex items-center px-2.5 py-1.5 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg shadow-inner group-hover:border-brand-cyan/40 transition-colors w-fit">
                                <span className="text-[10px] font-black text-brand-cyan tracking-wider">₹{parseFloat(p.target_price).toLocaleString('en-IN')}</span>
                              </div>
                            ) : (
                              <div className="text-[9px] font-black text-gray-700 uppercase tracking-widest italic">Not Set</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-center">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/product/${p.id}`); }}
                                className="p-2 bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-brand-bg rounded-lg transition-all border border-brand-cyan/20"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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

        {/* Target Success Modal */}
        {showSuccessModal && successData && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
            <div className="relative bg-[#0c1829] border border-brand-cyan/25 p-8 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,229,255,0.15)] max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-300">
              <div className="w-20 h-20 bg-brand-cyan/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-brand-cyan/20">
                <ShieldCheck className="w-10 h-10 text-brand-cyan" />
              </div>
              <h3 className="text-white font-black uppercase tracking-tight text-xl mb-3 italic">Alert Armed! 🎯</h3>
              <p className="text-gray-400 text-[11px] leading-relaxed font-bold uppercase tracking-[0.1em] mb-8">
                Target updated successfully. You will receive an email at <span className="text-brand-cyan font-black">{successData.email}</span> as soon as <span className="text-white font-black">{successData.name}</span> hits <span className="text-brand-cyan font-black">₹{parseFloat(successData.target).toLocaleString('en-IN')}</span>.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-brand-cyan text-brand-bg font-black rounded-2xl text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-cyan/30"
              >
                Understood
              </button>
            </div>
          </div>
        )}
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
