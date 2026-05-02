"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Package, ArrowLeftRight,
    BarChart3, Settings, ChevronRight, LogOut
} from "lucide-react";
import { cn } from '@/lib/utils';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'products', label: 'Products', icon: Package, href: '/products' },

    { id: 'comparison', label: 'Comparison', icon: ArrowLeftRight, href: '/comparison' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        router.push('/');
    };

    return (
        <>
        <aside className="hidden md:flex w-64 bg-brand-bg border-r border-brand-border h-screen sticky top-0 flex-col z-50 shrink-0">
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
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 font-black">Main Menu</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-brand-cyan/10 text-brand-cyan"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-brand-cyan" : "text-gray-500 group-hover:text-white"
                                )} />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-brand-border space-y-1">
                <Link
                    href="/settings"
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group",
                        pathname === "/settings"
                            ? "bg-brand-cyan/10 text-brand-cyan"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <Settings className={cn("w-5 h-5 transition-colors", pathname === "/settings" ? "text-brand-cyan" : "text-gray-500 group-hover:text-white")} />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/70 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all text-sm font-black uppercase tracking-widest group"
                >
                    <LogOut className="w-5 h-5 transition-colors" />
                    <span>Log Out</span>
                </button>

                <div className="mt-4 p-4 bg-brand-card border border-brand-border rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-500 border border-brand-border p-0.5" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-white uppercase tracking-wider truncate mb-0.5">{user?.name || 'Guest User'}</span>
                            <span className="text-[9px] text-gray-600 font-bold truncate tracking-widest uppercase">{user?.email || 'Unauthorized'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-brand-border bg-brand-bg/95 backdrop-blur-xl px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2">
            <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
                {[...menuItems, { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-black uppercase tracking-tight transition-all",
                                isActive
                                    ? "bg-brand-cyan/10 text-brand-cyan"
                                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-brand-cyan" : "text-gray-500")} />
                            <span className="max-w-full truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
        </>
    );
}
