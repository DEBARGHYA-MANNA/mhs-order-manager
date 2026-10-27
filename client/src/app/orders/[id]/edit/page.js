'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import ContactSelector from '@/components/OrderForm/ContactSelector';
import OrderItemRow from '@/components/OrderForm/OrderItemRow';
import CompanyAutoSuggest from '@/components/AutoSuggest/CompanyAutoSuggest';
import {
    HiOutlineArrowLeft,
    HiOutlineSave,
    HiOutlinePlus,
} from 'react-icons/hi';

const emptyItem = {
    medicineName: '',
    company: '',
    quantity: 1,
    size: '',
    medicineId: null,
};

export default function EditOrderPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isSingleCompany, setIsSingleCompany] = useState(false);
    const [singleCompanyName, setSingleCompanyName] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [params.id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${params.id}`);
            const order = res.data.data;

            if (order.status !== 'drafted') {
                toast.error('Only drafted orders can be edited');
                router.push(`/orders/${params.id}`);
                return;
            }

            setSelectedContact({
                _id: order.contactId?._id || order.contactId,
                name: order.contactName,
                phone: order.contactPhone,
            });
            setIsSingleCompany(order.isSingleCompany);
            setSingleCompanyName(order.singleCompanyName || '');
            setItems(
                order.items.map((item) => ({
                    medicineName: item.medicineName,
                    company: item.company,
                    quantity: item.quantity,
                    size: item.size || '',
                    medicineId: item.medicineId,
                }))
            );
            setNotes(order.notes || '');
        } catch (error) {
            toast.error('Failed to load order');
            router.push('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => setItems([...items, { ...emptyItem }]);

    const handleRemoveItem = (index) => {
        if (items.length === 1) return toast.error('At least one item required');
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, updatedItem) => {
        const newItems = [...items];
        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!selectedContact) return toast.error('Select a contact');

        for (let i = 0; i < items.length; i++) {
            if (!items[i].medicineName.trim()) return toast.error(`Item ${i + 1}: Name required`);
            if (!isSingleCompany && !items[i].company.trim()) return toast.error(`Item ${i + 1}: Company required`);
        }

        setSaving(true);
        try {
            await api.put(`/orders/${params.id}`, {
                contactId: selectedContact._id,
                items: items.map((item) => ({
                    medicineName: item.medicineName.trim(),
                    company: isSingleCompany ? singleCompanyName.trim() : item.company.trim(),
                    quantity: item.quantity,
                    size: item.size.trim(),
                })),
                isSingleCompany,
                singleCompanyName: singleCompanyName.trim(),
                notes,
            });
            toast.success('Order updated!');
            router.push(`/orders/${params.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="page-header">
                <button onClick={() => router.back()} className="btn-ghost btn-sm mb-3">
                    <HiOutlineArrowLeft size={16} /> Back
                </button>
                <h1 className="page-title">Edit Draft Order</h1>
            </div>

            <div className="space-y-6">
                <div className="card">
                    <h2 className="text-lg font-semibold text-surface-800 mb-4">Contact</h2>
                    <ContactSelector selectedContact={selectedContact} onSelect={setSelectedContact} />
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="singleCompany" checked={isSingleCompany} onChange={(e) => setIsSingleCompany(e.target.checked)} className="w-5 h-5 text-primary-600 rounded-lg border-surface-300 cursor-pointer" />
                        <label htmlFor="singleCompany" className="text-sm font-medium text-surface-700 cursor-pointer">All items from a single company</label>
                    </div>
                    {isSingleCompany && (
                        <div className="mt-4 max-w-md">
                            <label className="label">Company Name</label>
                            <CompanyAutoSuggest value={singleCompanyName} onChange={setSingleCompanyName} onSelect={setSingleCompanyName} />
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-surface-800">Order Items</h2>
                        <button onClick={handleAddItem} className="btn-secondary btn-sm">
                            <HiOutlinePlus size={16} /> Add Item
                        </button>
                    </div>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <OrderItemRow key={index} item={item} index={index} onChange={handleItemChange} onRemove={handleRemoveItem} isSingleCompany={isSingleCompany} singleCompanyName={singleCompanyName} />
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-semibold text-surface-800 mb-4">Notes</h2>
                    <textarea className="input min-h-[80px] resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
                </div>

                <div className="flex gap-3 pb-8">
                    <button onClick={() => router.back()} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                        <HiOutlineSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}