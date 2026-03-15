"use client";

import React from 'react';
import {
    LayoutDashboard, Package, ArrowLeftRight, Bell,
    BarChart3, Cpu, Settings, LogOut, ChevronRight
} from "lucide-react";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'comparison', label: 'Comparison', icon: ArrowLeftRight },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'scrapers', label: 'Scrapers', icon: Cpu },
];

export default function Sidebar() {
    return (
        <aside className="w-64 bg-brand-bg border-r border-brand-border h-screen sticky top-0 flex flex-col z-50">
            {/* Branding */}
            <div className="p-8 flex items-center gap-0">
                <div className="flex items-center justify-center translate-y-[-1px]">
                    <img src="/logo.png" alt="PriceBuddy Icon" className="w-10 h-10 object-contain" />
                </div>
                <span className="text-xl font-extrabold tracking-tighter text-white uppercase translate-x-[-3px]">
                    Price<span className="text-brand-cyan">Buddy</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                            item.active
                                ? "bg-brand-cyan/10 text-brand-cyan"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                item.active ? "text-brand-cyan" : "text-gray-500 group-hover:text-white"
                            )} />
                            <span>{item.label}</span>
                        </div>
                        {item.badge && (
                            <span className="bg-brand-cyan text-brand-bg text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-brand-border space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all text-sm font-medium group">
                    <Settings className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    <span>Settings</span>
                </button>
                <div className="mt-4 p-4 bg-brand-card border border-brand-border rounded-2xl relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-500 border border-brand-border" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Alex Johnson</span>
                            <span className="text-[10px] text-gray-500">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
