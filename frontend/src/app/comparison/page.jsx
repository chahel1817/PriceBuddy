"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { Activity, ArrowLeftRight, Search, Plus, ExternalLink, TrendingDown, TrendingUp, Minus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ComparisonPage() {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const EBAY_LOGO = "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg";

    const fetchUserProducts = React.useCallback(async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;

            if (!userId) {
                setProducts([]);
                return;
            }

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";
            const res = await fetch(`${API_BASE_URL}/products?user_id=${userId}`);
            const result = await res.json();
            if (result.success) {
                const mapped = result.data.map(p => ({
                    ...p,
                    price: p.last_price ? `$${parseFloat(p.last_price).toLocaleString()}` : 'Syncing...',
                }));
                setProducts(mapped);
            }
        } catch (e) {
            console.error("Comparison fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchUserProducts();
    }, [fetchUserProducts]);

    return (
        <div className="flex flex-col flex-1 relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[#060b13] -z-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

            <Navbar />

            <main className="p-8 space-y-8 overflow-y-auto">
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Product Comparison</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full">
                                <ArrowLeftRight className="w-3 h-3 text-brand-cyan" />
                                <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Side-by-Side</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm italic font-medium">Compare prices across all platforms real-time.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="p-12 text-center col-span-full">
                            <Activity className="w-8 h-8 text-brand-cyan animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loading Comparables...</p>
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden group hover:border-brand-cyan/30 transition-all duration-300 flex flex-col">
                                <div className="p-6 flex flex-col items-center gap-4 bg-brand-bg/20">
                                    <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden p-2 flex items-center justify-center border border-brand-border shadow-2xl group-hover:scale-105 transition-transform">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <Package className="w-12 h-12 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h2 className="text-sm font-black text-white uppercase line-clamp-2 min-h-[2.5rem] tracking-tight">{product.name}</h2>
                                        <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest">{product.category}</span>
                                    </div>
                                </div>

                                <div className="p-6 mt-auto border-t border-brand-border/30 flex flex-col items-center gap-4 bg-white/5 relative">
                                    <div className="absolute top-0 right-0 px-3 py-1 bg-brand-cyan/10 border-b border-l border-brand-cyan/20 rounded-bl-xl">
                                        <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest">Global Best</span>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2 mb-2 border border-brand-border shadow-sm">
                                            <img src={EBAY_LOGO} alt="eBay" className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-2xl font-black text-brand-cyan">{product.price}</p>
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Live from eBay</p>
                                    </div>
                                    <button
                                        onClick={() => window.location.href = `/product/${product.id}`}
                                        className="w-full py-3 bg-brand-bg hover:bg-brand-cyan hover:text-brand-bg rounded-xl border border-brand-border hover:border-brand-cyan text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Inspect Deep Intel
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 border-2 border-dashed border-brand-border rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 bg-brand-bg/20 col-span-full">
                            <div className="p-4 bg-brand-card rounded-2xl border border-brand-border">
                                <ArrowLeftRight className="w-8 h-8 text-gray-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-tight italic">No Comparables Yet</h3>
                                <p className="text-sm text-gray-500 max-w-sm font-medium">Your tracking inventory is empty. Add products from the dashboard to activate real-time intelligence.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
