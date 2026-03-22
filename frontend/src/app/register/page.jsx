"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(""); // Clear error on change
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }

        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

        if (formData.password.length < 6) {
            setError("Password must be 6+ characters.");
            return false;
        }
        if (!hasUpperCase) {
            setError("Add at least one capital letter.");
            return false;
        }
        if (!hasSpecialChar) {
            setError("Add at least one special character.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                // Save basic session (you'd normally use JWT/Cookies)
                localStorage.setItem('user', JSON.stringify(data.user));
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (err) {
            setError("Could not connect to server. Check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-cyan/5 blur-[150px] rounded-full -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full -z-10 -translate-x-1/3 translate-y-1/3" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Logo / Branding */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-card border border-brand-border rounded-2xl mb-4 group hover:border-brand-cyan/30 transition-all duration-500 shadow-2xl">
                        <img src="/logo.png" alt="PriceBuddy" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                        Create <span className="text-brand-cyan">Account</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">Join PriceBuddy and start saving money real-time.</p>
                </div>

                {/* Form Card */}
                <div className="bg-brand-card/40 backdrop-blur-xl border border-brand-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    {/* Animated accent line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-cyan/0 via-brand-cyan to-brand-cyan/0 opacity-30 group-hover:opacity-100 transition-opacity duration-700" />

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                            <div className="relative group/field font-medium">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/field:text-brand-cyan transition-colors" />
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <div className="relative group/field font-medium">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/field:text-brand-cyan transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Password</label>
                            <div className="relative group/field font-medium">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/field:text-brand-cyan transition-colors" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                            <div className="relative group/field font-medium">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/field:text-brand-cyan transition-colors" />
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-brand-bg/50 border border-brand-border rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-4 focus:ring-brand-cyan/5 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Registration Successful! Redirecting...</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-4 bg-brand-cyan text-brand-bg font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-cyan/20 flex items-center justify-center gap-2 mt-4",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm font-medium">
                    Already have an account?{" "}
                    <Link href="/login" className="text-brand-cyan hover:underline font-bold transition-all">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
