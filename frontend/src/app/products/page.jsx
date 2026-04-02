"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package, ExternalLink, Trash2, Eye, Plus, Search, Filter, RefreshCcw, TrendingUp, TrendingDown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import AddProductModal from "@/components/AddProductModal";
import DeleteProductModal from "@/components/DeleteProductModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;

            if (!userId) {
                setProducts([]);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/products?user_id=${userId}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const result = await res.json();

            if (result.success) {
                const mapped = result.data.map(p => {
                    const latest = p.last_price ? parseFloat(p.last_price) : null;
                    const prev = p.prev_price ? parseFloat(p.prev_price) : null;

                    let trendType = 'steady';
                    if (latest && prev) {
                        if (latest < prev) trendType = 'falling';
                        else if (latest > prev) trendType = 'rising';
                    }

                    return {
                        id: p.id,
                        name: p.name,
                        productImage: p.image_url || null,
                        category: p.category,
                        price: latest ? `$${latest.toLocaleString()}` : '—',
                        prevPrice: prev,
                        trend: trendType,
                        updated: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Syncing...',
                        stores: [{ name: p.store || 'Store', logo: p.storeLogo || null }],
                        url: p.product_url || "#"
                    };
                });
                setProducts(mapped);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleRefresh = () => fetchProducts();

    const handleDeleteClick = (e, product) => {
        e.stopPropagation();
        setProductToDelete(product);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id;
            const res = await fetch(`${API_BASE_URL}/products/${productToDelete.id}?user_id=${userId}`, {
                method: 'DELETE',
            });
            const result = await res.json();
            if (result.success) {
                setProducts(products.filter(p => p.id !== productToDelete.id));
                setProductToDelete(null);
            }
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewDetails = (id) => {
        router.push(`/product/${id}`);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    return (
        <div className="flex flex-col flex-1 bg-brand-bg min-h-screen">
            <Navbar />

            <main className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
                {/* Statistics Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-brand-card border border-brand-border p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Assets</p>
                            <p className="text-2xl font-black text-white">{products.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-brand-cyan" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-cyan transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter your collection..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-brand-card border border-brand-border rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-cyan/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                                    selectedCategory === cat
                                        ? "bg-brand-cyan text-brand-bg border-brand-cyan shadow-lg shadow-brand-cyan/20"
                                        : "bg-brand-card border-brand-border text-gray-500 hover:text-white hover:border-gray-700"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0c1829]/50 border-b border-brand-border">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Intelligence</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Market Value</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">Trend Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hidden lg:table-cell">Store Data</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Action Center</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/30">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCcw className="w-8 h-8 text-brand-cyan animate-spin" />
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 uppercase">
                                                <Package className="w-12 h-12 text-gray-700" />
                                                <span className="text-gray-500 font-bold tracking-widest">No products found in database</span>
                                                <button onClick={() => setIsModalOpen(true)} className="text-brand-cyan text-xs font-black underline underline-offset-4">Add your first product</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr
                                            key={p.id}
                                            onClick={() => handleViewDetails(p.id)}
                                            className="hover:bg-brand-cyan/[0.03] transition-all duration-200 group cursor-pointer"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl p-1.5 border border-brand-border shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                        {p.productImage ? (
                                                            <img src={p.productImage} alt="" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-gray-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-white group-hover:text-brand-cyan transition-colors truncate max-w-[200px] uppercase italic text-xs tracking-tight">{p.name}</span>
                                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.15em]">{p.category}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-base font-black text-white">{p.price}</span>
                                                    <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest tracking-tighter">Verified {p.updated}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 hidden md:table-cell">
                                                {p.trend === 'falling' ? (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                                                        <TrendingDown className="w-3 h-3 text-emerald-400" />
                                                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Optimal Drop</span>
                                                    </div>
                                                ) : p.trend === 'rising' ? (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit">
                                                        <TrendingUp className="w-3 h-3 text-rose-400" />
                                                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Market Spike</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/10 border border-gray-500/20 rounded-full w-fit">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Steady Market</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 hidden lg:table-cell">
                                                <div className="flex -space-x-2">
                                                    {p.stores.map((s, idx) => (
                                                        <div key={idx} className="w-7 h-7 bg-white rounded-lg p-1 border border-brand-border flex items-center justify-center overflow-hidden shadow-sm" title={s.name}>
                                                            <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
                                                        </div>
                                                    ))}
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
                                                        onClick={(e) => handleDeleteClick(e, p)}
                                                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors group/btn"
                                                        data-tooltip-id="p-tip"
                                                        data-tooltip-content="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-500 group-hover/btn:text-rose-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleRefresh}
            />

            <DeleteProductModal
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={confirmDelete}
                productName={productToDelete?.name}
                isDeleting={isDeleting}
            />

            <ReactTooltip id="p-tip" style={{ backgroundColor: '#0c1523', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold' }} border="1px solid #1e293b" />
        </div>
    );
}
