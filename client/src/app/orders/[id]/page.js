'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { openWhatsApp } from '@/utils/whatsapp';
import { format } from 'date-fns';
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineCheck,
    HiOutlineRefresh,
    HiOutlineTrash,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const STATUS_LABELS = {
    drafted: 'Drafted',
    ordered: 'Ordered',
    partially_arrived: 'Partially Arrived',
    arrived: 'Arrived',
};

const STATUS_COLORS = {
    drafted: 'bg-surface-100 text-surface-600',
    ordered: 'bg-blue-100 text-blue-700',
    partially_arrived: 'bg-amber-100 text-amber-700',
    arrived: 'bg-emerald-100 text-emerald-700',
};

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [arrivalMode, setArrivalMode] = useState(false);
    const [arrivalItems, setArrivalItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${params.id}`);
            setOrder(res.data.data);

            // Initialize arrival items
            setArrivalItems(
                res.data.data.items.map((item) => ({
                    _id: item._id,
                    isDelivered: item.isDelivered || false,
                    buyingPrice: item.buyingPrice || '',
                }))
            );
        } catch (error) {
            toast.error('Failed to fetch order');
            router.push('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSendWhatsApp = async () => {
        try {
            setSubmitting(true);
            const res = await api.put(`/orders/${order._id}/send`);
            openWhatsApp(res.data.whatsappURL);
            setOrder(res.data.data);
            toast.success('Order sent! WhatsApp opened.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectAll = (checked) => {
        setArrivalItems((prev) =>
            prev.map((item) => ({ ...item, isDelivered: checked }))
        );
    };

    const handleItemDelivery = (index, field, value) => {
        setArrivalItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleConfirmArrival = async () => {
        const deliveredItems = arrivalItems.filter((i) => i.isDelivered);

        if (deliveredItems.length === 0) {
            toast.error('Please check at least one delivered item');
            return;
        }

        // Check if delivered items have buying price
        for (const item of deliveredItems) {
            if (!item.buyingPrice && item.buyingPrice !== 0) {
                toast.error('Please enter buying price for all delivered items');
                return;
            }
        }

        try {
            setSubmitting(true);
            const res = await api.put(`/orders/${order._id}/arrive`, {
                items: arrivalItems.map((item) => ({
                    _id: item._id,
                    isDelivered: item.isDelivered,
                    buyingPrice: item.isDelivered ? parseFloat(item.buyingPrice) : null,
                })),
            });
            setOrder(res.data.data);
            setArrivalMode(false);
            toast.success('Arrival confirmed!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReorder = async () => {
        try {
            const res = await api.post(`/orders/${order._id}/reorder`);
            toast.success('Re-order created as draft!');
            router.push(`/orders/${res.data.data._id}`);
        } catch (error) {
            toast.error('Failed to re-order');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            await api.delete(`/orders/${order._id}`);
            toast.success('Order deleted');
            router.push('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) return null;

    const allChecked = arrivalItems.every((i) => i.isDelivered);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.push('/orders')}
                        className="btn-ghost btn-sm mb-3"
                    >
                        <HiOutlineArrowLeft size={16} />
                        Back to Orders
                    </button>
                    <h1 className="page-title font-mono">{order.orderNumber}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span
                            className={`badge text-sm px-3 py-1 ${STATUS_COLORS[order.status]}`}
                        >
                            {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-sm text-surface-400">
                            Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                    {order.status === 'drafted' && (
                        <>
                            <button
                                onClick={() => router.push(`/orders/${order._id}/edit`)}
                                className="btn-secondary btn-sm"
                            >
                                <HiOutlinePencil size={16} />
                                Edit
                            </button>
                            <button
                                onClick={handleSendWhatsApp}
                                disabled={submitting}
                                className="btn-whatsapp btn-sm"
                            >
                                <FaWhatsapp size={16} />
                                Send via WhatsApp
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger btn-sm"
                            >
                                <HiOutlineTrash size={16} />
                            </button>
                        </>
                    )}

                    {(order.status === 'ordered' || order.status === 'partially_arrived') && (
                        <button
                            onClick={() => setArrivalMode(!arrivalMode)}
                            className="btn-success btn-sm"
                        >
                            <HiOutlineCheck size={16} />
                            {arrivalMode ? 'Cancel' : 'Confirm Arrival'}
                        </button>
                    )}

                    <button onClick={handleReorder} className="btn-secondary btn-sm">
                        <HiOutlineRefresh size={16} />
                        Re-order
                    </button>
                </div>
            </div>

            {/* Contact Info */}
            <div className="card mb-6">
                <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                    Contact
                </h2>
                <p className="text-lg font-semibold text-surface-800">
                    {order.contactName}
                </p>
                <p className="text-sm text-surface-500">{order.contactPhone}</p>
                {order.isSingleCompany && (
                    <p className="text-sm text-primary-600 mt-1">
                        Company: {order.singleCompanyName}
                    </p>
                )}
            </div>

            {/* Items */}
            <div className="card mb-6">
                <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">
                    Order Items ({order.items.length})
                </h2>

                {/* Select All (Arrival Mode) */}
                {arrivalMode && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl mb-4">
                        <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-5 h-5 text-success rounded border-surface-300 focus:ring-success cursor-pointer"
                        />
                        <label className="text-sm font-medium text-emerald-700 cursor-pointer">
                            Select All Items
                        </label>
                    </div>
                )}

                <div className="space-y-3">
                    {order.items.map((item, index) => (
                        <div
                            key={item._id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${arrivalMode
                                    ? arrivalItems[index]?.isDelivered
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-surface-50 border-surface-100'
                                    : item.isDelivered
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-surface-50 border-surface-100'
                                }`}
                        >
                            {/* Arrival checkbox */}
                            {arrivalMode && (
                                <input
                                    type="checkbox"
                                    checked={arrivalItems[index]?.isDelivered || false}
                                    onChange={(e) =>
                                        handleItemDelivery(index, 'isDelivered', e.target.checked)
                                    }
                                    className="mt-1 w-5 h-5 text-success rounded border-surface-300 focus:ring-success cursor-pointer"
                                />
                            )}

                            <div className="flex-1 flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm shrink-0">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-surface-800">
                                    {item.medicineName}
                                </p>
                                <p className="text-sm text-surface-500">{item.company}</p>
                                <div className="flex gap-4 mt-1 text-xs text-surface-400">
                                    {item.size && <span>Size: {item.size}</span>}
                                    <span>Qty: {item.quantity}</span>
                                    {item.isDelivered && item.buyingPrice && (
                                        <span className="text-emerald-600 font-medium">
                                            ₹{item.buyingPrice}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Buying price input (Arrival Mode) */}
                            {arrivalMode && arrivalItems[index]?.isDelivered && (
                                <div className="w-32">
                                    <label className="text-xs text-surface-500">Price ₹</label>
                                    <input
                                        type="number"
                                        className="input text-sm mt-1"
                                        value={arrivalItems[index]?.buyingPrice || ''}
                                        onChange={(e) =>
                                            handleItemDelivery(index, 'buyingPrice', e.target.value)
                                        }
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Confirm Button */}
                {arrivalMode && (
                    <button
                        onClick={handleConfirmArrival}
                        disabled={submitting}
                        className="btn-success w-full mt-4"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <HiOutlineCheck size={18} />
                                Confirm Arrival
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Timestamps */}
            <div className="card mb-6">
                <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                    Timeline
                </h2>
                <div className="space-y-2 text-sm">
                    {order.draftedAt && (
                        <div className="flex justify-between">
                            <span className="text-surface-500">Drafted</span>
                            <span className="text-surface-700">
                                {format(new Date(order.draftedAt), 'dd MMM yyyy, hh:mm a')}
                            </span>
                        </div>
                    )}
                    {order.orderedAt && (
                        <div className="flex justify-between">
                            <span className="text-surface-500">Ordered</span>
                            <span className="text-surface-700">
                                {format(new Date(order.orderedAt), 'dd MMM yyyy, hh:mm a')}
                            </span>
                        </div>
                    )}
                    {order.arrivedAt && (
                        <div className="flex justify-between">
                            <span className="text-surface-500">Arrived</span>
                            <span className="text-surface-700">
                                {format(new Date(order.arrivedAt), 'dd MMM yyyy, hh:mm a')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="card">
                    <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                        Notes
                    </h2>
                    <p className="text-sm text-surface-600">{order.notes}</p>
                </div>
            )}
        </div>
    );
}