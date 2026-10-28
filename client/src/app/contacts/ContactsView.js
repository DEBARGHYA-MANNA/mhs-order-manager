'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Plus, Phone, Pencil, Trash2, Users, Loader2, Building2 } from 'lucide-react';
import api from '../../utils/api';
import ResponsiveModal from '../../components/ui/ResponsiveModal';

const TYPE_LABELS = {
    representative: { label: 'Representative', className: 'bg-lavender-100 text-lavender-600' },
    supplier: { label: 'Supplier', className: 'bg-mint-100 text-mint-600' },
    distributor: { label: 'Distributor', className: 'bg-peach-100 text-peach-600' },
};

const EMPTY_FORM = { name: '', phone: '', company: '', type: 'supplier', notes: '' };

export default function ContactsView() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchContacts = useCallback(async (q = '') => {
        setLoading(true);
        try {
            const res = await api.get('/contacts', { params: q ? { search: q } : {} });
            const data = res.data?.data || res.data || [];
            setContacts(data.contacts || data);
        } catch (err) {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    useEffect(() => {
        const t = setTimeout(() => fetchContacts(search), 300);
        return () => clearTimeout(t);
    }, [search, fetchContacts]);

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(contact) {
        setEditingId(contact._id);
        setForm({
            name: contact.name || '',
            phone: contact.phone || '',
            company: contact.company || '',
            type: contact.type || 'supplier',
            notes: contact.notes || '',
        });
        setModalOpen(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error('Name and phone are required');
            return;
        }
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/contacts/${editingId}`, form);
                toast.success('Contact updated');
            } else {
                await api.post('/contacts', form);
                toast.success('Contact created');
            }
            setModalOpen(false);
            fetchContacts(search);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save contact');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setSaving(true);
        try {
            await api.delete(`/contacts/${deleteTarget._id}`);
            toast.success('Contact removed');
            setDeleteTarget(null);
            fetchContacts(search);
        } catch (err) {
            toast.error('Failed to delete contact');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="page-header flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Contacts</h1>
                    <p className="page-subtitle">{contacts.length} suppliers &amp; representatives</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={16} /> Add Contact
                </button>
            </div>

            <div className="relative mb-5">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                    className="input pl-11"
                    placeholder="Search by name, phone or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
            ) : contacts.length === 0 ? (
                <div className="empty-state">
                    <Users className="empty-state-icon" />
                    <p className="font-semibold text-ink-700">No contacts yet</p>
                    <p className="text-sm text-ink-400 mt-1">Add your first supplier or representative.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map((c) => {
                        const typeInfo = TYPE_LABELS[c.type] || TYPE_LABELS.supplier;
                        return (
                            <div key={c._id} className="bento-card bento-card-hover">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                                        {c.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span className={`pill ${typeInfo.className}`}>{typeInfo.label}</span>
                                </div>
                                <p className="font-bold text-ink-900 truncate">{c.name}</p>
                                <p className="text-sm text-ink-500 flex items-center gap-1.5 mt-1"><Phone size={13} /> {c.phone}</p>
                                {c.company && (
                                    <p className="text-sm text-ink-500 flex items-center gap-1.5 mt-1"><Building2 size={13} /> {c.company}</p>
                                )}
                                {c.notes && <p className="text-xs text-ink-400 mt-2 line-clamp-2">{c.notes}</p>}
                                <div className="flex gap-2 mt-4 pt-3 border-t border-ink-100">
                                    <button onClick={() => openEdit(c)} className="btn btn-secondary btn-sm flex-1 justify-center">
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button onClick={() => setDeleteTarget(c)} className="btn-icon btn-ghost text-danger hover:bg-danger-bg">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ResponsiveModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Contact' : 'Add Contact'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label mb-1.5">Name *</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="label mb-1.5">Phone *</label>
                        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+91XXXXXXXXXX" />
                    </div>
                    <div>
                        <label className="label mb-1.5">Company</label>
                        <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                    </div>
                    <div>
                        <label className="label mb-1.5">Type</label>
                        <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <option value="supplier">Supplier</option>
                            <option value="representative">Representative</option>
                            <option value="distributor">Distributor</option>
                        </select>
                    </div>
                    <div>
                        <label className="label mb-1.5">Notes</label>
                        <textarea className="input min-h-[80px] resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary flex-1 justify-center">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {editingId ? 'Save Changes' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </ResponsiveModal>

            <ResponsiveModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Contact">
                <div>
                    <p className="text-sm text-ink-700 mb-5">
                        Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This will not affect past orders.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                        <button onClick={handleDelete} disabled={saving} className="btn btn-danger flex-1 justify-center">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                        </button>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}