'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';

export default function UsersPage() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', role: 'staff', isActive: true, shopName: '' });
    const [addForm, setAddForm] = useState({
        name: '', username: '', password: '', role: 'staff', shopName: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isAdmin) return;
        fetchUsers();
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            shopName: user.shopName || '',
        });
        setShowModal(true);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await api.put(`/auth/users/${editingUser._id}`, form);
            toast.success('User updated!');
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleAddUser = async () => {
        if (!addForm.name || !addForm.username || !addForm.password) {
            toast.error('All fields are required');
            return;
        }
        setSaving(true);
        try {
            await api.post('/auth/register', addForm);
            toast.success('User created!');
            setShowAddModal(false);
            setAddForm({ name: '', username: '', password: '', role: 'staff', shopName: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create');
        } finally {
            setSaving(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="card text-center py-12">
                <p className="text-danger text-lg">Access Denied</p>
                <p className="text-surface-400 mt-2">Admin only section</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage staff accounts</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <HiOutlinePlus size={18} />
                    Add User
                </button>
            </div>

            <div className="table-container">
                <table className="w-full">
                    <thead>
                        <tr className="bg-surface-50 border-b border-surface-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">
                                Name
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">
                                Username
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">
                                Role
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">
                                Status
                            </th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-surface-50">
                                <td className="px-6 py-4 font-medium text-surface-800">
                                    {u.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-surface-500">
                                    {u.username}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`badge ${u.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-surface-100 text-surface-600'
                                            }`}
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`badge ${u.isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => openEditModal(u)}
                                        className="btn-ghost btn-sm"
                                    >
                                        <HiOutlinePencil size={16} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                            <h2 className="text-lg font-semibold">Edit User</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg">
                                <HiOutlineX size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="label">Name</label>
                                <input type="text" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Role</label>
                                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Shop Name</label>
                                <input type="text" className="input" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 rounded" />
                                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-100">
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleUpdate} disabled={saving} className="btn-primary">
                                {saving ? 'Saving...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                            <h2 className="text-lg font-semibold">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg">
                                <HiOutlineX size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="label">Name *</label>
                                <input type="text" className="input" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Full name" />
                            </div>
                            <div>
                                <label className="label">Username *</label>
                                <input type="text" className="input" value={addForm.username} onChange={(e) => setAddForm({ ...addForm, username: e.target.value })} placeholder="Login username" />
                            </div>
                            <div>
                                <label className="label">Password *</label>
                                <input type="password" className="input" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min 6 characters" />
                            </div>
                            <div>
                                <label className="label">Role</label>
                                <select className="input" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Shop Name</label>
                                <input type="text" className="input" value={addForm.shopName} onChange={(e) => setAddForm({ ...addForm, shopName: e.target.value })} placeholder="MHS Medical Store" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-100">
                            <button onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleAddUser} disabled={saving} className="btn-primary">
                                {saving ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}