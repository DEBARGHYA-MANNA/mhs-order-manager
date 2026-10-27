'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
    HiOutlinePlus,
    HiOutlineEye,
    HiOutlineFilter,
    HiOutlineRefresh,
} from 'react-icons/hi';

const STATUS_COLORS = {
    drafted: 'badge-drafted',
    ordered: 'badge-ordered',
    partially_arrived: 'badge-partially_arrived',
    arrived: 'badge-arrived',
};

const STATUS_LABELS = {
    drafted: 'Drafted',
    ordered: 'Ordered',
    partially_arrived: 'Partially Arrived',
    arrived: 'Arrived',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page, filters]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', '15');
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const res = await api.get(`/orders?${params.toString()}`);
            setOrders(res.data.data || []);
            setTotalPages(res.data.pages || 1);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ status: '', startDate: '', endDate: '' });
        setPage(1);
    };

    return (
        <div>
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Orders</h1>
                    <p className="page-subtitle">Manage all your orders</p>
                </div>
                <Link href="/orders/new" className="btn-primary">
                    <HiOutlinePlus size={18} />
                    New Order
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <HiOutlineFilter size={18} className="text-surface-500" />
                    <span className="text-sm font-medium text-surface-600">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <select
                        className="input"
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                    >
                        <option value="">All Status</option>
                        <option value="drafted">Drafted</option>
                        <option value="ordered">Ordered</option>
                        <option value="partially_arrived">Partially Arrived</option>
                        <option value="arrived">Arrived</option>
                    </select>
                    <input
                        type="date"
                        className="input"
                        value={filters.startDate}
                        onChange={(e) =>
                            setFilters({ ...filters, startDate: e.target.value })
                        }
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        className="input"
                        value={filters.endDate}
                        onChange={(e) =>
                            setFilters({ ...filters, endDate: e.target.value })
                        }
                        placeholder="End Date"
                    />
                    <button onClick={clearFilters} className="btn-ghost">
                        <HiOutlineRefresh size={16} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="table-container">
                {loading ? (
                    <div className="p-8 text-center text-surface-400">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                        <p className="mt-3 text-sm">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center text-surface-400">
                        <p className="text-lg">No orders found</p>
                        <Link href="/orders/new" className="btn-primary mt-4 inline-flex">
                            Create your first order
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-100">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Order #
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {orders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-surface-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-surface-800">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-surface-800">
                                                {order.contactName}
                                            </p>
                                            <p className="text-xs text-surface-400">
                                                {order.contactPhone}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-surface-600">
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={STATUS_COLORS[order.status]}>
                                                {STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-surface-500">
                                            {format(new Date(order.createdAt), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/orders/${order._id}`}
                                                className="btn-ghost btn-sm"
                                            >
                                                <HiOutlineEye size={16} />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn-ghost btn-sm"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-surface-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn-ghost btn-sm"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}