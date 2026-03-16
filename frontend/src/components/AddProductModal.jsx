"use client";

import React, { useState } from 'react';
import { X, Link as LinkIcon, ShoppingBag, Tag, CheckCircle2, ChevronRight, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn, getStoreFromUrl } from '@/lib/utils';

export default function AddProductModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1); // 1: URL Input, 2: Confirmation/Source Management
    const [subStep, setSubStep] = useState('list'); // 'list' or 'add-store'
    const [selectedStoreToAdd, setSelectedStoreToAdd] = useState(null);
    const [newStoreUrl, setNewStoreUrl] = useState('');
    const [detectedStore, setDetectedStore] = useState(null);
    const [formData, setFormData] = useState({
        url: '',
        category: 'Smartphones',
        name: 'iPhone 15 Pro Max', // Mock for now
        image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRKj8NxFZGTq2Duw3kub7bAM6b-7zsd_1oF5GkGsknP4ex-A8Dk' // Mock for now
    });

    const [trackedStores, setTrackedStores] = useState([]);

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, url });
        const store = getStoreFromUrl(url);
        setDetectedStore(store);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (detectedStore) {
            setTrackedStores([{ ...detectedStore, url: formData.url, tracked: true }]);
        }
        setStep(2);
    };

    const handleAddStoreClick = (store) => {
        setSelectedStoreToAdd(store);
        setNewStoreUrl('');
        setSubStep('add-store');
    };

    const handleConfirmAddStore = () => {
        if (selectedStoreToAdd && newStoreUrl) {
            setTrackedStores(prev => [...prev, { ...selectedStoreToAdd, url: newStoreUrl, tracked: true }]);
            setSubStep('list');
            setSelectedStoreToAdd(null);
            setNewStoreUrl('');
        }
    };

    const handleReset = () => {
        onClose();
        setTimeout(() => {
            setStep(1);
            setSubStep('list');
            setFormData({ url: '', category: 'Smartphones', name: 'iPhone 15 Pro Max', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRKj8NxFZGTq2Duw3kub7bAM6b-7zsd_1oF5GkGsknP4ex-A8Dk' });
            setDetectedStore(null);
            setTrackedStores([]);
        }, 500);
    };

    const categories = ['Smartphones', 'Laptops', 'Audio', 'Electronics', 'Footwear', 'Home'];

    const availableStores = [
        { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
        { name: 'Flipkart', logo: 'https://images.icon-icons.com/729/PNG/512/flipkart_icon-icons.com_62718.png' },
        { name: 'Croma', logo: 'https://cdn.brandfetch.io/domain/croma.com/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed' },
        { name: 'Reliance Digital', logo: 'https://cdn.brandfetch.io/idYe1C76vX/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#060b13]/80 backdrop-blur-sm transition-opacity"
                onClick={handleReset}
            />

            {/* Modal Content */}
            <div className="relative bg-brand-card border border-brand-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleReset}
                        className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Add Product</h2>
                            <p className="text-gray-500 text-sm">Paste one store link to categorize and start tracking.</p>
                        </div>

                        <div className="space-y-4">
                            {/* Product URL */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <LinkIcon className="w-3 h-3 text-brand-cyan" /> Product URL
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="https://amazon.in/dp/B0CHX1W1XY"
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan transition-all placeholder:text-gray-700 font-medium"
                                    value={formData.url}
                                    onChange={handleUrlChange}
                                />

                                {/* Detected Store */}
                                {detectedStore && (
                                    <div className="flex items-center justify-between p-3 bg-brand-card/50 border border-brand-border rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-brand-bg px-2 py-0.5 rounded border border-brand-border">
                                                Store Detected
                                            </div>
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-5 h-5 bg-white rounded-md p-1 border border-brand-border flex items-center justify-center overflow-hidden">
                                                    <img src={detectedStore.logo} alt={detectedStore.name} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-bold text-white uppercase tracking-tight">{detectedStore.name}</span>
                                            </div>
                                        </div>
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </div>
                                )}
                            </div>

                            {/* Category selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-brand-cyan" /> Category
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

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-brand-cyan text-brand-bg font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Track Product
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 space-y-6">
                        {subStep === 'list' ? (
                            <>
                                <div className="flex flex-col items-center justify-center text-center space-y-4 pb-4 border-b border-brand-border/30">
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-white rounded-2xl p-2 border border-brand-border shadow-2xl flex items-center justify-center overflow-hidden">
                                            <img src={formData.image} alt={formData.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-4 border-brand-card">
                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{formData.name}</h2>
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Added to PriceBuddy Tracker</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ShoppingBag className="w-3 h-3" /> Tracked Stores
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {availableStores.map((store) => {
                                            const trackedStore = trackedStores.find(ts => ts.name === store.name);
                                            return (
                                                <div key={store.name} className="flex items-center justify-between p-4 bg-brand-bg border border-brand-border rounded-2xl group hover:border-brand-cyan/20 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-white rounded-lg p-1.5 border border-brand-border flex items-center justify-center overflow-hidden">
                                                            <img src={store.logo} alt={store.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-sm font-bold text-white">{store.name}</span>
                                                    </div>

                                                    {trackedStore ? (
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddStoreClick(store)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-card hover:bg-brand-cyan hover:text-brand-bg border border-brand-border hover:border-brand-cyan rounded-lg transition-all text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-brand-bg group-hover:font-black"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add Store Link
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={handleReset}
                                        className="w-full bg-brand-bg border border-brand-border text-white font-black py-4 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-2 animate-in slide-in-from-right-4 duration-300">
                                <button
                                    onClick={() => setSubStep('list')}
                                    className="text-xs font-bold text-brand-cyan mb-6 flex items-center gap-1 hover:underline"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" /> Back to Stores
                                </button>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl p-2 border border-brand-border flex items-center justify-center overflow-hidden shadow-lg">
                                            <img src={selectedStoreToAdd?.logo} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase leading-none">Add {selectedStoreToAdd?.name} Link</h3>
                                            <p className="text-gray-500 text-xs mt-1">Paste the product link from {selectedStoreToAdd?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product URL</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={`https://${selectedStoreToAdd?.name.toLowerCase().replace(' ', '')}.com/...`}
                                            className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-brand-cyan transition-all"
                                            value={newStoreUrl}
                                            onChange={(e) => setNewStoreUrl(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleConfirmAddStore}
                                        disabled={!newStoreUrl}
                                        className="w-full bg-brand-cyan text-brand-bg font-black py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-cyan/20 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Store
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
