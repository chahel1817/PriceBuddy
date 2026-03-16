"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ExternalLink, TrendingDown, TrendingUp,
    AlertCircle, Bell, Share2, Globe, Clock, ShieldCheck
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Navbar from "@/components/Navbar";
import { products, priceHistoryData } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function ProductDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const product = products.find(p => p.id === parseInt(resolvedParams.id)) || products[0];

    // Chart customization
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-xl font-black text-brand-cyan">{payload[0].value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                    <div className="mt-2 pt-2 border-t border-brand-border/30">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Best market price</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
            <Navbar />

            <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Back Link */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-brand-card/50 border border-brand-border rounded-2xl w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Live Status: <span className="text-white">Updated {product.updated}</span>
                        </span>
                    </div>
                </div>

                {/* Hero section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Image & Main Info */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

                            <div className="flex flex-col md:flex-row gap-8 md:items-center relative z-10">
                                <div className="w-full md:w-56 aspect-square bg-white rounded-3xl p-6 shadow-2xl border border-brand-border flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                                    <img src={product.productImage} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {product.category}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" /> Live Tracking
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">{product.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="w-4 h-4 text-brand-cyan" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{product.stores.length} Stores Tracked</span>
                                        </div>
                                        <div className="w-1 h-1 bg-brand-border rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-brand-cyan" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Updated {product.updated}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Comparison */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5 text-brand-cyan" /> Market Comparison
                                </h2>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Best deal at top</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {(() => {
                                    const sortedStores = [...product.stores].sort((a, b) =>
                                        parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''))
                                    );
                                    const bestPrice = parseFloat(sortedStores[0].price.replace(/[^\d.]/g, ''));

                                    return sortedStores.map((store, idx) => {
                                        const currentPrice = parseFloat(store.price.replace(/[^\d.]/g, ''));
                                        const diff = currentPrice - bestPrice;

                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "border transition-all duration-300 p-5 rounded-3xl flex items-center justify-between group",
                                                    idx === 0
                                                        ? "bg-brand-cyan/[0.07] border-brand-cyan shadow-[0_0_25px_rgba(0,229,255,0.15)] ring-1 ring-brand-cyan/20"
                                                        : "bg-brand-card/30 border-brand-border hover:bg-brand-card hover:border-brand-border/80 shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-white rounded-2xl p-2.5 border border-brand-border shadow-xl flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform z-10">
                                                        <img src={store.logo} alt={store.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-white uppercase tracking-tight">{store.name}</h4>
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">In Stock</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={cn(
                                                                    "text-2xl font-black transition-colors",
                                                                    idx === 0 ? "text-brand-cyan" : "text-white group-hover:text-brand-cyan"
                                                                )}>{store.price}</span>
                                                                {store.trend === 'up' && <TrendingUp className="w-4 h-4 text-rose-500" />}
                                                                {store.trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
                                                            </div>
                                                            {diff > 0 && (
                                                                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                                                                    +₹{diff.toLocaleString('en-IN')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {idx === 0 && (
                                                                <span className="text-[10px] font-black text-brand-cyan bg-brand-cyan/20 px-3 py-0.5 rounded-full uppercase tracking-widest border border-brand-cyan/30">Best Price</span>
                                                            )}
                                                            {idx === 0 && sortedStores.length > 1 && (
                                                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                                                    Save ₹{(parseFloat(sortedStores[1].price.replace(/[^\d.]/g, '')) - bestPrice).toLocaleString('en-IN')} vs {sortedStores[1].name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open(store.url, '_blank')}
                                                        className={cn(
                                                            "px-5 py-3 rounded-xl flex items-center gap-2 transition-all group/btn text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                                                            idx === 0
                                                                ? "bg-brand-cyan text-brand-bg shadow-lg shadow-brand-cyan/20 hover:scale-[1.02] active:scale-95"
                                                                : "bg-brand-bg border border-brand-border text-gray-400 hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan"
                                                        )}
                                                    >
                                                        <span>Open Store</span>
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Price History Chart integrated below comparison */}
                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Price History</h2>
                                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-[0.2em]">Full Performance Analysis</p>
                                </div>
                                <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border shadow-inner">
                                    {['7D', '1M', '3M', 'All'].map((v) => (
                                        <button key={v} className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all tracking-widest", v === '1M' ? "bg-brand-cyan text-brand-bg shadow-lg" : "text-gray-600 hover:text-white")}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-[350px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={priceHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="detailPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00E5FF', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#00E5FF"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#detailPrice)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right: Insights & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Cards Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Lowest Ever</span>
                                <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">₹1,52,900</div>
                            </div>
                            <div className="bg-brand-card border border-brand-border rounded-3xl p-6 space-y-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Highest Ever</span>
                                <div className="text-xl font-black text-rose-400 font-mono tracking-tight">₹1,64,900</div>
                            </div>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-cyan/[0.02] group-hover:bg-brand-cyan/[0.04] transition-colors" />
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI Prediction</label>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">88% Conf.</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Wait to Buy</h3>
                                <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wide">
                                    Market data suggests a 4% drop within the next 12 days. Historical dips occur around this period.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-brand-border/30 relative z-10">
                                <button className="w-full py-4 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-white hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan transition-all uppercase tracking-widest group/bell">
                                    <Bell className="w-4 h-4 group-hover/bell:animate-bounce" /> Set Price Alert
                                </button>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Notify me via</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {['Browser Notification', 'Email Notifications', 'Price Drop Summary'].map((opt, i) => (
                                    <label key={opt} className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-border cursor-pointer hover:border-brand-cyan/30 transition-all">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{opt}</span>
                                        <div className={cn("w-4 h-4 rounded border-2 border-brand-border flex items-center justify-center", i === 0 && "bg-brand-cyan border-brand-cyan")}>
                                            {i === 0 && <CheckCircle2 className="w-3 h-3 text-brand-bg stroke-[4]" />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <ReactTooltip id="p-tip" style={{ backgroundColor: '#0c1523', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold' }} border="1px solid #1e293b" />
        </div>
    );
}

const CheckCircle2 = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
);

