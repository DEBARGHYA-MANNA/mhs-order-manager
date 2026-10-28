'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Shield, ShieldCheck, Pencil, Loader2, UserCog } from 'lucide-react';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import ResponsiveModal from '../../../components/ui/ResponsiveModal';

const EMPTY_FORM = { name: '', username: '', password: '', role: 'staff', shopName: '', isActive: true };

export default function AdminUsersView() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error('Admin access required');
            router.replace('/');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data?.data || res.data || []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(u) {
        setEditingId(u._id);
        setForm({ name: u.name || '', username: u.username || '', password: '', role: u.role || 'staff', shopName: u.shopName || '', isActive: u.isActive !== false });
        setModalOpen(true);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await api.put(`/auth/users/${editingId}`, payload);
                toast.success('User updated');
            } else {
                await api.post('/auth/register', form);
                toast.success('User created');
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    }

    if (authLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="page-header flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Team Members</h1>
                    <p className="page-subtitle">Manage admin and staff accounts</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={16} /> Add User
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {users.map((u) => (
                        <div key={u._id} className="bento-card">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                                    {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className={`pill ${u.role === 'admin' ? 'bg-lavender-100 text-lavender-600' : 'bg-sky-100 text-sky-600'}`}>
                                    {u.role === 'admin' ? <ShieldCheck size={13} /> : <Shield size={13} />}
                                    {u.role === 'admin' ? 'Admin' : 'Staff'}
                                </span>
                            </div>
                            <p className="font-bold text-ink-900">{u.name}</p>
                            <p className="text-sm text-ink-500">@{u.username}</p>
                            {u.shopName && <p className="text-xs text-ink-400 mt-1">{u.shopName}</p>}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
                                <span className={`text-xs font-semibold ${u.isActive !== false ? 'text-success' : 'text-ink-400'}`}>
                                    {u.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => openEdit(u)} className="btn btn-secondary btn-sm">
                                    <Pencil size={13} /> Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ResponsiveModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit User' : 'Add User'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label mb-1.5">Full Name *</label>
                        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="label mb-1.5">Username *</label>
                        <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!editingId} />
                    </div>
                    <div>
                        <label className="label mb-1.5">{editingId ? 'New Password (optional)' : 'Password *'}</label>
                        <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editingId} />
                    </div>
                    <div>
                        <label className="label mb-1.5">Shop Name</label>
                        <input className="input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
                    </div>
                    <div>
                        <label className="label mb-1.5">Role</label>
                        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {editingId && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="checkbox-modern" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                            <span className="text-sm font-semibold text-ink-700">Account active</span>
                        </label>
                    )}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary flex-1 justify-center">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <UserCog size={16} />}
                            {editingId ? 'Save Changes' : 'Create User'}
                        </button>
                    </div>
                </form>
            </ResponsiveModal>
        </div>
    );
}