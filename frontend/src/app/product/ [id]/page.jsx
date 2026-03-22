"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ExternalLink, TrendingDown, TrendingUp,
    AlertCircle, Bell, Share2, Globe, Clock, ShieldCheck
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Navbar from "@/components/Navbar";
import { products, priceHistoryData } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function ProductDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const product = products.find(p => p.id === parseInt(resolvedParams.id)) || products[0];

    const prices = priceHistoryData.map(p => p.price);
    const lastPrice = prices[prices.length - 1];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceRange = (maxPrice - minPrice) || 1;
    const volatility = (Math.sqrt(prices
        .map(price => (price - avgPrice) ** 2)
        .reduce((a, b) => a + b, 0) / prices.length) / avgPrice) * 100;

    const colorForTone = {
        emerald: 'bg-emerald-400',
        rose: 'bg-rose-400',
        cyan: 'bg-cyan-400',
        amber: 'bg-amber-400',
    };

    const summary = [
        { label: '7D High', value: `$${maxPrice.toFixed(0)}`, tone: 'emerald' },
        { label: '7D Low', value: `$${minPrice.toFixed(0)}`, tone: 'rose' },
        { label: 'Average', value: `$${avgPrice.toFixed(0)}`, tone: 'cyan' },
        { label: 'Volatility', value: `${volatility.toFixed(1)}%`, tone: 'amber' },
    ];

    return (
        <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
            <Navbar />

            <main className="p-8 space-y-8 overflow-y-auto">
                {/* Breadcrumbs & Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Products</span>
                </button>

                {/* Product Overview Header */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                        {/* Background Accent */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />

                        <div className="w-48 h-48 bg-white rounded-2xl p-4 border border-brand-border shadow-2xl flex-shrink-0">
                            <img src={product.productImage} alt={product.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 bg-brand-bg border border-brand-border rounded text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {product.category}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded text-[10px] font-black text-brand-cyan uppercase tracking-widest">
                                        <ShieldCheck className="w-3 h-3" /> Verified Product
                                    </div>
                                </div>
                                <h1 className="text-3xl font-black text-white leading-tight">{product.name}</h1>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-1 border border-brand-border">
                                        <img src={product.storeLogo} alt={product.store} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Listed on {product.store}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-end gap-6 pt-4 border-t border-brand-border/30">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Price</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black text-brand-cyan">{product.price}</span>
                                        <div className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black border",
                                            product.trend === 'down' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                        )}>
                                            {product.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                            {product.change}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Scrape Frequency</span>
                                    <span className="text-white font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-brand-cyan" /> Every 2 Hours
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-cyan text-brand-bg rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20">
                                <ExternalLink className="w-4 h-4" /> Go to Store
                            </button>
                            <button className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-bg border border-brand-border text-white rounded-xl font-black text-xs uppercase tracking-widest hover:border-brand-cyan/30 transition-all">
                                <Bell className="w-4 h-4" /> Edit Alert
                            </button>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Insights</h3>
                                <Share2 className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl space-y-1">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm font-bold text-emerald-400">TRACKING ACTIVE</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-brand-bg border border-brand-border rounded-2xl space-y-1">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Price Prediction</span>
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4 text-brand-cyan" />
                                        <span className="text-sm font-bold text-white">EXPECTED DROP SOON</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 text-brand-cyan bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-xl">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-[10px] font-bold uppercase leading-relaxed text-brand-cyan">
                                    History indicates this product usually drops below $1100 every 45 days.
                                    Recommended: WAIT for drop.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-2xl p-8 space-y-8 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-40"
                         style={{ background: "radial-gradient(circle at 20% 20%, rgba(0,229,255,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(94,234,212,0.06), transparent 30%)" }}
                    />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/30 pb-6 relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Price Performance History</h2>
                            <p className="text-gray-500 text-sm">Smoothed trend with average band and contextual markers.</p>
                        </div>
                        <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border/70 shadow-inner">
                            {['7D', '1M', '3M', 'All'].map((r) => (
                                <button
                                    key={r}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-xs font-black uppercase transition-all",
                                        r === '7D' ? "bg-brand-cyan text-brand-bg shadow-md" : "text-gray-500 hover:text-white"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 relative z-10">
                        {summary.map((card) => (
                            <div
                                key={card.label}
                                className="p-4 rounded-2xl border border-brand-border bg-brand-bg/60 backdrop-blur flex flex-col gap-2 shadow-sm"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{card.label}</span>
                                <span className="text-lg font-black text-white">{card.value}</span>
                                <div className="h-1.5 w-full rounded-full bg-brand-border overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${colorForTone[card.tone]}`}
                                        style={{ width: `${Math.min(100, ((card.label === 'Volatility' ? volatility : (parseInt(card.value.slice(1)) - minPrice)) / priceRange) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-[420px] w-full relative z-10 bg-brand-bg/40 border border-brand-border/60 rounded-2xl p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priceHistoryData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="detailPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                                        <stop offset="40%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#1e293b" opacity={0.8} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dy={12}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dx={-6}
                                    width={55}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 3', opacity: 0.6 }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length) return null;
                                        const price = payload[0].value;
                                        return (
                                            <div className="bg-brand-bg border border-brand-border rounded-xl p-3 shadow-xl space-y-1 min-w-[160px]">
                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</div>
                                                <div className="text-xl font-black text-brand-cyan">${price}</div>
                                                <div className="flex items-center justify-between text-[11px] font-bold text-gray-400">
                                                    <span>vs avg</span>
                                                    <span className={price >= avgPrice ? "text-emerald-400" : "text-rose-400"}>
                                                        {price >= avgPrice ? '+' : ''}{(price - avgPrice).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />

                                <ReferenceLine y={avgPrice} stroke="#22d3ee" strokeDasharray="5 5" strokeOpacity={0.6} label={{ position: 'left', value: 'Avg', fill: '#22d3ee', fontSize: 10, fontWeight: 800 }} />

                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#detailPrice)"
                                    activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
                                    animationDuration={1200}
                                />
                            </AreaChart>
                        </ResponsiveContainer>

                        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-[11px] font-bold text-gray-500">
                            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Avg Band</span>
                            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand-cyan" /> Last Price ${lastPrice.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </main>

            <ReactTooltip
                id="global-tooltip"
                style={{ backgroundColor: '#0c1523', border: '1px solid #1e293b', padding: '8px 12px', fontSize: '11px', fontWeight: 'bold' }}
            />
        </div>
    );
}
