'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutGrid,
    ClipboardList,
    PlusCircle,
    Users,
    PackageSearch,
    Settings,
    LogOut,
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutGrid },
    { label: 'Orders', href: '/orders', icon: ClipboardList },
    { label: 'New Order', href: '/orders/new', icon: PlusCircle },
    { label: 'Contacts', href: '/contacts', icon: Users },
    { label: 'Medicines', href: '/medicines', icon: PackageSearch },
];

const adminItems = [
    { label: 'Manage Users', href: '/admin/users', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();

    const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    const NavLink = ({ item }) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.75 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
                        ? 'bg-primary-600 text-white shadow-[0_6px_18px_rgba(109,79,224,0.28)]'
                        : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                    }`}
            >
                <Icon size={19} strokeWidth={2.2} />
                {item.label}
            </Link>
        );
    };

    return (
        <aside className="hidden lg:flex fixed top-4 left-4 bottom-4 w-[250px] flex-col bg-white rounded-[28px] shadow-[0_8px_30px_rgba(40,38,62,0.07)] border border-ink-100 z-30">
            {/* Brand */}
            <div className="px-5 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-[0_6px_16px_rgba(109,79,224,0.35)]">
                        <span className="text-lg">📦</span>
                    </div>
                    <div>
                        <h1 className="text-[15px] font-extrabold text-ink-900 leading-tight">MHS Orders</h1>
                        <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider">Order Manager</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => <NavLink key={item.href} item={item} />)}

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-1 px-4">
                            <p className="text-[10px] font-bold text-ink-300 uppercase tracking-[0.1em]">Admin</p>
                        </div>
                        {adminItems.map((item) => <NavLink key={item.href} item={item} />)}
                    </>
                )}
            </nav>

            {/* User */}
            <div className="px-3 pb-4 pt-2">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-ink-50">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink-800 truncate">{user?.name}</p>
                        <p className="text-[11px] text-ink-400 capitalize truncate">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2.5 mt-2 rounded-2xl text-sm font-semibold text-ink-400 hover:bg-danger-bg hover:text-danger transition-all duration-200 w-full"
                >
                    <LogOut size={17} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}