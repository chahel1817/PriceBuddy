"use client";

import React from 'react';
import Link from 'next/link';

export default function Navbar() {

    return (
        <nav className="flex items-center justify-between px-8 py-6 bg-brand-bg/50 backdrop-blur-md border-b border-brand-border sticky top-0 z-40">
            <Link href="/dashboard" className="flex items-center gap-2 mr-8 group md:hidden">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </Link>
            <div className="flex-1 max-w-xl">
                {/* Search Bar Removed from Navbar for a cleaner Dashboard layout */}
            </div>

            <div className="flex items-center gap-6 text-gray-400">
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-card hover:bg-brand-cyan/10 border border-brand-border hover:border-brand-cyan/50 rounded-xl transition-all group">

                    <span className="text-xs font-bold group-hover:text-brand-cyan">UPGRADE TO PRO</span>
                </button>
            </div>
        </nav>
    );
}
