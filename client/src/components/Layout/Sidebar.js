'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineClipboardList,
    HiOutlinePlusCircle,
    HiOutlineUserGroup,
    HiOutlineCube,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineMenu,
    HiOutlineX,
} from 'react-icons/hi';

const navItems = [
    { label: 'Dashboard', href: '/', icon: HiOutlineHome },
    { label: 'Orders', href: '/orders', icon: HiOutlineClipboardList },
    { label: 'New Order', href: '/orders/new', icon: HiOutlinePlusCircle },
    { label: 'Contacts', href: '/contacts', icon: HiOutlineUserGroup },
    { label: 'Medicines', href: '/medicines', icon: HiOutlineCube },
];

const adminItems = [
    { label: 'Manage Users', href: '/admin/users', icon: HiOutlineCog },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();

    const isActive = (href) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden btn-ghost p-2 rounded-xl bg-white shadow-card"
            >
                {isOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-100 z-40
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo / Brand */}
                    <div className="px-6 py-6 border-b border-surface-100">
                        <h1 className="text-xl font-bold text-primary-600">
                            📦 MHS Orders
                        </h1>
                        <p className="text-xs text-surface-400 mt-1">Order Management System</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                                            : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
                                        }
                  `}
                                >
                                    <Icon size={20} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <>
                                <div className="pt-4 pb-2 px-4">
                                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                                        Admin
                                    </p>
                                </div>
                                {adminItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive(item.href)
                                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-800'
                                                }
                      `}
                                        >
                                            <Icon size={20} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </>
                        )}
                    </nav>

                    {/* User section */}
                    <div className="px-3 py-4 border-t border-surface-100">
                        <div className="px-4 py-3 rounded-xl bg-surface-50">
                            <p className="text-sm font-semibold text-surface-800">
                                {user?.name}
                            </p>
                            <p className="text-xs text-surface-400 capitalize">
                                {user?.role} • {user?.shopName}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-all duration-200 w-full"
                        >
                            <HiOutlineLogout size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}