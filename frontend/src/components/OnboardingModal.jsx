"use client";

import React, { useEffect, useState } from "react";
import { Search, History, BellRing, Sparkles, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(0);
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (isOpen) setRender(true);
    }, [isOpen]);

    if (!render) return null;

    const steps = [
        {
            icon: Search,
            title: "Global Search",
            desc: "Search for any product name. We instantly scan Amazon and eBay to bring you live listings and variations."
        },
        {
            icon: History,
            title: "Automated Tracking",
            desc: "Once you add a product to your dashboard, our background engines will track its daily market shifts automatically."
        },
        {
            icon: BellRing,
            title: "Drop Notifications",
            desc: "Set an alert, and we'll send a direct email when the product price plunges. Never miss a deal."
        }
    ];

    const CurrentIcon = steps[step].icon;

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep((prev) => prev + 1);
        } else {
            onClose();
            // Optional: reset step after a delay so it's fresh if somehow reopened
            setTimeout(() => setStep(0), 300);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <div
                className={cn(
                    "absolute inset-0 bg-[#0c1523]/80 backdrop-blur-md transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            <div
                className={cn(
                    "relative w-full max-w-md bg-brand-bg border border-brand-border rounded-3xl shadow-2xl shadow-brand-cyan/10 overflow-hidden transition-all duration-500",
                    isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                )}
                onTransitionEnd={() => {
                    if (!isOpen) setRender(false);
                }}
            >
                {/* Decorative Background */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-cyan/20 to-transparent pointer-events-none" />
                <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-brand-cyan/30 blur-[60px] pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 pt-10 text-center relative z-10">
                    <div className="mx-auto w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner shadow-brand-cyan/20">
                        <CurrentIcon className="w-8 h-8 text-brand-cyan" />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-brand-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">Welcome to PriceBuddy</span>
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                        {steps[step].title}
                    </h2>

                    <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-[280px] mx-auto min-h-[60px]">
                        {steps[step].desc}
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-6">
                        {/* Progress Dots */}
                        <div className="flex items-center gap-3">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === step ? "w-8 bg-brand-cyan" : "w-1.5 bg-gray-700"
                                    )}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full relative group overflow-hidden bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl px-4 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <span className="relative z-10">{step === steps.length - 1 ? 'Start Tracking' : 'Next'}</span>
                            {step < steps.length - 1 && <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-cyan translate-y-full group-hover:translate-y-0 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
