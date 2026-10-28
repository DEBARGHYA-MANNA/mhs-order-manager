'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Save, Send, ArrowLeft, Building2, FileText, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { openWhatsApp } from '../../utils/whatsapp';
import ContactSelector from './ContactSelector';
import OrderItemRow from './OrderItemRow';
import CompanyAutoSuggest from '../AutoSuggest/CompanyAutoSuggest';

function newItem() {
    return { key: Math.random().toString(36).slice(2), medicineId: null, medicineName: '', company: '', quantity: 1, size: '' };
}

export default function OrderForm({ mode, orderId }) {
    const router = useRouter();
    const isEdit = mode === 'edit';

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [contact, setContact] = useState(null);
    const [isSingleCompany, setIsSingleCompany] = useState(false);
    const [singleCompanyName, setSingleCompanyName] = useState('');
    const [items, setItems] = useState([newItem()]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isEdit && orderId) loadOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    async function loadOrder() {
        setLoading(true);
        try {
            const res = await api.get(`/orders/${orderId}`);
            const order = res.data?.data || res.data;
            if (order.status !== 'drafted') {
                toast.error('Only drafted orders can be edited');
                router.replace(`/orders/${orderId}`);
                return;
            }
            setContact({ _id: order.contactId, name: order.contactName, phone: order.contactPhone });
            setIsSingleCompany(!!order.isSingleCompany);
            setSingleCompanyName(order.singleCompanyName || '');
            setItems(
                (order.items || []).map((it) => ({
                    key: it._id || Math.random().toString(36).slice(2),
                    medicineId: it.medicineId || null,
                    medicineName: it.medicineName || '',
                    company: it.company || '',
                    quantity: it.quantity || 1,
                    size: it.size || '',
                })).length
                    ? order.items.map((it) => ({
                        key: it._id || Math.random().toString(36).slice(2),
                        medicineId: it.medicineId || null,
                        medicineName: it.medicineName || '',
                        company: it.company || '',
                        quantity: it.quantity || 1,
                        size: it.size || '',
                    }))
                    : [newItem()]
            );
            setNotes(order.notes || '');
        } catch (err) {
            toast.error('Failed to load order');
            router.replace('/orders');
        } finally {
            setLoading(false);
        }
    }

    function handleAddItem() {
        setItems((prev) => [...prev, newItem()]);
    }
    function handleUpdateItem(index, updates) {
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...updates } : it)));
    }
    function handleRemoveItem(index) {
        setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    }
    function handleSingleCompanyToggle(checked) {
        setIsSingleCompany(checked);
        if (checked && singleCompanyName) {
            setItems((prev) => prev.map((it) => ({ ...it, company: singleCompanyName })));
        }
    }
    function handleSingleCompanyNameChange(name) {
        setSingleCompanyName(name);
        if (isSingleCompany) setItems((prev) => prev.map((it) => ({ ...it, company: name })));
    }

    function validate() {
        if (!contact) { toast.error('Please select a contact'); return false; }
        const validItems = items.filter((it) => it.medicineName?.trim());
        if (validItems.length === 0) { toast.error('Please add at least one item with a medicine name'); return false; }
        return true;
    }

    function buildPayload() {
        return {
            contactId: contact._id,
            isSingleCompany,
            singleCompanyName: isSingleCompany ? singleCompanyName : '',
            items: items
                .filter((it) => it.medicineName?.trim())
                .map((it) => ({
                    medicineName: it.medicineName.trim(),
                    company: (isSingleCompany ? singleCompanyName : it.company || '').trim(),
                    quantity: Number(it.quantity) || 1,
                    size: it.size || '',
                })),
            notes,
        };
    }

    async function handleSaveDraft() {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = buildPayload();
            if (isEdit) {
                await api.put(`/orders/${orderId}`, payload);
                toast.success('Draft updated');
                router.push(`/orders/${orderId}`);
            } else {
                const res = await api.post('/orders', payload);
                const order = res.data?.data || res.data;
                toast.success('Draft saved');
                router.push(`/orders/${order._id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save order');
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveAndSend() {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = buildPayload();
            let id = orderId;
            if (isEdit) {
                await api.put(`/orders/${orderId}`, payload);
            } else {
                const res = await api.post('/orders', payload);
                const order = res.data?.data || res.data;
                id = order._id;
            }
            const sendRes = await api.post(`/orders/${id}/send`);
            const { whatsappURL } = sendRes.data?.data || sendRes.data || {};
            toast.success('Order sent');
            if (whatsappURL) openWhatsApp(whatsappURL);
            router.push(`/orders/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send order');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="page-header flex items-center gap-3">
                <button onClick={() => router.back()} className="btn-icon btn-ghost">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="page-title">{isEdit ? 'Edit Order' : 'New Order'}</h1>
                    <p className="page-subtitle">{isEdit ? 'Update your draft order details' : 'Create a draft order to send via WhatsApp'}</p>
                </div>
            </div>

            <div className="bento-card mb-5">
                <h2 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-2">
                    <Building2 size={16} className="text-primary-600" /> Contact / Supplier
                </h2>
                <ContactSelector selectedContact={contact} onSelectContact={setContact} />
            </div>

            <div className="bento-card mb-5">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                        type="checkbox"
                        className="checkbox-modern"
                        checked={isSingleCompany}
                        onChange={(e) => handleSingleCompanyToggle(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-ink-800">Single company order (auto-fill all items with one company)</span>
                </label>
                {isSingleCompany && (
                    <CompanyAutoSuggest value={singleCompanyName} onChange={handleSingleCompanyNameChange} placeholder="Representative / company name" />
                )}
            </div>

            <div className="bento-card mb-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-ink-900">Order Items</h2>
                    <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
                        <Plus size={15} /> Add Item
                    </button>
                </div>
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <OrderItemRow
                            key={item.key}
                            item={item}
                            index={index}
                            isSingleCompany={isSingleCompany}
                            singleCompanyName={singleCompanyName}
                            onUpdate={(updates) => handleUpdateItem(index, updates)}
                            onRemove={() => handleRemoveItem(index)}
                            canRemove={items.length > 1}
                        />
                    ))}
                </div>
            </div>

            <div className="bento-card mb-6">
                <h2 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-primary-600" /> Notes (optional)
                </h2>
                <textarea
                    className="input min-h-[90px] resize-none"
                    placeholder="Any additional instructions for this order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" disabled={saving} onClick={handleSaveDraft} className="btn btn-secondary flex-1 justify-center">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save as Draft
                </button>
                <button type="button" disabled={saving} onClick={handleSaveAndSend} className="btn btn-whatsapp flex-1 justify-center">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Save &amp; Send via WhatsApp
                </button>
            </div>
        </div>
    );
}