"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ExternalLink, TrendingDown, TrendingUp,
    AlertCircle, Bell, Share2, Globe, Clock, ShieldCheck, Package
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
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const productId = resolvedParams.id;

    React.useEffect(() => {
        const fetchDetail = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
                const res = await fetch(`${API_BASE_URL}/products/${productId}`);
                const result = await res.json();
                if (result.success) {
                    setProduct(result.data);
                }
            } catch (e) {
                console.error("Detail fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Clock className="w-12 h-12 text-brand-cyan animate-spin" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Retrieving Product Intelligence...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Product not found in global index.</p>
                    <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-brand-cyan text-brand-bg rounded-xl font-bold uppercase tracking-widest text-[10px]">Return to Safety</button>
                </div>
            </div>
        );
    }

    const priceHistory = (product.history || []).map(h => ({
        date: new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        price: parseFloat(h.price)
    }));

    // Chart customization
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-brand-card border border-brand-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                    <p className="text-xl font-black text-brand-cyan">₹{payload[0].value.toLocaleString()}</p>
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
                            Live Status: <span className="text-white">Tracking Active</span>
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
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Package className="w-16 h-16 text-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {product.category}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" /> Verifed Source
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white leading-[1.1] tracking-tighter uppercase italic">{product.name}</h1>
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="w-4 h-4 text-brand-cyan" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">1 Store Tracked (eBay)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Store */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 px-2">
                                <TrendingDown className="w-5 h-5 text-brand-cyan" /> Market Deal
                            </h2>
                            <div className="bg-brand-card/30 border border-brand-cyan shadow-[0_0_25px_rgba(0,229,255,0.05)] p-6 rounded-3xl flex items-center justify-between group border-brand-border">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl p-2.5 border border-brand-border shadow-xl flex items-center justify-center overflow-hidden">
                                        <img src={product.storeLogo} alt="eBay" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase tracking-tight">eBay Store</h4>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Best Market Price</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-brand-cyan">{product.last_price ? `$${parseFloat(product.last_price).toLocaleString()}` : '—'}</span>
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Verified 0h ago</span>
                                    </div>
                                    <a
                                        href={product.product_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-3 bg-brand-cyan text-brand-bg rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <span>Buy Now</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Price History Chart */}
                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Price History</h2>
                                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-[0.2em]">Full Performance Analysis</p>
                                </div>
                            </div>

                            {priceHistory.length > 0 ? (
                                <div className="h-[350px] w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="detailPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis
                                                dataKey="date"
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
                            ) : (
                                <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-brand-border rounded-3xl">
                                    <div className="text-center space-y-2">
                                        <TrendingDown className="w-8 h-8 text-gray-700 mx-auto" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Awaiting First Price Entry</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Insights & Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Intelligence Report</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Current Price</span>
                                    <span className="text-xl font-black text-white">{product.last_price ? `$${parseFloat(product.last_price).toLocaleString()}` : '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Status</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase">Steady Market</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-brand-cyan/[0.02] group-hover:bg-brand-cyan/[0.04] transition-colors" />
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter underline decoration-brand-cyan/20">Market Insight</h3>
                                <p className="text-gray-500 text-xs font-medium leading-relaxed uppercase tracking-wide">
                                    This product is currently listed on eBay. We are monitoring for any price dips or clearance events.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-brand-border/30 relative z-10">
                                <button className="w-full py-4 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-white hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan transition-all uppercase tracking-widest shadow-lg">
                                    <Bell className="w-4 h-4" /> Set Alert
                                </button>
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

