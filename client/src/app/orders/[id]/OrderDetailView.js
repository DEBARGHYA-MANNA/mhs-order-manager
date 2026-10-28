'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Send, Edit2, Trash2, Copy, Phone, Calendar, FileText,
    Package, CheckCircle2, Circle, Loader2, IndianRupee, ClipboardCheck, AlertTriangle,
} from 'lucide-react';
import api from '../../../utils/api';
import { openWhatsApp } from '../../../utils/whatsapp';
import { useAuth } from '../../../context/AuthContext';
import StatusPill from '../../../components/ui/StatusPill';
import ResponsiveModal from '../../../components/ui/ResponsiveModal';
import { formatCurrency, formatDateTime } from '../../../utils/format';

export default function OrderDetailView() {
    const { id } = useParams();
    const router = useRouter();
    const { isAdmin } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [arrivalMode, setArrivalMode] = useState(false);
    const [arrivalItems, setArrivalItems] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (id) loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function loadOrder() {
        setLoading(true);
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data?.data || res.data);
        } catch (err) {
            toast.error('Failed to load order');
            router.replace('/orders');
        } finally {
            setLoading(false);
        }
    }

    function startArrivalMode() {
        setArrivalItems(
            (order.items || []).map((it) => ({
                _id: it._id,
                medicineName: it.medicineName,
                company: it.company,
                quantity: it.quantity,
                size: it.size,
                isDelivered: it.isDelivered !== undefined ? it.isDelivered : true,
                buyingPrice: it.buyingPrice != null ? String(it.buyingPrice) : '',
            }))
        );
        setArrivalMode(true);
    }

    const allChecked = useMemo(
        () => arrivalItems.length > 0 && arrivalItems.every((it) => it.isDelivered),
        [arrivalItems]
    );

    function toggleAll(checked) {
        setArrivalItems((prev) => prev.map((it) => ({ ...it, isDelivered: checked })));
    }
    function toggleItem(index, checked) {
        setArrivalItems((prev) => prev.map((it, i) => (i === index ? { ...it, isDelivered: checked } : it)));
    }
    function updatePrice(index, value) {
        setArrivalItems((prev) => prev.map((it, i) => (i === index ? { ...it, buyingPrice: value } : it)));
    }

    async function handleSend() {
        setActionLoading(true);
        try {
            const res = await api.post(`/orders/${id}/send`);
            const { whatsappURL } = res.data?.data || res.data || {};
            toast.success('Order marked as sent');
            if (whatsappURL) openWhatsApp(whatsappURL);
            loadOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send order');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleConfirmArrival() {
        setActionLoading(true);
        try {
            const payload = {
                items: arrivalItems.map((it) => ({
                    _id: it._id,
                    isDelivered: it.isDelivered,
                    buyingPrice: it.isDelivered ? Number(it.buyingPrice) || 0 : 0,
                })),
            };
            await api.put(`/orders/${id}/confirm-arrival`, payload);
            toast.success('Arrival status updated');
            setArrivalMode(false);
            loadOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update arrival status');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReorder() {
        setActionLoading(true);
        try {
            const res = await api.post(`/orders/${id}/reorder`);
            const newOrder = res.data?.data || res.data;
            toast.success('New draft created from this order');
            router.push(`/orders/${newOrder._id}/edit`);
        } catch (err) {
            toast.error('Failed to reorder');
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDelete() {
        setActionLoading(true);
        try {
            await api.delete(`/orders/${id}`);
            toast.success('Order deleted');
            router.push('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete order');
        } finally {
            setActionLoading(false);
            setDeleteOpen(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }
    if (!order) return null;

    const canEdit = order.status === 'drafted';
    const canSend = order.status === 'drafted';
    const canConfirmArrival = order.status === 'ordered' || order.status === 'partially_arrived';
    const canDelete = order.status === 'drafted' || isAdmin;
    const deliveredCount = (order.items || []).filter((it) => it.isDelivered).length;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="page-header flex items-center gap-3">
                <button onClick={() => router.push('/orders')} className="btn-icon btn-ghost">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="page-title">{order.orderNumber}</h1>
                        <StatusPill status={order.status} />
                    </div>
                    <p className="page-subtitle">Created {formatDateTime(order.createdAt)}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
                {canEdit && (
                    <button onClick={() => router.push(`/orders/${id}/edit`)} className="btn btn-secondary btn-sm">
                        <Edit2 size={15} /> Edit
                    </button>
                )}
                {canSend && (
                    <button onClick={handleSend} disabled={actionLoading} className="btn btn-whatsapp btn-sm">
                        <Send size={15} /> Send via WhatsApp
                    </button>
                )}
                {canConfirmArrival && !arrivalMode && (
                    <button onClick={startArrivalMode} className="btn btn-primary btn-sm">
                        <ClipboardCheck size={15} /> Confirm Arrival
                    </button>
                )}
                <button onClick={handleReorder} disabled={actionLoading} className="btn btn-secondary btn-sm">
                    <Copy size={15} /> Reorder
                </button>
                {canDelete && (
                    <button onClick={() => setDeleteOpen(true)} className="btn btn-danger btn-sm">
                        <Trash2 size={15} /> Delete
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bento-card">
                    <p className="label mb-1">Contact</p>
                    <p className="font-bold text-ink-900">{order.contactName}</p>
                    <p className="text-sm text-ink-500 flex items-center gap-1 mt-1"><Phone size={13} /> {order.contactPhone}</p>
                </div>
                <div className="bento-card">
                    <p className="label mb-1">Items</p>
                    <p className="font-bold text-ink-900">{order.items?.length || 0} products</p>
                    {(order.status === 'partially_arrived' || order.status === 'arrived') && (
                        <p className="text-sm text-ink-500 mt-1">{deliveredCount} delivered</p>
                    )}
                </div>
                <div className="bento-card">
                    <p className="label mb-1">Total Amount</p>
                    <p className="font-bold text-ink-900 flex items-center gap-1">
                        <IndianRupee size={15} /> {formatCurrency(order.grandTotal || 0).replace('₹', '')}
                    </p>
                </div>
            </div>

            {order.isSingleCompany && order.singleCompanyName && (
                <div className="bento-card mb-5 bg-lavender-100/60 border-0">
                    <p className="text-sm font-semibold text-ink-700">
                        Single company order: <span className="text-primary-700">{order.singleCompanyName}</span>
                    </p>
                </div>
            )}

            <div className="bento-card mb-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Package size={16} className="text-primary-600" /> Order Items
                    </h2>
                    {arrivalMode && (
                        <label className="flex items-center gap-2 text-sm font-semibold text-ink-700 cursor-pointer">
                            <input type="checkbox" className="checkbox-modern" checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />
                            Select all
                        </label>
                    )}
                </div>

                <div className="space-y-2">
                    {(arrivalMode ? arrivalItems : order.items || []).map((item, index) => (
                        <div key={item._id || index} className="flex items-center gap-3 p-3 rounded-[16px] bg-ink-50/60 hover:bg-ink-50 transition-colors">
                            {arrivalMode ? (
                                <input
                                    type="checkbox"
                                    className="checkbox-modern shrink-0"
                                    checked={item.isDelivered}
                                    onChange={(e) => toggleItem(index, e.target.checked)}
                                />
                            ) : order.status !== 'drafted' && order.status !== 'ordered' ? (
                                item.isDelivered ? <CheckCircle2 size={18} className="text-success shrink-0" /> : <Circle size={18} className="text-ink-300 shrink-0" />
                            ) : (
                                <div className="w-[18px] h-[18px] shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700">
                                    {index + 1}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-ink-900 text-sm truncate">{item.medicineName}</p>
                                <p className="text-xs text-ink-500">
                                    {item.company || 'No company'} {item.size ? `• ${item.size}` : ''} • Qty {item.quantity}
                                </p>
                            </div>

                            {arrivalMode ? (
                                <div className="w-28 shrink-0">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Price"
                                        className="input !py-2 !text-sm"
                                        disabled={!item.isDelivered}
                                        value={item.buyingPrice}
                                        onChange={(e) => updatePrice(index, e.target.value)}
                                    />
                                </div>
                            ) : (
                                item.buyingPrice != null && <p className="text-sm font-bold text-ink-800 shrink-0">{formatCurrency(item.buyingPrice)}</p>
                            )}
                        </div>
                    ))}
                </div>

                {arrivalMode && (
                    <div className="flex gap-3 mt-5">
                        <button onClick={() => setArrivalMode(false)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                        <button onClick={handleConfirmArrival} disabled={actionLoading} className="btn btn-primary flex-1 justify-center">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}
                            Save Arrival Status
                        </button>
                    </div>
                )}
            </div>

            {order.notes && (
                <div className="bento-card mb-5">
                    <h2 className="text-sm font-bold text-ink-900 mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-primary-600" /> Notes
                    </h2>
                    <p className="text-sm text-ink-600 whitespace-pre-wrap">{order.notes}</p>
                </div>
            )}

            <div className="bento-card">
                <h2 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-primary-600" /> Timeline
                </h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-ink-500">Drafted</span>
                        <span className="font-semibold text-ink-800">{formatDateTime(order.draftedAt || order.createdAt)}</span>
                    </div>
                    {order.orderedAt && (
                        <div className="flex justify-between">
                            <span className="text-ink-500">Ordered</span>
                            <span className="font-semibold text-ink-800">{formatDateTime(order.orderedAt)}</span>
                        </div>
                    )}
                    {order.arrivedAt && (
                        <div className="flex justify-between">
                            <span className="text-ink-500">Arrived</span>
                            <span className="font-semibold text-ink-800">{formatDateTime(order.arrivedAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveModal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Order">
                <div className="p-1">
                    <div className="flex items-center gap-3 mb-4 text-danger">
                        <AlertTriangle size={22} />
                        <p className="text-sm text-ink-700">
                            Are you sure you want to delete <strong>{order.orderNumber}</strong>? This cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteOpen(false)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                        <button onClick={handleDelete} disabled={actionLoading} className="btn btn-danger flex-1 justify-center">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}