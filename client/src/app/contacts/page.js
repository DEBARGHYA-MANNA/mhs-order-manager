'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlinePhone,
    HiOutlineOfficeBuilding,
} from 'react-icons/hi';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        company: '',
        type: 'supplier',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [search]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/contacts?search=${encodeURIComponent(search)}`);
            setContacts(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch contacts');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingContact(null);
        setForm({ name: '', phone: '', company: '', type: 'supplier', notes: '' });
        setShowModal(true);
    };

    const openEditModal = (contact) => {
        setEditingContact(contact);
        setForm({
            name: contact.name,
            phone: contact.phone,
            company: contact.company || '',
            type: contact.type,
            notes: contact.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error('Name and phone are required');
            return;
        }

        setSaving(true);
        try {
            if (editingContact) {
                await api.put(`/contacts/${editingContact._id}`, form);
                toast.success('Contact updated!');
            } else {
                await api.post('/contacts', form);
                toast.success('Contact added!');
            }
            setShowModal(false);
            fetchContacts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this contact?')) return;
        try {
            await api.delete(`/contacts/${id}`);
            toast.success('Contact deleted');
            fetchContacts();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">Contacts</h1>
                    <p className="page-subtitle">
                        Manage your suppliers and representatives
                    </p>
                </div>
                <button onClick={openAddModal} className="btn-primary">
                    <HiOutlinePlus size={18} />
                    Add Contact
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Contacts Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : contacts.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-surface-400 text-lg">No contacts found</p>
                    <button onClick={openAddModal} className="btn-primary mt-4">
                        Add your first contact
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((contact) => (
                        <div key={contact._id} className="card-hover">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-surface-800">
                                        {contact.name}
                                    </h3>
                                    <span className="inline-block mt-1 text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full capitalize">
                                        {contact.type}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEditModal(contact)}
                                        className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <HiOutlinePencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(contact._id)}
                                        className="p-1.5 text-surface-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 space-y-1.5">
                                <div className="flex items-center gap-2 text-sm text-surface-500">
                                    <HiOutlinePhone size={14} />
                                    {contact.phone}
                                </div>
                                {contact.company && (
                                    <div className="flex items-center gap-2 text-sm text-surface-500">
                                        <HiOutlineOfficeBuilding size={14} />
                                        {contact.company}
                                    </div>
                                )}
                            </div>

                            {contact.notes && (
                                <p className="mt-3 text-xs text-surface-400 border-t border-surface-100 pt-3">
                                    {contact.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                            <h2 className="text-lg font-semibold text-surface-800">
                                {editingContact ? 'Edit Contact' : 'Add Contact'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg"
                            >
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="label">Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contact name"
                                />
                            </div>
                            <div>
                                <label className="label">Phone *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="919876543210"
                                />
                            </div>
                            <div>
                                <label className="label">Company</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={form.company}
                                    onChange={(e) =>
                                        setForm({ ...form, company: e.target.value })
                                    }
                                    placeholder="Company name"
                                />
                            </div>
                            <div>
                                <label className="label">Type</label>
                                <select
                                    className="input"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="supplier">Supplier</option>
                                    <option value="representative">Representative</option>
                                    <option value="distributor">Distributor</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Notes</label>
                                <textarea
                                    className="input min-h-[60px] resize-y"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-100">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? 'Saving...' : editingContact ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}