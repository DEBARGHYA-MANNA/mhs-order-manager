'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineCube } from 'react-icons/hi';

export default function MedicinesPage() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchMedicines();
    }, [search, page]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/medicines/all?search=${encodeURIComponent(search)}&page=${page}&limit=30`
            );
            setMedicines(res.data.data || []);
            setTotalPages(res.data.pages || 1);
        } catch (error) {
            toast.error('Failed to fetch medicines');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Medicine Database</h1>
                <p className="page-subtitle">
                    Auto-populated from your orders. All medicines you&apos;ve ordered appear
                    here.
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search medicines or companies..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Medicines Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : medicines.length === 0 ? (
                <div className="card text-center py-12">
                    <HiOutlineCube size={48} className="mx-auto text-surface-300" />
                    <p className="text-surface-400 text-lg mt-4">No medicines yet</p>
                    <p className="text-surface-400 text-sm mt-1">
                        Medicines will appear here when you create orders
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {medicines.map((med) => (
                            <div key={med._id} className="card-hover">
                                <h3 className="font-semibold text-surface-800">{med.name}</h3>
                                <p className="text-sm text-primary-600 mt-0.5">{med.company}</p>
                                {med.sizes && med.sizes.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {med.sizes.map((size) => (
                                            <span
                                                key={size}
                                                className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full"
                                            >
                                                {size}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
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
                </>
            )}
        </div>
    );
}