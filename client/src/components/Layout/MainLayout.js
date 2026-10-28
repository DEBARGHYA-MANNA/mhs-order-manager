'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

export default function MainLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-page-bg">
                <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-ink-400 text-sm font-semibold">Loading MHS...</p>
                </div>
            </div>
        );
    }

    if (pathname === '/login') return <>{children}</>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-page-bg">
            <Sidebar />
            <main className="lg:ml-[282px] min-h-screen">
                <div className="px-4 sm:px-6 lg:px-8 pt-5 lg:pt-6 pb-28 lg:pb-8 max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
}