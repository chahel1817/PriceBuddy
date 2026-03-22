"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, BadgeCheck, Globe, Shield, Rocket } from "lucide-react";

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="h-screen w-full bg-[#060b13] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-brand-cyan selection:text-brand-bg">

      {/* Minimalist Background Grid */}
      <div className="absolute inset-0 bg-grid-white opacity-[0.05] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-cyan/5 blur-[180px] rounded-full -z-10 animate-pulse" />

      {/* Top Central Badge */}
      <div
        className="mb-8 flex flex-col items-center gap-3 animate-fade-slide-down"
        style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
      >
        <div className="flex items-center gap-3 px-4 py-1.5 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full">
          <Zap className="w-3 h-3 text-brand-cyan animate-pulse" />
          <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">Real-Time Data Engine</span>
        </div>
      </div>

      {/* Central Punchline - Sized for 100% Resolution */}
      <div className="max-w-7xl text-center space-y-4 mb-16 z-10 px-4">
        {/* TRACK PRICES. */}
        <h1
          className="text-6xl md:text-[100px] font-black text-white tracking-tighter uppercase leading-[0.8] animate-fade-slide-down"
          style={{ animationDelay: '600ms', opacity: 0, animationFillMode: 'forwards' }}
        >
          Track Prices.
        </h1>

        {/* BUY AT THE */}
        <div className="flex flex-col gap-2">
          <h2
            className="text-5xl md:text-[80px] font-black tracking-tighter uppercase leading-[0.8] animate-fade-slide-up text-brand-cyan drop-shadow-[0_0_30px_rgba(0,229,255,0.3)]"
            style={{ animationDelay: '900ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            BUY AT THE
          </h2>

          {/* RIGHT TIME. */}
          <h2
            className="text-[40px] md:text-[90px] font-black tracking-tighter uppercase leading-[0.8] animate-fade-slide-up text-white"
            style={{ animationDelay: '1200ms', opacity: 0, animationFillMode: 'forwards' }}
          >
            RIGHT TIME.
          </h2>
        </div>
      </div>

      {/* Icon Row instead of Intelligence 2.0 */}
      <div
        className="flex items-center gap-8 mb-16 animate-fade-slide-up"
        style={{ animationDelay: '1500ms', opacity: 0, animationFillMode: 'forwards' }}
      >
        {[TrendingUp, BadgeCheck, Globe, Shield].map((Icon, idx) => (
          <div key={idx} className="group relative">
            <div className="absolute -inset-2 bg-brand-cyan/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon className="w-7 h-7 text-gray-400 hover:text-brand-cyan transition-colors" />
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div
        className="flex flex-col items-center z-10 animate-fade-slide-up"
        style={{ animationDelay: '1800ms', opacity: 0, animationFillMode: 'forwards' }}
      >
        <Link
          href="/login"
          className="group relative inline-flex items-center gap-6 px-16 py-6 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all text-sm md:text-base uppercase tracking-[0.2em] shadow-[0_30px_70px_rgba(255,255,255,0.15)] overflow-hidden"
        >
          <span className="relative z-10">Get Started Now</span>
          <Rocket className="w-6 h-6 z-10 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300 text-brand-cyan" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-cyan translate-y-full group-hover:translate-y-0 transition-transform" />
        </Link>
      </div>

      {/* Inline CSS - Optimization */}
      <style dangerouslySetInnerHTML={{
        __html: `
                @keyframes fadeSlideUp {
                    0% { opacity: 0; transform: translateY(50px) rotateX(5deg); }
                    100% { opacity: 1; transform: translateY(0) rotateX(0deg); }
                }
                @keyframes fadeSlideDown {
                    0% { opacity: 0; transform: translateY(-50px) rotateX(-5deg); }
                    100% { opacity: 1; transform: translateY(0) rotateX(0deg); }
                }
                .animate-fade-slide-up { animation: fadeSlideUp 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
                .animate-fade-slide-down { animation: fadeSlideDown 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
            `}} />
    </div>
  );
}
