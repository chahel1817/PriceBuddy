"use client";

import Link from 'next/link';
import { Search } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-8 py-6 bg-brand-bg/50 backdrop-blur-md border-b border-brand-border sticky top-0 z-40">
            <Link href="/dashboard" className="flex items-center gap-2 mr-8 group md:hidden">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </Link>
            <div className="flex-1 max-w-xl">

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-brand-cyan transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products, stores or analysis..."
                        className="bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2.5 w-full text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-card hover:bg-brand-cyan/10 border border-brand-border hover:border-brand-cyan/50 rounded-xl transition-all group">

                    <span className="text-xs font-bold group-hover:text-brand-cyan">UPGRADE TO PRO</span>
                </button>
            </div>
        </nav>
    );
}
