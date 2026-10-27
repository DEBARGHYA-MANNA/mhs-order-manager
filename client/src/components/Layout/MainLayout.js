'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';

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
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-surface-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (pathname === '/login') {
        return <>{children}</>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-surface-50">
            <Sidebar />
            <main className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}