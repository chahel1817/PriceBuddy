"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ExternalLink, TrendingDown, TrendingUp,
    AlertCircle, Bell, Share2, Globe, Clock, ShieldCheck, Package, Activity, Zap, Loader2
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
    const [targetDisplay, setTargetDisplay] = React.useState("");
    const [isUpdatingTarget, setIsUpdatingTarget] = React.useState(false);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);

    const productId = resolvedParams.id;

    React.useEffect(() => {
        const fetchDetail = async () => {
            try {
                const storedUser = sessionStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUserEmail(parsed.email || "your email");
                }

                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
                const res = await fetch(`${API_BASE_URL}/products/${productId}`);
                const result = await res.json();
                if (result.success) {
                    setProduct(result.data);
                    if (result.data.target_price) {
                        setTargetDisplay(result.data.target_price.toString());
                    }
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
            date: new Date(h.created_at).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }),
            price: parseFloat(h.price)
        }))
        .filter(item => isFinite(item.price) && item.price > 0 && item.price < 500000); // Increased limit to 500k to support high-end devices like iPhone Pro Max / Samsung Ultra

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

    const handleUpdateTarget = async () => {
        if (!targetDisplay) return;
        setIsUpdatingTarget(true);
        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
            const res = await fetch(`${API_BASE_URL}/api/products/${productId}/target-price`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target_price: parseFloat(targetDisplay) })
            });
            const data = await res.json();
            if (data.success) {
                setProduct(prev => ({ ...prev, target_price: parseFloat(targetDisplay) }));
                setShowSuccessModal(true);
            }
        } catch (e) {
            console.error("Failed to update target price:", e);
        } finally {
            setIsUpdatingTarget(false);
        }
    };

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
                            <span>{isDrop ? "Dropped" : "Increased"} ₹{Math.abs(diff).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                    <p className="text-2xl font-black text-brand-cyan">₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

            <main className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full overflow-x-hidden">
                {/* Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-all group w-fit"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                    </button>

                    <div className={cn("hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm", trend.bg, trend.border)}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", trend.color === 'text-emerald-400' ? 'bg-emerald-400' : 'bg-rose-400')} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", trend.color)}>{trend.icon ? <span className="inline-flex mr-1 text-[10px]">{trend.icon}</span> : null} Live Status: High Precision Tracking</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Card */}
                        <div className="bg-[#111827] border border-brand-border rounded-[2rem] md:rounded-[3rem] p-5 sm:p-8 md:p-12 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-12 md:items-center relative z-10">
                                <div className="w-full max-w-xs mx-auto md:mx-0 md:w-64 aspect-square bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-brand-border flex items-center justify-center transform hover:scale-105 transition-transform duration-700 relative group/img">
                                    <div className="absolute inset-4 bg-gradient-to-tr from-brand-cyan/5 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                                    ) : (
                                        <Package className="w-20 h-20 text-gray-200" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-wrap gap-3">
                                        <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md shadow-inner", trend.bg, trend.color, trend.border)}>
                                            Intelligence Active
                                        </span>
                                        <span className="px-4 py-1.5 bg-[#0c1523] border border-brand-border rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] shadow-inner">
                                            {product.category}
                                        </span>
                                        <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em] flex items-center gap-2 shadow-inner">
                                            <ShieldCheck className="w-4 h-4" /> Trusted Asset
                                        </span>
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tighter uppercase italic drop-shadow-sm line-clamp-3">{product.name}</h1>
                                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-gray-500">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-brand-bg/50 rounded-lg border border-brand-border/50">
                                            <Globe className="w-4 h-4 text-brand-cyan" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">{product.store || 'Marketplace'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-gray-700" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-700">Refreshed Dec 2023</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marketplace Banner */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <TrendingDown className="w-5 h-5 text-brand-cyan" /> Market Deal
                                </h2>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Direct Store Access</span>
                            </div>
                            <div className="bg-[#111827] border border-brand-border p-5 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group hover:border-brand-cyan/20 transition-all shadow-xl gap-6 md:gap-8">
                                <div className="flex w-full min-w-0 items-center gap-4 sm:gap-6 md:w-auto">
                                    <div className="w-16 h-16 bg-white rounded-2xl p-3 border border-brand-border shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <img src={product.storeLogo || "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"} alt="Store" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">{product.store || 'Store'}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-emerald-500 text-brand-bg rounded text-[8px] font-black uppercase tracking-widest">Active Deal</span>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Fast Shipping Available</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8 w-full md:w-auto">
                                    <div className="flex flex-col md:items-end text-center md:text-right">
                                        <span className="text-3xl font-black text-brand-cyan drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]">₹{product.last_price ? parseFloat(product.last_price).toLocaleString('en-IN') : "—"}</span>
                                        <div className="flex items-center gap-2 mt-1 md:justify-end">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Verified 30 minutes ago</span>
                                        </div>
                                    </div>
                                    <a
                                        href={product.product_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full md:w-auto px-8 py-4 bg-brand-cyan text-brand-bg rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-cyan/20"
                                    >
                                        <span>Go to Deal</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-card border border-brand-border rounded-3xl p-5 sm:p-8 space-y-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Intelligence Report</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Current Price</span>
                                    <span className="text-xl font-black text-white">{product.last_price ? `₹${parseFloat(product.last_price).toLocaleString('en-IN')}` : "—"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-400">Status</span>
                                    <span className={cn("text-[10px] font-black uppercase", trend.color)}>{trend.text}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111827] border border-brand-cyan/20 rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-8 md:p-10 space-y-8 relative overflow-hidden group shadow-[0_0_50px_rgba(0,229,255,0.05)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Bell className="w-24 h-24 text-brand-cyan -rotate-12" />
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shadow-lg">
                                        <Zap className="w-6 h-6 text-brand-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Price Strategy</h3>
                                        <p className="text-[8px] font-black text-brand-cyan uppercase tracking-[0.2em]">Automated Alert Engine</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Target Threshold (₹)</label>
                                        <input
                                            type="number"
                                            value={targetDisplay}
                                            onChange={(e) => setTargetDisplay(e.target.value)}
                                            placeholder="Enter value..."
                                            className="w-full bg-[#0c1523] border border-brand-border rounded-2xl px-6 py-4 text-white font-black focus:outline-none focus:border-brand-cyan/50 transition-all text-base shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUpdateTarget}
                                        disabled={isUpdatingTarget}
                                        className="w-full py-4 bg-brand-cyan text-brand-bg rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-cyan/30 flex items-center justify-center gap-3"
                                    >
                                        {isUpdatingTarget ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        {isUpdatingTarget ? 'Deploying Alert...' : 'Activate Precision Alert'}
                                    </button>
                                    <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest text-center leading-relaxed">
                                        System will monitor price fluctuations 24/7 and trigger email sequence on hit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Full Width Chart Card */}
                    <div className="lg:col-span-12">
                        <div className="bg-brand-card border border-brand-border rounded-[2rem] md:rounded-[3rem] pt-6 md:pt-12 pb-8 md:pb-12 space-y-6 md:space-y-8 relative overflow-hidden flex flex-col">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-5 sm:px-8 md:px-12">
                                <div className="space-y-1">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                        Price Analytics <Activity className="w-5 h-5 text-brand-cyan" />
                                    </h2>
                                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Historical Asset Performance</p>
                                </div>

                                {priceHistory.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Lowest Edge</p>
                                            <p className="text-base font-black text-white leading-none">₹{minPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Average Level</p>
                                            <p className="text-base font-black text-white leading-none">₹{avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="px-4 py-2.5 bg-[#0c1523] border border-brand-border rounded-xl">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Highest Peak</p>
                                            <p className="text-base font-black text-white leading-none">₹{maxPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {priceHistory.length > 0 ? (
                                <div className="h-[300px] sm:h-[400px] w-full relative z-10 overflow-x-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceHistory} margin={{ top: 40, right: 16, left: 0, bottom: 24 }}>
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
                                                    value: `AVG: ₹${avgPrice.toFixed(2)}`,
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
                                                tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900 }}
                                                dy={15}
                                                padding={{ left: 30, right: 30 }}
                                                minTickGap={50}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 800 }}
                                                domain={[Math.floor(minPrice - 5), Math.ceil(maxPrice + 5)]}
                                                width={48}
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
                                                                ₹{payload.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <div className="mx-5 sm:mx-8 md:mx-12 h-[220px] sm:h-[250px] flex items-center justify-center border-2 border-dashed border-brand-border rounded-3xl">
                                    <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Awaiting First Price Entry</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
            <ReactTooltip id="p-tip" style={{ backgroundColor: "#0c1523" }} />

            {/* Target Success Modal */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
                        <div className="relative bg-[#0c1829] border border-brand-cyan/25 p-8 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,229,255,0.15)] max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-300">
                            <div className="w-20 h-20 bg-brand-cyan/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-brand-cyan/20">
                                <ShieldCheck className="w-10 h-10 text-brand-cyan" />
                            </div>
                            <h3 className="text-white font-black uppercase tracking-tight text-xl mb-3 italic">Alert Armed! 🎯</h3>
                            <p className="text-gray-400 text-[11px] leading-relaxed font-bold uppercase tracking-[0.1em] mb-8">
                                A precision alert has been set. You will receive an email at <span className="text-brand-cyan font-black">{userEmail}</span> as soon as <span className="text-white font-black">{product.name}</span> hits <span className="text-brand-cyan font-black">₹{parseFloat(targetDisplay).toLocaleString('en-IN')}</span>.
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-4 bg-brand-cyan text-brand-bg font-black rounded-2xl text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-cyan/30"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
