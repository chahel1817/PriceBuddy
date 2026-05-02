"use client";

import React from 'react';
import Link from 'next/link';

export default function Navbar() {

    return (
        <nav className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-8 md:py-6 bg-brand-bg/50 backdrop-blur-md border-b border-brand-border sticky top-0 z-40">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-2 group md:hidden">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="truncate text-sm font-black uppercase tracking-tight text-white">
                    Price<span className="text-brand-cyan">Buddy</span>
                </span>
            </Link>
            <div className="flex-1 max-w-xl">
                {/* Search Bar Removed from Navbar for a cleaner Dashboard layout */}
            </div>

            <div className="flex shrink-0 items-center gap-3 text-gray-400">
                <button className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-brand-card hover:bg-brand-cyan/10 border border-brand-border hover:border-brand-cyan/50 rounded-xl transition-all group">

                    <span className="text-[10px] font-bold group-hover:text-brand-cyan sm:text-xs">PRO</span>
                </button>
            </div>
        </nav>
    );
}
