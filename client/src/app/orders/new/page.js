'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/utils/api';
import { openWhatsApp } from '@/utils/whatsapp';
import ContactSelector from '@/components/OrderForm/ContactSelector';
import OrderItemRow from '@/components/OrderForm/OrderItemRow';
import CompanyAutoSuggest from '@/components/AutoSuggest/CompanyAutoSuggest';
import { HiOutlinePlus, HiOutlineSave, HiOutlinePaperAirplane } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const emptyItem = {
    medicineName: '',
    company: '',
    quantity: 1,
    size: '',
    medicineId: null,
};

export default function NewOrderPage() {
    const router = useRouter();
    const [selectedContact, setSelectedContact] = useState(null);
    const [isSingleCompany, setIsSingleCompany] = useState(false);
    const [singleCompanyName, setSingleCompanyName] = useState('');
    const [items, setItems] = useState([{ ...emptyItem }]);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAddItem = () => {
        setItems([...items, { ...emptyItem }]);
    };

    const handleRemoveItem = (index) => {
        if (items.length === 1) {
            toast.error('Order must have at least one item');
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, updatedItem) => {
        const newItems = [...items];
        newItems[index] = updatedItem;
        setItems(newItems);
    };

    const handleSingleCompanyToggle = (checked) => {
        setIsSingleCompany(checked);
        if (!checked) {
            setSingleCompanyName('');
        }
    };

    const validateOrder = () => {
        if (!selectedContact) {
            toast.error('Please select a contact');
            return false;
        }

        if (isSingleCompany && !singleCompanyName.trim()) {
            toast.error('Please enter the company name');
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            if (!items[i].medicineName.trim()) {
                toast.error(`Item ${i + 1}: Medicine name is required`);
                return false;
            }
            if (!isSingleCompany && !items[i].company.trim()) {
                toast.error(`Item ${i + 1}: Company name is required`);
                return false;
            }
            if (items[i].quantity < 1) {
                toast.error(`Item ${i + 1}: Quantity must be at least 1`);
                return false;
            }
        }

        return true;
    };

    const saveOrder = async (sendViaWhatsApp = false) => {
        if (!validateOrder()) return;

        setSaving(true);
        try {
            const orderData = {
                contactId: selectedContact._id,
                items: items.map((item) => ({
                    medicineName: item.medicineName.trim(),
                    company: isSingleCompany
                        ? singleCompanyName.trim()
                        : item.company.trim(),
                    quantity: item.quantity,
                    size: item.size.trim(),
                })),
                isSingleCompany,
                singleCompanyName: singleCompanyName.trim(),
                notes,
            };

            // Create order
            const res = await api.post('/orders', orderData);
            const order = res.data.data;

            if (sendViaWhatsApp) {
                // Send via WhatsApp
                const sendRes = await api.put(`/orders/${order._id}/send`);
                const whatsappURL = sendRes.data.whatsappURL;
                openWhatsApp(whatsappURL);
                toast.success('Order sent! WhatsApp opened.');
            } else {
                toast.success('Order saved as draft!');
            }

            router.push('/orders');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save order');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="page-header">
                <h1 className="page-title">Create New Order</h1>
                <p className="page-subtitle">
                    Add items and send via WhatsApp or save as draft
                </p>
            </div>

            <div className="space-y-6">
                {/* Contact Selection */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-surface-800 mb-4">
                        Select Contact
                    </h2>
                    <ContactSelector
                        selectedContact={selectedContact}
                        onSelect={setSelectedContact}
                    />
                </div>

                {/* Single Company Toggle */}
                <div className="card">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="singleCompany"
                            checked={isSingleCompany}
                            onChange={(e) => handleSingleCompanyToggle(e.target.checked)}
                            className="w-5 h-5 text-primary-600 rounded-lg border-surface-300 focus:ring-primary-500 cursor-pointer"
                        />
                        <label
                            htmlFor="singleCompany"
                            className="text-sm font-medium text-surface-700 cursor-pointer"
                        >
                            All items from a single company
                        </label>
                    </div>

                    {isSingleCompany && (
                        <div className="mt-4 max-w-md">
                            <label className="label">Company Name</label>
                            <CompanyAutoSuggest
                                value={singleCompanyName}
                                onChange={setSingleCompanyName}
                                onSelect={setSingleCompanyName}
                                placeholder="Type company name..."
                            />
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-surface-800">
                            Order Items
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="btn-secondary btn-sm"
                        >
                            <HiOutlinePlus size={16} />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <OrderItemRow
                                key={index}
                                item={item}
                                index={index}
                                onChange={handleItemChange}
                                onRemove={handleRemoveItem}
                                isSingleCompany={isSingleCompany}
                                singleCompanyName={singleCompanyName}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="mt-4 w-full p-3 border-2 border-dashed border-surface-200 rounded-xl text-surface-400 hover:border-primary-300 hover:text-primary-600 transition-colors text-sm font-medium"
                    >
                        + Add Another Item
                    </button>
                </div>

                {/* Notes */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-surface-800 mb-4">
                        Notes (Optional)
                    </h2>
                    <textarea
                        className="input min-h-[80px] resize-y"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes for this order..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pb-8">
                    <button
                        onClick={() => saveOrder(false)}
                        disabled={saving}
                        className="btn-secondary flex-1"
                    >
                        <HiOutlineSave size={18} />
                        Save as Draft
                    </button>

                    <button
                        onClick={() => saveOrder(true)}
                        disabled={saving}
                        className="btn-whatsapp flex-1"
                    >
                        <FaWhatsapp size={18} />
                        Save & Send via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}