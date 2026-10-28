'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    ShoppingBag, IndianRupee, Clock, PackageCheck, TrendingUp, Users, Pill, ArrowRight,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/format';
import StatusPill from '../components/ui/StatusPill';

const PERIODS = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'quarterly', label: 'This Quarter' },
    { value: 'yearly', label: 'This Year' },
];

const STATUS_COLORS = {
    drafted: '#a9a5c9',
    ordered: '#5aa9e6',
    partially_arrived: '#f0a868',
    arrived: '#3cb88a',
};

export default function DashboardView() {
    const router = useRouter();
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({});
    const [trend, setTrend] = useState([]);
    const [topMedicines, setTopMedicines] = useState([]);
    const [statusBreakdown, setStatusBreakdown] = useState([]);
    const [topContacts, setTopContacts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [s, t, m, st, c, r] = await Promise.all([
                api.get('/dashboard/summary', { params: { period } }),
                api.get('/dashboard/spending-trend', { params: { period } }),
                api.get('/dashboard/top-medicines', { params: { period } }),
                api.get('/dashboard/status-breakdown', { params: { period } }),
                api.get('/dashboard/orders-by-contact', { params: { period } }),
                api.get('/orders', { params: { page: 1, limit: 5 } }),
            ]);
            setSummary(s.data?.data || s.data || {});
            setTrend(t.data?.data || t.data || []);
            setTopMedicines(m.data?.data || m.data || []);
            setStatusBreakdown(st.data?.data || st.data || []);
            setTopContacts(c.data?.data || c.data || []);
            const rdata = r.data?.data || r.data || {};
            setRecentOrders(rdata.orders || rdata || []);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const stats = [
        { label: 'Total Orders', value: summary.totalOrders ?? 0, icon: ShoppingBag, bg: 'bg-primary-100', fg: 'text-primary-700' },
        { label: 'Total Spending', value: formatCurrency(summary.totalSpending ?? 0), icon: IndianRupee, bg: 'bg-mint-100', fg: 'text-mint-600' },
        { label: 'Pending Orders', value: summary.pendingOrders ?? 0, icon: Clock, bg: 'bg-peach-100', fg: 'text-peach-600' },
        { label: 'Arrived Orders', value: summary.arrivedOrders ?? 0, icon: PackageCheck, bg: 'bg-lavender-100', fg: 'text-lavender-600' },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="page-header flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Here&apos;s what&apos;s happening with your orders</p>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value)}
                            className={`chip shrink-0 ${period === p.value ? 'chip-active' : ''}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
                    {stats.map((s) => (
                        <div key={s.label} className="bento-card col-span-2 sm:col-span-1 lg:col-span-3">
                            <div className={`icon-chip ${s.bg} ${s.fg} mb-4`}>
                                <s.icon size={18} />
                            </div>
                            <p className="stat-value">{s.value}</p>
                            <p className="stat-label">{s.label}</p>
                        </div>
                    ))}

                    <div className="bento-card col-span-2 lg:col-span-8 lg:row-span-2">
                        <h2 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary-600" /> Spending Trend
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend}>
                                    <defs>
                                        <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6d4fe0" stopOpacity={0.35} />
                                            <stop offset="100%" stopColor="#6d4fe0" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eeedf7" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9290ab' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9290ab' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(v) => formatCurrency(v)}
                                        contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 8px 24px rgba(30,20,60,0.12)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#6d4fe0" strokeWidth={2.5} fill="url(#spendGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card col-span-2 lg:col-span-4">
                        <h2 className="text-sm font-bold text-ink-900 mb-4">Status Breakdown</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-28 h-28 shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusBreakdown} dataKey="count" nameKey="status" innerRadius={32} outerRadius={52} paddingAngle={3}>
                                            {statusBreakdown.map((entry, i) => (
                                                <Cell key={i} fill={STATUS_COLORS[entry.status] || '#ccc'} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {statusBreakdown.map((s) => (
                                    <div key={s.status} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-ink-600 capitalize">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] || '#ccc' }} />
                                            {s.status?.replace('_', ' ')}
                                        </span>
                                        <span className="font-bold text-ink-900">{s.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bento-card col-span-2 lg:col-span-4">
                        <h2 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-2">
                            <Pill size={16} className="text-primary-600" /> Top Medicines
                        </h2>
                        <div className="space-y-3">
                            {topMedicines.length === 0 && <p className="text-sm text-ink-400">No data yet</p>}
                            {topMedicines.slice(0, 5).map((med, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-ink-800 truncate">{med.name || med._id}</p>
                                        <p className="text-xs text-ink-400">{med.company}</p>
                                    </div>
                                    <span className="font-bold text-primary-700 shrink-0">{med.totalQuantity ?? med.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bento-card col-span-2 lg:col-span-4">
                        <h2 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-2">
                            <Users size={16} className="text-primary-600" /> Top Contacts
                        </h2>
                        <div className="space-y-3">
                            {topContacts.length === 0 && <p className="text-sm text-ink-400">No data yet</p>}
                            {topContacts.slice(0, 5).map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <p className="font-semibold text-ink-800 truncate">{c.contactName || c._id}</p>
                                    <span className="font-bold text-ink-900 shrink-0">{formatCurrency(c.totalSpending || 0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bento-card col-span-2 lg:col-span-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-ink-900">Recent Orders</h2>
                            <button onClick={() => router.push('/orders')} className="text-xs font-semibold text-primary-600 flex items-center gap-1">
                                View all <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentOrders.length === 0 && <p className="text-sm text-ink-400">No orders yet</p>}
                            {recentOrders.slice(0, 5).map((o) => (
                                <div key={o._id} className="flex items-center justify-between text-sm cursor-pointer" onClick={() => router.push(`/orders/${o._id}`)}>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-ink-800 truncate">{o.orderNumber}</p>
                                        <p className="text-xs text-ink-400">{formatDate(o.createdAt)}</p>
                                    </div>
                                    <StatusPill status={o.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}