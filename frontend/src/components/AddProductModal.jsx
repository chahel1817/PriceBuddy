"use client";

import React, { useState } from 'react';
import { X, Link as LinkIcon, ShoppingBag, Tag, Globe, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddProductModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        url: '',
        store: 'Amazon',
        category: 'Electronics'
    });

    const stores = ['Amazon', 'Walmart', 'Best Buy', 'Apple', 'Nike', 'Other'];
    const categories = ['Electronics', 'Smartphones', 'Audio', 'Laptops', 'Footwear', 'Home'];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(2); // Show success state
        setTimeout(() => {
            onClose();
            setStep(1);
            setFormData({ url: '', store: 'Amazon', category: 'Electronics' });
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#060b13]/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-brand-card border border-brand-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Add New Product</h2>
                            <p className="text-gray-500 text-sm">Paste a product URL to start tracking prices instantly.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Product URL */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3" /> Product URL
                                </label>
                                <input
                                    required
                                    type="url"
                                    placeholder="https://amazon.com/dp/B0CHX1W1XY"
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan transition-all placeholder:text-gray-700 font-medium"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>

                            {/* Store & Category Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Store
                                    </label>
                                    <select
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan transition-all cursor-pointer appearance-none"
                                        value={formData.store}
                                        onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                                    >
                                        {stores.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Category
                                    </label>
                                    <select
                                        className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan transition-all cursor-pointer appearance-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-brand-cyan text-brand-bg font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Initialize Scraper
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-in zoom-in duration-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Tracker Activated!</h2>
                            <p className="text-gray-500 text-sm max-w-[280px]">Our scrapers are now monitoring this product. You'll receive alerts on any price drops.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
