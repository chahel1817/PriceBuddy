"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package, ExternalLink, Trash2, Eye, Plus, Search, Filter, RefreshCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { products as mockProducts } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import AddProductModal from "@/components/AddProductModal";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const router = useRouter();

    // Simulate API Fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            setProducts(mockProducts);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to stop tracking this product?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleViewDetails = (id) => {
        router.push(`/product/${id}`);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.stores.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
            <Navbar />

            <main className="p-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Product Manager</h1>
                        <p className="text-gray-500 text-sm font-medium">Monitoring {products.length} active price streams</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                            <input
                                type="text"
                                placeholder="Filter by name or store..."
                                className="bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 w-64 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 bg-brand-card border border-brand-border rounded-xl hover:text-brand-cyan transition-colors">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-brand-bg rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20 uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5 font-black" />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#0c1523] border-b border-brand-border text-[10px] uppercase font-black tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-6 py-5">Product Info</th>
                                    <th className="px-6 py-5">Stores Tracked</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Min. Price</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                                {filteredProducts.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => handleViewDetails(p.id)}
                                        className="hover:bg-[#0f2a3c]/40 transition-all duration-200 group cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl p-1 border border-brand-border shadow-sm flex-shrink-0">
                                                    <img src={p.productImage} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-white group-hover:text-brand-cyan transition-colors truncate max-w-[200px]">{p.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.updated}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex -space-x-2">
                                                    {p.stores.map((s, idx) => (
                                                        <div key={idx} className="w-7 h-7 bg-white rounded-lg p-1 border-2 border-brand-card flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform" title={s.name}>
                                                            <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
                                                    {p.stores.length} {p.stores.length === 1 ? 'Source' : 'Sources'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black text-gray-500 uppercase px-2 py-1 bg-brand-bg border border-brand-border/50 rounded-md">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-brand-cyan font-black text-base">{p.price}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Tracked</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); window.open(p.url || '#', '_blank'); }}
                                                    className="p-2 hover:bg-brand-cyan/10 rounded-lg transition-colors group/btn"
                                                    data-tooltip-id="p-tip"
                                                    data-tooltip-content="Open in Store"
                                                >
                                                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover/btn:text-brand-cyan" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewDetails(p.id)}
                                                    className="p-2 hover:bg-brand-cyan/10 rounded-lg transition-colors group/btn"
                                                    data-tooltip-id="p-tip"
                                                    data-tooltip-content="View Analysis"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500 group-hover/btn:text-brand-cyan" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, p.id)}
                                                    className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors group/btn"
                                                    data-tooltip-id="p-tip"
                                                    data-tooltip-content="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-500 group-hover/btn:text-rose-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <ReactTooltip id="p-tip" style={{ backgroundColor: '#0c1523', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold' }} border="1px solid #1e293b" />
        </div>
    );
}
