"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    BellOff,
    Settings,
    Trash2,
    Edit2,
    Search,
    Filter,
    ArrowRight,
    ArrowLeft,
    Clock,
    Target,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { alerts } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All");

    const filteredAlerts = alerts.filter(alert => {
        const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "All" || alert.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-white font-sans selection:bg-brand-cyan selection:text-brand-bg">
            <Navbar />

            <main className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                {/* Abstract Background Decorations */}
                <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-brand-cyan/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-40 left-0 -z-10 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

                {/* Header section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.15)] group relative">
                                    <div className="absolute inset-0 bg-brand-cyan/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Bell className="w-7 h-7 text-brand-cyan animate-pulse relative z-10" />
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                                        Price <span className="text-brand-cyan">Alerts</span>
                                    </h1>
                                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-ping" />
                                        Monitoring {alerts.length} active monitors
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Chips */}
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Active', 'Waiting', 'Triggered'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border relative overflow-hidden group/chip",
                                        filter === f
                                            ? "bg-brand-cyan text-brand-bg border-brand-cyan shadow-lg shadow-brand-cyan/20"
                                            : "bg-brand-card/50 border-brand-border text-gray-500 hover:border-brand-cyan/30 hover:text-white"
                                    )}
                                >
                                    <span className="relative z-10">{f}</span>
                                    {filter !== f && <div className="absolute inset-0 translate-y-full group-hover/chip:translate-y-0 bg-brand-cyan/10 transition-transform" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="bg-brand-card/30 border border-brand-border rounded-3xl px-6 py-4 flex flex-col justify-center min-w-[200px] relative overflow-hidden group">
                            <div className="absolute -right-2 -top-2 w-16 h-16 bg-brand-cyan/5 blur-xl rounded-full" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest relative z-10">Savings Potential</span>
                            <div className="text-2xl font-black text-white tracking-tighter relative z-10">₹12,450</div>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH ALERTS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-brand-card/50 border border-brand-border rounded-2xl py-5 pl-11 pr-6 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-cyan/50 focus:bg-brand-card transition-all w-full md:w-64 h-full shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* Alerts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAlerts.map((alert, idx) => (
                        <div key={alert.id} className="group relative">
                            {/* Decorative Background Glow (Hover only for consistency) */}
                            <div className="absolute -inset-0.5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl bg-brand-cyan/20" />

                            <div className={cn(
                                "bg-brand-card border border-brand-border rounded-[2.5rem] p-8 relative z-10 transition-all duration-500 h-full flex flex-col group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
                                alert.status === 'Triggered' && "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                            )}>
                                {/* Triggered celebration icon */}
                                {alert.status === 'Triggered' && (
                                    <div className="absolute top-4 right-4 animate-bounce">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-6">
                                    <div className="w-24 h-24 bg-white rounded-2xl p-4 border border-brand-border shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:rotate-3 transition-transform duration-500">
                                        <img src={alert.productImage} alt={alert.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border",
                                                alert.status === 'Active' && "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20",
                                                alert.status === 'Waiting' && "text-amber-500 bg-amber-500/10 border-amber-500/20",
                                                alert.status === 'Triggered' && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 animate-pulse"
                                            )}>
                                                {alert.status === 'Triggered' ? '✨ UNLOCKED' : alert.status}
                                            </span>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-2 h-2" /> {alert.lastChecked}
                                                </span>
                                                <span className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter">Every 6 Hours</span>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-black text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-brand-cyan transition-colors">
                                            {alert.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan/50" />
                                            {alert.notificationType} Monitors Active
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-5 bg-brand-bg/50 border border-brand-border rounded-3xl grid grid-cols-2 gap-4 relative overflow-hidden group/stats">
                                    <div className="absolute inset-0 bg-brand-cyan/[0.02] translate-y-full group-hover/stats:translate-y-0 transition-transform" />
                                    <div className="space-y-1 relative z-10">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                            <Target className="w-3 h-3 text-brand-cyan" /> Target
                                        </span>
                                        <div className="text-xl font-black text-white tracking-tighter">
                                            {alert.targetPrice}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-right relative z-10">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Current</span>
                                        <div className={cn(
                                            "text-xl font-black tracking-tighter transition-colors",
                                            alert.status === 'Triggered' ? "text-emerald-400" : "text-gray-400 line-through decoration-rose-500/50"
                                        )}>
                                            {alert.currentPrice}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Indicator */}
                                {(() => {
                                    const current = parseFloat(alert.currentPrice.replace(/[^\d.]/g, ''));
                                    const target = parseFloat(alert.targetPrice.replace(/[^\d.]/g, ''));
                                    const diff = current - target;
                                    const progress = Math.min(100, Math.max(0, (1 - (diff / current)) * 100));

                                    return (
                                        <div className="mt-4 space-y-1.5">
                                            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                                                <span className="text-gray-500">
                                                    {diff <= 0 ? 'Target Reached' : 'Price GAP'}
                                                </span>
                                                <span className={cn(
                                                    "transition-colors",
                                                    diff <= 0 ? "text-emerald-500" : "text-brand-cyan"
                                                )}>
                                                    {diff <= 0 ? 'GO BUY NOW' : `₹${diff.toLocaleString('en-IN')} until target`}
                                                </span>
                                            </div>
                                            <div className="h-1 bg-brand-bg border border-brand-border rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        diff <= 0 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-brand-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                                                    )}
                                                    style={{ width: `${diff <= 0 ? 100 : progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="mt-auto pt-6 flex items-center gap-2">
                                    <button
                                        onClick={() => router.push(`/product/${alert.productId}`)}
                                        className={cn(
                                            "flex-1 border py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn",
                                            alert.status === 'Triggered'
                                                ? "bg-emerald-500 border-emerald-500 text-brand-bg hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                                : "bg-brand-bg border-brand-border text-white hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan"
                                        )}
                                    >
                                        View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="p-2.5 bg-brand-bg border border-brand-border rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-2.5 bg-brand-bg border border-brand-border rounded-xl text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Alert Card */}
                    <button className="group relative h-full">
                        <div className="absolute -inset-0.5 bg-brand-cyan/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500 blur-xl" />
                        <div className="h-full min-h-[300px] border-2 border-dashed border-brand-border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-brand-cyan hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all relative z-10">
                            <div className="w-16 h-16 rounded-full bg-brand-card/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BellOff className="w-8 h-8" />
                            </div>
                            <div className="text-center space-y-1">
                                <span className="text-xs font-black uppercase tracking-widest">New Monitor</span>
                                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Add a product to track</p>
                            </div>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
}
