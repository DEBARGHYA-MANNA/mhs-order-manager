'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Search, Plus, ChevronLeft, ChevronRight, Package, Phone, Calendar, IndianRupee } from 'lucide-react';
import api from '../../utils/api';
import StatusPill from '../../components/ui/StatusPill';
import { STATUS_FILTERS } from '../../utils/orderStatus';
import { formatCurrency, formatDate } from '../../utils/format';

export default function OrdersView() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 12;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (status !== 'all') params.status = status;
            const res = await api.get('/orders', { params });
            const data = res.data?.data || res.data;
            const list = data.orders || data || [];
            setOrders(list);
            setTotalPages(data.totalPages || data.pages || 1);
            setTotal(data.total || list.length);
        } catch (err) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { setPage(1); }, [status]);

    const filteredOrders = search.trim()
        ? orders.filter(
            (o) =>
                o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
                o.contactName?.toLowerCase().includes(search.toLowerCase())
        )
        : orders;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="page-header flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">{total} total orders</p>
                </div>
                <button onClick={() => router.push('/orders/new')} className="btn btn-primary">
                    <Plus size={16} /> New Order
                </button>
            </div>

            <div className="relative mb-4">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                    className="input pl-11"
                    placeholder="Search by order number or contact..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setStatus(f.value)}
                        className={`chip shrink-0 ${status === f.value ? 'chip-active' : ''}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
            ) : filteredOrders.length === 0 ? (
                <div className="empty-state">
                    <Package className="empty-state-icon" />
                    <p className="font-semibold text-ink-700">No orders found</p>
                    <p className="text-sm text-ink-400 mt-1">Try adjusting your filters or create a new order.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 lg:hidden">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="order-card-mobile" onClick={() => router.push(`/orders/${order._id}`)}>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-bold text-ink-900">{order.orderNumber}</p>
                                        <p className="text-sm text-ink-500">{order.contactName}</p>
                                    </div>
                                    <StatusPill status={order.status} />
                                </div>
                                <div className="flex items-center justify-between text-sm text-ink-500 mt-3 pt-3 border-t border-ink-100">
                                    <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(order.createdAt)}</span>
                                    <span className="flex items-center gap-1"><Package size={13} /> {order.items?.length || 0} items</span>
                                    <span className="font-bold text-ink-800 flex items-center gap-0.5">
                                        <IndianRupee size={13} /> {formatCurrency(order.grandTotal || 0).replace('₹', '')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block table-container">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-ink-400 uppercase text-xs tracking-wide border-b border-ink-100">
                                    <th className="py-3 px-4">Order #</th>
                                    <th className="py-3 px-4">Contact</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Items</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/orders/${order._id}`)}
                                    >
                                        <td className="py-3 px-4 font-bold text-ink-900">{order.orderNumber}</td>
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-ink-800">{order.contactName}</p>
                                            <p className="text-xs text-ink-400 flex items-center gap-1"><Phone size={11} /> {order.contactPhone}</p>
                                        </td>
                                        <td className="py-3 px-4 text-ink-500">{formatDate(order.createdAt)}</td>
                                        <td className="py-3 px-4 text-ink-500">{order.items?.length || 0}</td>
                                        <td className="py-3 px-4"><StatusPill status={order.status} /></td>
                                        <td className="py-3 px-4 text-right font-bold text-ink-800">{formatCurrency(order.grandTotal || 0)}</td>
                                        <td className="py-3 px-4 text-right"><ChevronRight size={16} className="text-ink-300" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-icon btn-ghost disabled:opacity-30">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-semibold text-ink-600">Page {page} of {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-icon btn-ghost disabled:opacity-30">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}