"use client";

import React from 'react';
import {
  TrendingDown, Package, TrendingUp,
  DollarSign, ShoppingCart, ExternalLink, Plus, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import Navbar from "@/components/Navbar";
import { priceHistoryData, categoryTrendData, products } from "@/data/mockData";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Tooltip as ReactTooltip } from 'react-tooltip';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
      <div className={`flex items-center gap-1 text-sm mt-2 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="font-semibold">{change}</span>
        <span className="text-gray-500 font-normal ml-1">vs last month</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [range, setRange] = React.useState('1M');

  const ranges = ['7D', '1M', '3M', '6M', '1Y'];

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
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              <p className="text-xs italic font-medium">Last updated: 2 mins ago</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tracked Products" value="1,247" change="12.5%" isPositive={true} icon={Package} />
          <StatCard title="Avg. Price Drop" value="23%" change="8.2%" isPositive={true} icon={TrendingDown} />
          <StatCard title="Total Savings" value="$12,450" change="15.3%" isPositive={true} icon={DollarSign} />
          <StatCard title="Active Alerts" value="34" change="5.1%" isPositive={false} icon={ShoppingCart} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan/20 group-hover:bg-brand-cyan transition-colors" />
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                Price History Comparison
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">📉 falling</span>
              </h3>
              <p className="text-gray-500 text-xs text-balance">Historical price movements vs. global market average.</p>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={16 / 9}>
                <AreaChart data={priceHistoryData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}
                    itemStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#00e5ff"
                    fill="url(#colorPrice)"
                    strokeWidth={3}
                    animationDuration={1500}
                    activeDot={{ r: 6, stroke: '#060b13', strokeWidth: 2, fill: '#00e5ff' }}
                  />
                  <Area type="monotone" dataKey="avg" stroke="#334155" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan/20 group-hover:bg-brand-cyan transition-colors" />
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                Category Price Trends
                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20">🔄 stable</span>
              </h3>
              <p className="text-gray-500 text-xs">Aggregated electronics category analysis - Last 6 months.</p>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={16 / 9}>
                <LineChart data={categoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#00e5ff' }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="trend"
                    stroke="#00e5ff"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#00e5ff', strokeWidth: 2, stroke: '#0c1523' }}
                    activeDot={{ r: 7, stroke: '#0c1523', strokeWidth: 3, fill: '#00e5ff' }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-brand-border/50">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Recently Tracked Products</h3>
              <p className="text-gray-500 text-xs">Monitor price changes across multiple stores</p>
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
                {products.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-[#0f2a3c]/40 cursor-pointer transition-all duration-300 text-sm group">
                    <td className="px-6 py-5 text-gray-600 font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-brand-border p-1 group-hover:border-brand-cyan/20 transition-all">
                          <img src={p.productImage} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white group-hover:text-brand-cyan transition-colors">{p.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center p-0.5">
                              <img src={p.storeLogo} alt={p.store} className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">{p.store}</span>
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
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {p.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {p.trend === 'down' ? 'Downward' : 'Rising'}
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
                      <div className="flex items-center justify-end gap-2">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="Track a new product URL"
          >
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><Plus className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Add Product</h4><p className="text-gray-500 text-xs mt-1">Start tracking a new product</p></div>
          </div>
          <div
            className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group"
            data-tooltip-id="global-tooltip"
            data-tooltip-content="Configure price drop notifications"
          >
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><ShoppingCart className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Set Alert</h4><p className="text-gray-500 text-xs mt-1">Get notified on price drops</p></div>
          </div>
          <div
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
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-cyan text-brand-bg rounded-full shadow-lg shadow-brand-cyan/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus className="w-8 h-8 font-black" />
        <span className="absolute right-full mr-4 px-3 py-1.5 bg-brand-card border border-brand-border rounded-lg text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
          Add New Product
        </span>
      </button>

      <ReactTooltip 
        id="global-tooltip"
        style={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', padding: '8px 12px', fontSize: '12px', zIndex: 100 }}
      />
    </div>
  );
}
