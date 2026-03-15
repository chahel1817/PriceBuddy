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

// --- DATA ---
const priceHistoryData = [
  { name: 'Jan 1', price: 300, avg: 310 },
  { name: 'Jan 8', price: 285, avg: 305 },
  { name: 'Jan 15', price: 290, avg: 315 },
  { name: 'Jan 22', price: 280, avg: 300 },
  { name: 'Jan 29', price: 275, avg: 295 },
  { name: 'Feb 5', price: 270, avg: 285 },
  { name: 'Feb 12', price: 260, avg: 280 },
];

const categoryTrendData = [
  { name: 'Week 1', trend: 1200 },
  { name: 'Week 2', trend: 1150 },
  { name: 'Week 3', trend: 1250 },
  { name: 'Week 4', trend: 1100 },
  { name: 'Week 5', trend: 1050 },
  { name: 'Week 6', trend: 1120 },
];

const products = [
  { id: 1, name: 'iPhone 15 Pro Max', category: 'Smartphones', store: 'Amazon', price: '$1199', change: '-7.7%', trend: 'down', updated: '2 hours ago' },
  { id: 2, name: 'Sony WH-1000XM5', category: 'Audio', store: 'Best Buy', price: '$349', change: '-12.5%', trend: 'down', updated: '5 hours ago' },
  { id: 3, name: 'MacBook Pro 14"', category: 'Laptops', store: 'Apple Store', price: '$1999', change: '+5.3%', trend: 'up', updated: '1 day ago' },
  { id: 4, name: 'Samsung OLED TV 55"', category: 'Electronics', store: 'Walmart', price: '$1299', change: '-7.1%', trend: 'down', updated: '3 hours ago' },
  { id: 5, name: 'Nike Air Max 270', category: 'Footwear', store: 'Nike.com', price: '$150', change: '-16.7%', trend: 'down', updated: '6 hours ago' },
];

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
  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      <main className="p-8 space-y-8 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Market Overview</h1>
          <p className="text-gray-500 text-sm">Real-time price intelligence and competitive analytics.</p>
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
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl">
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Price History Comparison</h3>
              <p className="text-gray-500 text-xs">Your price vs. competitor average</p>
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
                    contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#00e5ff' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#00e5ff" fill="url(#colorPrice)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="avg" stroke="#334155" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl">
            <div className="flex flex-col gap-1 mb-6">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">Category Price Trends</h3>
              <p className="text-gray-500 text-xs">Electronics category - Last 6 weeks</p>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={16 / 9}>
                <LineChart data={categoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#00e5ff' }}
                  />
                  <Line type="monotone" dataKey="trend" stroke="#00e5ff" strokeWidth={3} dot={{ r: 4, fill: '#00e5ff', strokeWidth: 2, stroke: '#0c1523' }} />
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
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Store</th>
                  <th className="px-6 py-4 font-bold">Current Price</th>
                  <th className="px-6 py-4 font-bold">Change</th>
                  <th className="px-6 py-4 font-bold">Last Updated</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-5">
                      <span className="font-bold text-white">{p.name}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-400">{p.category}</td>
                    <td className="px-6 py-5 text-gray-400">{p.store}</td>
                    <td className="px-6 py-5 text-brand-cyan font-black">{p.price}</td>
                    <td className="px-6 py-5">
                      <div className={`flex items-center gap-1 font-bold ${p.trend === 'down' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        {p.change}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-gray-500 text-xs">{p.updated}</td>
                    <td className="px-6 py-5 text-right">
                      <ExternalLink className="w-4 h-4 text-gray-600 cursor-pointer hover:text-brand-cyan transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group">
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><Plus className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Add Product</h4><p className="text-gray-500 text-xs mt-1">Start tracking a new product</p></div>
          </div>
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group">
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><ShoppingCart className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">Set Alert</h4><p className="text-gray-500 text-xs mt-1">Get notified on price drops</p></div>
          </div>
          <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-brand-bg/50 hover:border-brand-cyan/30 transition-all group">
            <div className="bg-brand-bg p-3 rounded-xl border border-brand-border group-hover:border-brand-cyan/20"><BarChart3 className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-bold text-white text-sm uppercase tracking-wider">View Reports</h4><p className="text-gray-500 text-xs mt-1">Analyze pricing trends</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}
