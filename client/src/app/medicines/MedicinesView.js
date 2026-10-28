'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Pill, ChevronLeft, ChevronRight, Building2, Ruler } from 'lucide-react';
import api from '../../utils/api';

export default function MedicinesView() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;

    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (search.trim()) params.q = search.trim();
            const res = await api.get('/medicines', { params });
            const data = res.data?.data || res.data || {};
            setMedicines(data.medicines || data || []);
            setTotalPages(data.totalPages || data.pages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            toast.error('Failed to load medicines');
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchMedicines(); }, [fetchMedicines]);
    useEffect(() => { setPage(1); }, [search]);

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="page-header">
                <h1 className="page-title">Medicine Database</h1>
                <p className="page-subtitle">{total} unique medicine + company combinations tracked</p>
            </div>

            <div className="relative mb-5">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                    className="input pl-11"
                    placeholder="Search medicines or companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
            ) : medicines.length === 0 ? (
                <div className="empty-state">
                    <Pill className="empty-state-icon" />
                    <p className="font-semibold text-ink-700">No medicines found</p>
                    <p className="text-sm text-ink-400 mt-1">Medicines are auto-added as you create orders.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {medicines.map((med) => (
                            <div key={med._id} className="bento-card">
                                <div className="icon-chip bg-mint-100 text-mint-600 mb-3">
                                    <Pill size={16} />
                                </div>
                                <p className="font-bold text-ink-900 truncate">{med.name}</p>
                                {med.company && (
                                    <p className="text-sm text-ink-500 flex items-center gap-1.5 mt-1"><Building2 size={13} /> {med.company}</p>
                                )}
                                {med.sizes?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {med.sizes.map((s, i) => (
                                            <span key={i} className="chip !py-1 !px-2.5 text-xs flex items-center gap-1">
                                                <Ruler size={10} /> {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-icon btn-ghost disabled:opacity-30">
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm font-semibold text-ink-600">Page {page} of {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-icon btn-ghost disabled:opacity-30">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}