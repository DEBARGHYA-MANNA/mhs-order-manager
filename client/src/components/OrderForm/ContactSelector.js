'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Phone, X, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function ContactSelector({ selectedContact, onSelectContact }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchContacts = useCallback(async (q) => {
        setLoading(true);
        try {
            const res = await api.get('/contacts', { params: q ? { search: q } : {} });
            const data = res.data?.data || res.data || [];
            setResults(data.contacts || data);
        } catch (err) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleFocus() {
        setOpen(true);
        if (results.length === 0) fetchContacts('');
    }

    function handleInputChange(e) {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchContacts(val), 300);
    }

    function handleSelect(contact) {
        onSelectContact(contact);
        setOpen(false);
        setQuery('');
    }

    function handleClear() {
        onSelectContact(null);
    }

    if (selectedContact) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-[16px] bg-primary-50 border border-primary-100">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold shrink-0">
                    {selectedContact.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink-900 truncate">{selectedContact.name}</p>
                    <p className="text-sm text-ink-500 flex items-center gap-1"><Phone size={12} /> {selectedContact.phone}</p>
                </div>
                <button type="button" onClick={handleClear} className="btn-icon btn-ghost shrink-0">
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative" ref={wrapRef}>
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                    className="input pl-10 pr-10"
                    placeholder="Search contact by name or phone..."
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                />
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>

            {open && (
                <div className="suggest-dropdown max-h-64 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 size={16} className="animate-spin text-ink-400" />
                        </div>
                    )}
                    {!loading && results.length === 0 && (
                        <p className="text-sm text-ink-400 text-center py-4">No contacts found</p>
                    )}
                    {!loading &&
                        results.map((c) => (
                            <div key={c._id} className="suggest-item flex items-center gap-3" onMouseDown={() => handleSelect(c)}>
                                <div className="w-8 h-8 rounded-full bg-lavender-100 text-lavender-600 flex items-center justify-center text-sm font-bold shrink-0">
                                    {c.name?.[0]?.toUpperCase() || <User size={14} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-ink-800 text-sm truncate">{c.name}</p>
                                    <p className="text-xs text-ink-400">{c.phone} {c.company ? `• ${c.company}` : ''}</p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}