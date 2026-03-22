"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { BarChart3, TrendingDown, Target, Zap, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function AnalyticsPage() {
    const [hasData, setHasData] = React.useState(false);
    const [stats, setStats] = React.useState({ maxDrop: 0, savings: 0, count: 0 });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user?.id) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/products?user_id=${user.id}`);
                const result = await res.json();

                if (result.success && result.data.length > 0) {
                    let totalSavings = 0;
                    let maxDropPct = 0;

                    result.data.forEach(p => {
                        const current = parseFloat(p.last_price);
                        const prev = parseFloat(p.prev_price);

                        if (current && prev && current < prev) {
                            totalSavings += (prev - current);
                            const draftPct = ((prev - current) / prev) * 100;
                            if (draftPct > maxDropPct) maxDropPct = draftPct;
                        }
                    });

                    setStats({
                        maxDrop: maxDropPct.toFixed(1),
                        savings: totalSavings.toFixed(2),
                        count: result.data.length
                    });
                }
            } catch (e) {
                console.error("Analytics fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        checkData();
    }, []);

    return (
        <div className="flex flex-col flex-1 relative">
            {/* Background mesh */}
            <div className="absolute inset-0 bg-[#060b13] -z-10" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-cyan/5 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full -z-10" />

            <Navbar />

            <main className="p-8 space-y-8 overflow-y-auto">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Analytics & Intelligence</h1>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full">
                            <Activity className="w-3 h-3 text-brand-cyan" />
                            <span className="text-[10px] font-bold text-brand-cyan uppercase tracking-wider">Market Insights</span>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Deep dive into market trends and price optimization data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full" />
                        <div className="p-3 bg-brand-bg rounded-xl border border-brand-border w-fit mb-4 group-hover:border-emerald-500/30 transition-colors">
                            <TrendingDown className="text-emerald-400 w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.maxDrop}%</h3>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Max Price Drop</p>
                    </div>

                    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-cyan/5 blur-2xl rounded-full" />
                        <div className="p-3 bg-brand-bg rounded-xl border border-brand-border w-fit mb-4 group-hover:border-brand-cyan/30 transition-colors">
                            <Target className="text-brand-cyan w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">${stats.savings}</h3>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Savings Found</p>
                    </div>

                    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full" />
                        <div className="p-3 bg-brand-bg rounded-xl border border-brand-border w-fit mb-4 group-hover:border-amber-500/30 transition-colors">
                            <Zap className="text-amber-400 w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.count}</h3>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Assets</p>
                    </div>
                </div>

                <div className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <BarChart3 className="w-32 h-32 text-brand-cyan" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="max-w-md space-y-4">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Unlock Premium Analytics</h2>
                            <p className="text-gray-400 text-sm">Gain access to historical trends beyond 30 days, predictive pricing models using machine learning, and advanced store-wide competitor analysis.</p>
                            <button className="px-8 py-3 bg-brand-cyan text-brand-bg font-black rounded-2xl hover:scale-[1.03] active:scale-95 transition-all text-xs uppercase tracking-widest shadow-lg shadow-brand-cyan/20">
                                Upgrade to Enterprise
                            </button>
                        </div>
                        <div className="flex-1 w-full h-64 bg-brand-bg/50 rounded-3xl border border-dashed border-brand-border flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <div className="p-3 bg-brand-card rounded-2xl border border-brand-border w-fit mx-auto opacity-50">
                                    <Activity className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">No performance data available</p>
                                <p className="text-[9px] text-gray-700">Analytics will activate after your first tracked items update prices.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-brand-bg/20 p-8 border border-brand-border rounded-[2.5rem]">
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">Active Categories</h4>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="px-4 py-2 bg-brand-card rounded-xl border border-brand-border text-xs text-gray-500 font-bold uppercase tracking-widest">Awaiting Data</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">Scraper Health</h4>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl">
                                <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest underline underline-offset-4 ring-offset-brand-bg">eBay Gateway: Active</span>
                            </div>
                            <p className="text-[10px] text-gray-600 font-medium">System is monitoring price fluctuations every 12 hours.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
