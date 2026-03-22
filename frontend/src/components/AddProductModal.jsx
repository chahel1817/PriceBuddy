"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    X, Search, CheckCircle2, Plus, ExternalLink,
    Loader2, AlertCircle, PackageSearch, Zap, Tag,
    ShoppingBag, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Audio', 'Electronics', 'Gaming', 'Footwear', 'Home'];
const HINTS = ['RTX 4090', 'iPhone 15', 'AirPods Pro', 'Samsung Galaxy S24', 'MacBook Pro M3'];

// ── Skeleton Card (Grid) ───────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
            <div className="h-40 bg-white/5" />
            <div className="p-3.5 space-y-2.5">
                <div className="h-2.5 bg-white/5 rounded-full w-5/6" />
                <div className="h-2.5 bg-white/5 rounded-full w-3/6" />
                <div className="h-7 bg-white/5 rounded-xl mt-3" />
            </div>
        </div>
    );
}

// ── Product Card (Grid) ────────────────────────────────────────────────────────
function ProductCard({ product, onTrack, isTracked, isTracking }) {
    const [imgErr, setImgErr] = useState(false);

    return (
        <div className={cn(
            "group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300",
            isTracked
                ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
                : "border-white/8 bg-white/[0.025] hover:border-brand-cyan/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-brand-cyan/5 hover:-translate-y-0.5"
        )}>
            {/* Tracked stamp */}
            {isTracked && (
                <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Tracked</span>
                </div>
            )}

            {/* Image */}
            <div className="relative h-40 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.image && !imgErr ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgErr(true)}
                    />
                ) : (
                    <PackageSearch className="w-12 h-12 text-gray-300" />
                )}
                {/* eBay badge */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-brand-cyan/90 backdrop-blur-sm rounded text-[8px] font-black text-brand-bg uppercase tracking-widest">
                    eBay
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-3.5 gap-3">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-white/90 leading-snug line-clamp-2 mb-1.5">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-black text-brand-cyan tracking-tight">{product.price}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {isTracked ? (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tracking</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => onTrack(product)}
                            disabled={isTracking}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                                "bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan",
                                "hover:bg-brand-cyan hover:text-brand-bg hover:border-brand-cyan hover:shadow-lg hover:shadow-brand-cyan/20",
                                "active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            )}
                        >
                            {isTracking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                            {isTracking ? 'Adding...' : 'Track'}
                        </button>
                    )}
                    <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-white/10 text-gray-500 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all duration-200 flex-shrink-0"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AddProductModal({ isOpen, onClose, onSuccess }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [trackedIds, setTrackedIds] = useState(new Set());
    const [trackingId, setTrackingId] = useState(null);
    const [category, setCategory] = useState('All');
    const [addedCount, setAddedCount] = useState(0);
    const [activeHint, setActiveHint] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    // Filter by selected category
    const filteredResults = category === 'All' ? results : results;   // server-side category TBD; for now show all

    const handleSearch = async (e, overrideQuery) => {
        e?.preventDefault();
        const q = (overrideQuery || query).trim();
        if (!q || q.length < 2) return;
        setSearching(true);
        setSearchError(null);
        setResults([]);
        setSearched(false);
        try {
            const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.success) {
                setResults(data.data || []);
                setSearched(true);
                if (!data.data?.length) setSearchError('No products found. Try a different keyword.');
            } else {
                setSearchError(data.message || 'Search failed. Please try again.');
            }
        } catch {
            setSearchError('Could not reach the server. Make sure the backend is running.');
        } finally {
            setSearching(false);
        }
    };

    const handleHint = (hint) => {
        setQuery(hint);
        setActiveHint(hint);
        handleSearch(null, hint);
    };

    const handleTrack = async (product) => {
        setTrackingId(product.id);
        try {
            // Get logged-in user's ID so the product is saved under their account
            const storedUser = localStorage.getItem('user');
            const user_id = storedUser ? JSON.parse(storedUser)?.id : null;

            const res = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: product.name,
                    category: category === 'All' ? 'Electronics' : category,
                    image_url: product.image || null,
                    url: product.url,
                    user_id,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setTrackedIds(prev => new Set([...prev, product.id]));
                setAddedCount(prev => prev + 1);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error('Failed to add product:', err);
        } finally {
            setTrackingId(null);
        }
    };

    const handleReset = () => {
        onClose();
        setTimeout(() => {
            setQuery(''); setResults([]); setSearched(false);
            setSearchError(null); setTrackedIds(new Set());
            setAddedCount(0); setSearching(false); setActiveHint(null);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={handleReset} />

            {/* Modal Shell — wider for grid */}
            <div
                className="relative w-full sm:max-w-4xl flex flex-col rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] max-h-[92vh]"
                style={{ background: 'linear-gradient(160deg, #0c1829 0%, #070e1a 60%, #060b13 100%)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                {/* Top glow line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-brand-cyan/5 blur-2xl rounded-full" />

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <div className="flex-shrink-0 px-7 pt-6 pb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white tracking-tight">Track eBay Products</h2>
                                <p className="text-[11px] text-gray-500 font-medium">Search live listings and add them to your price tracker</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {addedCount > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{addedCount} Tracking</span>
                                </div>
                            )}
                            <button
                                onClick={handleReset}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-5">
                        <form onSubmit={handleSearch} className="relative group">
                            {/* Focus glow */}
                            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/15 to-brand-cyan/0 opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm pointer-events-none" />
                            <div className="relative flex items-center bg-[#080f1c] border border-white/8 rounded-2xl overflow-hidden focus-within:border-brand-cyan/40 transition-all duration-300">
                                <div className="pl-5 pr-3 flex-shrink-0">
                                    <Search className="w-4 h-4 text-gray-600 group-focus-within:text-brand-cyan transition-colors" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search eBay — iPhone 15, RTX 4090, AirPods Pro..."
                                    className="flex-1 bg-transparent py-3.5 pr-3 text-sm text-white placeholder:text-gray-700 font-medium focus:outline-none"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <div className="pr-2 flex-shrink-0">
                                    <button
                                        type="submit"
                                        disabled={searching || query.trim().length < 2}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-brand-bg font-black rounded-xl text-[11px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-brand-cyan/20"
                                    >
                                        {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                        {searching ? 'Searching' : 'Search'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Category chips + Quick hints */}
                    <div className="mt-4 flex flex-col gap-3">
                        {/* Categories */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Tag className="w-3 h-3 text-gray-700 flex-shrink-0" />
                            {CATEGORIES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-150 border",
                                        category === c
                                            ? "bg-brand-cyan text-brand-bg border-brand-cyan shadow-sm shadow-brand-cyan/30"
                                            : "bg-transparent border-white/8 text-gray-600 hover:text-gray-300 hover:border-white/15"
                                    )}
                                >{c}</button>
                            ))}
                        </div>
                        {/* Quick-search hints */}
                        {!searched && !searching && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">Try:</span>
                                {HINTS.map(hint => (
                                    <button
                                        key={hint}
                                        onClick={() => handleHint(hint)}
                                        className={cn(
                                            "px-3 py-1 rounded-xl border text-[10px] font-semibold transition-all duration-150",
                                            activeHint === hint
                                                ? "bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan"
                                                : "bg-white/[0.03] border-white/8 text-gray-500 hover:text-white hover:border-brand-cyan/25"
                                        )}
                                    >{hint}</button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                </div>

                {/* ── RESULTS AREA ──────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto min-h-0 px-7 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Loading */}
                    {searching && (
                        <div>
                            <div className="flex items-center gap-3 mb-5 pt-1">
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Scanning eBay live listings...</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {searchError && !searching && (
                        <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/15 rounded-2xl mt-1">
                            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-300/80 font-medium">{searchError}</p>
                        </div>
                    )}

                    {/* Empty / pre-search */}
                    {!searching && !searched && !searchError && (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <div className="relative mb-5">
                                <div className="w-24 h-24 rounded-3xl bg-brand-bg border border-white/8 flex items-center justify-center shadow-2xl">
                                    <ShoppingBag className="w-10 h-10 text-gray-700" />
                                </div>
                                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-brand-cyan flex items-center justify-center shadow-lg shadow-brand-cyan/40 border-2 border-[#070e1a]">
                                    <Search className="w-3.5 h-3.5 text-brand-bg" />
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-300 mb-1">Search any product to begin</p>
                            <p className="text-xs text-gray-600 max-w-xs">Get real-time prices from millions of eBay listings and track them directly in your dashboard</p>
                        </div>
                    )}

                    {/* Results Grid */}
                    {!searching && searched && filteredResults.length > 0 && (
                        <div>
                            {/* Summary bar */}
                            <div className="flex items-center justify-between mb-4 pt-1">
                                <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest">
                                    <span className="text-brand-cyan">{filteredResults.length}</span> listings found for <span className="text-gray-300">"{query}"</span>
                                </p>
                                {addedCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase">{addedCount} tracking</span>
                                    </div>
                                )}
                            </div>

                            {/* 4-column product grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredResults.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onTrack={handleTrack}
                                        isTracked={trackedIds.has(product.id)}
                                        isTracking={trackingId === product.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── FOOTER ───────────────────────────────────────────────── */}
                {addedCount > 0 && (
                    <div className="flex-shrink-0 relative px-7 py-4 border-t border-white/8" style={{ background: 'linear-gradient(to top, rgba(0,229,255,0.04) 0%, transparent 100%)' }}>
                        <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
                        <button
                            onClick={handleReset}
                            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-brand-cyan text-brand-bg font-black rounded-2xl hover:scale-[1.01] active:scale-95 transition-all duration-150 text-[11px] uppercase tracking-widest shadow-lg shadow-brand-cyan/20"
                        >
                            <Rocket className="w-4 h-4" />
                            Done · {addedCount} product{addedCount !== 1 ? 's' : ''} now tracking
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
