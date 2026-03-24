"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ExternalLink, TrendingDown, TrendingUp,
    AlertCircle, Bell, Share2, Globe, Clock, ShieldCheck, Package, Activity
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function ProductDetailPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [product, setProduct] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showAlertModal, setShowAlertModal] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState("");

    const productId = resolvedParams.id;

    React.useEffect(() => {
        const fetchDetail = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUserEmail(parsed.email || "your email");
                }

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

    const priceHistory = (product.history || [])
        .map(h => ({
            date: new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            price: parseFloat(h.price)
        }))
        .filter(item => isFinite(item.price) && item.price > 0 && item.price < 50000); // Filter out outliers or common errors like 999999

    // Dynamic Trend Detection
    const getTrendStatus = () => {
        if (priceHistory.length < 2) return { text: "Steady Market", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
        const latest = priceHistory[priceHistory.length - 1].price;
        const previous = priceHistory[priceHistory.length - 2].price;
        if (latest < previous) return { text: "Optimal Buy: Price Drop", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <TrendingDown className="w-3 h-3" /> };
        if (latest > previous) return { text: "Market Spike: Rising", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: <TrendingUp className="w-3 h-3" /> };
        return { text: "Steady Market", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    };
    const trend = getTrendStatus();

    // Chart Statistics
    const validPrices = priceHistory.map(h => h.price).filter(p => isFinite(p));
    const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
    const maxPrice = validPrices.length ? Math.max(...validPrices) : 0;
    const avgPrice = validPrices.length ? (validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const currentObj = payload[0].payload;
            const currentIndex = priceHistory.findIndex(h => h === currentObj);
            let changeElement = null;

            if (currentIndex > 0) {
                const prevObj = priceHistory[currentIndex - 1];
                const diff = currentObj.price - prevObj.price;
                if (diff !== 0) {
                    const isDrop = diff < 0;
                    changeElement = (
                        <div className={cn("flex items-center gap-1 mt-1.5 text-[10px] font-black uppercase tracking-wider", isDrop ? "text-emerald-400" : "text-rose-400")}>
                            {isDrop ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                            <span>{isDrop ? "Dropped" : "Increased"} ${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    );
                } else {
                    changeElement = <div className="mt-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">No Change</div>;
                }
            } else {
                changeElement = <div className="mt-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Initial Log</div>;
            }

            return (
                <div className="bg-[#0c1523]/95 backdrop-blur-md border border-brand-border p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] min-w-[170px] transform -translate-y-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{label}</p>
                    <p className="text-2xl font-black text-brand-cyan">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="h-px w-full bg-brand-border/50 my-2" />
                    {changeElement}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
            <Navbar />

            <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </button>

                    <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm", trend.bg, trend.border)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", trend.color === 'text-emerald-400' ? 'bg-emerald-400' : 'bg-rose-400')} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", trend.color)}>{trend.icon ? <span className="inline-flex mr-1">{trend.icon}</span> : null} Live Status: Tracking Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Card */}
                        <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8">
                                <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border", trend.bg, trend.color, trend.border)}>
                                    Real-Time Signal
                                </span>
                            </div>

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
                                            <ShieldCheck className="w-3 h-3" /> Verified Source
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

                        {/* Marketplace Banner */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2 px-2">
                                <TrendingDown className="w-5 h-5 text-brand-cyan" /> Market Deal
                            </h2>
                            <div className="bg-brand-card/30 border border-brand-border p-6 rounded-3xl flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-2xl p-2.5 border border-brand-border shadow-xl flex items-center justify-center overflow-hidden">
                                        <img src={product.storeLogo || "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"} alt="eBay" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase tracking-tight">eBay Store</h4>
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Best Market Price</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-brand-cyan">{product.last_price ? `$${parseFloat(product.last_price).toLocaleString()}` : "—"}</span>
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Verified Now</span>
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

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Intelligence Report</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Current Price</span>
                                    <span className="text-xl font-black text-white">{product.last_price ? `$${parseFloat(product.last_price).toLocaleString()}` : "—"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase", trend.color)}>{trend.text}</span>
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
                                <button
                                    onClick={() => setShowAlertModal(true)}
                                    className="w-full py-4 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-white hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan transition-all uppercase tracking-widest shadow-lg"
                                >
                                    <Bell className="w-4 h-4" /> Set Alert
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Full Width Chart Card */}
                    <div className="lg:col-span-12">
                        <div className="bg-brand-card border border-brand-border rounded-[3rem] pt-8 md:pt-12 pb-12 space-y-8 relative overflow-hidden flex flex-col">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-8 md:px-12">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                        Price Analytics <Activity className="w-5 h-5 text-brand-cyan" />
                                    </h2>
                                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Historical Asset Performance</p>
                                </div>

                                {priceHistory.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Lowest Edge</p>
                                            <p className="text-base font-black text-white leading-none">${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Average Level</p>
                                            <p className="text-base font-black text-white leading-none">${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Highest Peak</p>
                                            <p className="text-base font-black text-white leading-none">${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {priceHistory.length > 0 ? (
                                <div className="h-[400px] w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory} margin={{ top: 60, right: 40, left: 10, bottom: 30 }}>
                                            <defs>
                                                <linearGradient id="detailPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.6} />
                                                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} opacity={0.3} />
                                            <ReferenceLine
                                                y={avgPrice}
                                                stroke="#64748b"
                                                strokeDasharray="5 5"
                                                opacity={0.6}
                                                label={{
                                                    position: 'insideBottomRight',
                                                    value: `AVG: $${avgPrice.toFixed(2)}`,
                                                    fill: '#64748b',
                                                    fontSize: 10,
                                                    fontWeight: 900,
                                                    offset: 10
                                                }}
                                            />

                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
                                                dy={15}
                                                padding={{ left: 30, right: 30 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
                                                domain={[Math.floor(minPrice - 5), Math.ceil(maxPrice + 5)]}
                                                width={60}
                                                allowDecimals={false}
                                                tickCount={6}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00E5FF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#00E5FF"
                                                strokeWidth={4}
                                                fill="url(#detailPrice)"
                                                activeDot={(props) => {
                                                    const { cx, cy, payload } = props;
                                                    if (!cx || !cy || !payload) return null;
                                                    return (
                                                        <g>
                                                            <circle cx={cx} cy={cy} r={6} fill="#0c1523" stroke="#00E5FF" strokeWidth={3} />
                                                            <rect x={cx - 30} y={cy - 30} width={60} height={20} rx={4} fill="#00E5FF" />
                                                            <path d={`M ${cx - 4} ${cy - 10} L ${cx} ${cy - 5} L ${cx + 4} ${cy - 10}`} fill="#00E5FF" />
                                                            <text x={cx} y={cy - 16} textAnchor="middle" fill="#0c1523" fontSize="11" fontWeight="900" fontFamily="inherit" pointerEvents="none">
                                                                ${payload.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </text>
                                                        </g>
                                                    );
                                                }}
                                                dot={{ r: 4, fill: "#0c1523", stroke: "#00E5FF", strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="mx-8 md:mx-12 h-[250px] flex items-center justify-center border-2 border-dashed border-brand-border rounded-3xl">
                                    <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Awaiting First Price Entry</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <ReactTooltip id="p-tip" style={{ backgroundColor: "#0c1523" }} />

            {/* Alert Confirmation Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAlertModal(false)} />
                    <div className="relative bg-[#0c1829] border border-brand-cyan/20 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,229,255,0.1)] max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-200">
                        <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-cyan/20">
                            <Bell className="w-8 h-8 text-brand-cyan" />
                        </div>
                        <h3 className="text-white font-black uppercase tracking-tight text-lg mb-3 italic">Alert Activated!</h3>
                        <p className="text-gray-400 text-[11px] leading-relaxed font-medium uppercase tracking-[0.05em] mb-8">
                            You'll receive an email at <span className="text-brand-cyan font-black">{userEmail}</span> as soon as the price fluctuates.
                        </p>
                        <button
                            onClick={() => setShowAlertModal(false)}
                            className="w-full py-3 bg-brand-cyan text-brand-bg font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-cyan/20"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
