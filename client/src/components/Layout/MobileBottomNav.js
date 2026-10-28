'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, ClipboardList, Plus, Users, PackageSearch } from 'lucide-react';

const items = [
    { label: 'Home', href: '/', icon: LayoutGrid },
    { label: 'Orders', href: '/orders', icon: ClipboardList },
    { label: 'fab', href: '/orders/new', icon: Plus },
    { label: 'Contacts', href: '/contacts', icon: Users },
    { label: 'Meds', href: '/medicines', icon: PackageSearch },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <div className="mobile-nav-wrap lg:hidden">
            <div className="mobile-nav">
                {items.map((item) => {
                    if (item.label === 'fab') {
                        return (
                            <button
                                key="fab"
                                onClick={() => router.push(item.href)}
                                className="mobile-nav-fab"
                                aria-label="New Order"
                            >
                                <item.icon size={24} strokeWidth={2.5} />
                            </button>
                        );
                    }
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mobile-nav-item ${active ? 'mobile-nav-item-active' : ''}`}
                        >
                            <Icon size={19} strokeWidth={2.2} />
                            <span className="text-[10px] font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}