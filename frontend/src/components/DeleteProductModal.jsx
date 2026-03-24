import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DeleteProductModal({ isOpen, onClose, onConfirm, productName, isDeleting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0c1523]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-brand-border relative overflow-hidden">
                    <div className="absolute inset-0 bg-rose-500/5" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest">Remove Product</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors relative z-10 disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-400 text-sm mb-4">
                        Are you sure you want to stop tracking this product?
                    </p>
                    <div className="bg-[#0c1829]/50 border border-brand-border rounded-xl p-4 mb-2">
                        <p className="font-bold text-white text-xs uppercase tracking-tight italic truncate">
                            {productName}
                        </p>
                    </div>
                    <p className="text-rose-500/80 text-[10px] font-bold uppercase tracking-widest mt-4">
                        This action cannot be undone and will stop all associated price tracking.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-brand-border bg-black/20 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Removing...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                <span>Remove</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
