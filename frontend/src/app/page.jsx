"use client";

import React from 'react';
import {
  Search, Bell, Settings, TrendingDown, Package, TrendingUp,
  DollarSign, ShoppingCart, ExternalLink, Plus, BarChart3,
  TrendingDown as PriceIcon
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

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

// --- COMPONENTS ---

const Nav = () => (
  <nav className="flex items-center justify-between px-8 py-6 bg-brand-bg border-b border-brand-border sticky top-0 z-50">
    <div className="flex items-center gap-0">
      <div className="flex items-center justify-center translate-y-[-1px]">
        <img src="/logo.png" alt="PriceBuddy Icon" className="w-12 h-12 object-contain" />
      </div>
      <span className="text-3xl font-extrabold tracking-tighter text-white uppercase translate-x-[-4px]">
        Price<span className="text-brand-cyan">Buddy</span>
      </span>
    </div>
    <div className="flex items-center gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search products..."
          className="bg-brand-card border border-brand-border rounded-lg pl-10 pr-4 py-2 w-64 text-sm text-white focus:outline-none focus:border-brand-cyan"
        />
      </div>
      <div className="flex items-center gap-4 text-gray-400">
        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-brand-cyan w-2 h-2 rounded-full border-2 border-brand-bg"></span>
        </div>
        <Settings className="w-5 h-5 cursor-pointer" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-500 border border-brand-border"></div>
      </div>
    </div>
  </nav>
);

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-brand-card border border-brand-border p-6 rounded-xl">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 text-sm">{title}</span>
      <Icon className="text-brand-cyan w-5 h-5" />
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-white">{value}</span>
      <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{change} vs last month</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Nav />

      <main className="max-w-[1400px] mx-auto p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Tracked Products" value="1,247" change="12.5%" isPositive={true} icon={Package} />
          <StatCard title="Avg. Price Drop" value="23%" change="8.2%" isPositive={true} icon={TrendingDown} />
          <StatCard title="Total Savings" value="$12,450" change="15.3%" isPositive={true} icon={DollarSign} />
          <StatCard title="Active Alerts" value="34" change="5.1%" isPositive={false} icon={ShoppingCart} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-brand-card border border-brand-border p-6 rounded-xl">
            <h3 className="font-semibold mb-1 text-white">Price History Comparison</h3>
            <p className="text-gray-400 text-xs mb-6">Your price vs. competitor average</p>
            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={16 / 9}>
                <AreaChart data={priceHistoryData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b' }} />
                  <Area type="monotone" dataKey="price" stroke="#00e5ff" fill="url(#colorPrice)" strokeWidth={2} />
                  <Area type="monotone" dataKey="avg" stroke="#334155" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border p-6 rounded-xl">
            <h3 className="font-semibold mb-1 text-white">Category Price Trends</h3>
            <p className="text-gray-400 text-xs mb-6">Electronics category - Last 6 weeks</p>
            <div className="w-full">
              <ResponsiveContainer width="100%" aspect={16 / 9}>
                <LineChart data={categoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c1523', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="trend" stroke="#00e5ff" strokeWidth={2} dot={{ r: 4, fill: '#00e5ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden mb-8">
          <div className="p-6">
            <h3 className="font-semibold text-white">Recently Tracked Products</h3>
            <p className="text-gray-400 text-sm">Monitor price changes across multiple stores</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#060b13]/50 border-y border-brand-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Store</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Current Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Change</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Last Updated</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors text-sm">
                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                    <td className="px-6 py-4 text-gray-400">{p.category}</td>
                    <td className="px-6 py-4 text-gray-400">{p.store}</td>
                    <td className="px-6 py-4 text-brand-cyan font-bold">{p.price}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 ${p.trend === 'down' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {p.change}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{p.updated}</td>
                    <td className="px-6 py-4 text-right">
                      <ExternalLink className="w-4 h-4 text-gray-500 cursor-pointer hover:text-brand-cyan" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-brand-card border border-brand-border p-6 rounded-xl flex items-center gap-4 cursor-pointer hover:border-brand-cyan/50 transition-all">
            <div className="bg-brand-bg p-3 rounded-lg"><Plus className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-semibold text-white">Add Product</h4><p className="text-gray-400 text-sm">Start tracking a new product</p></div>
          </div>
          <div className="bg-brand-card border border-brand-border p-6 rounded-xl flex items-center gap-4 cursor-pointer hover:border-brand-cyan/50 transition-all">
            <div className="bg-brand-bg p-3 rounded-lg"><Bell className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-semibold text-white">Set Alert</h4><p className="text-gray-400 text-sm">Get notified on price drops</p></div>
          </div>
          <div className="bg-brand-card border border-brand-border p-6 rounded-xl flex items-center gap-4 cursor-pointer hover:border-brand-cyan/50 transition-all">
            <div className="bg-brand-bg p-3 rounded-lg"><BarChart3 className="text-brand-cyan w-6 h-6" /></div>
            <div><h4 className="font-semibold text-white">View Reports</h4><p className="text-gray-400 text-sm">Analyze pricing trends</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}
