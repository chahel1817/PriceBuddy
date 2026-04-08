"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";

export default function ClientWrapper({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAuthPage = ['/login', '/register'].includes(pathname);
    const isLandingPage = pathname === '/';
    const isPublicPage = isAuthPage || isLandingPage;

    useEffect(() => {
        const user = localStorage.getItem('user');
        const loggedIn = !!user;
        setIsAuthenticated(loggedIn);

        if (loggedIn && (isLandingPage || isAuthPage)) {
            router.replace('/dashboard');
            return;
        }

        if (!loggedIn && !isPublicPage) {
            router.replace('/login');
            return;
        }

        setLoading(false);
    }, [pathname, router, isPublicPage, isLandingPage]);


    if (loading) return null; // Or a loader

    return (
        <div className="flex bg-brand-bg min-h-screen">
            {!isPublicPage && <Sidebar />}
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
