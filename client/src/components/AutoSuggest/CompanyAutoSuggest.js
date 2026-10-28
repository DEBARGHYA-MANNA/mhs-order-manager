'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export default function CompanyAutoSuggest({ value, onChange, placeholder = 'Company name', disabled = false }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => setQuery(value || ''), [value]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = useCallback(async (q) => {
        if (!q || q.trim().length < 1) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/medicines/companies', { params: { q } });
            const data = res.data?.data || res.data || [];
            setSuggestions(data);
        } catch (err) {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleInputChange(e) {
        const val = e.target.value;
        setQuery(val);
        onChange?.(val);
        setOpen(true);
        setActiveIndex(-1);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    }

    function handleSelect(name) {
        setQuery(name);
        setOpen(false);
        setSuggestions([]);
        onChange?.(name);
    }

    function handleKeyDown(e) {
        if (!open || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0) handleSelect(suggestions[activeIndex]?.name || suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    }

    return (
        <div className="relative" ref={wrapRef}>
            <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                    className="input pl-10"
                    placeholder={placeholder}
                    value={query}
                    disabled={disabled}
                    onChange={handleInputChange}
                    onFocus={() => query && setOpen(true)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                {loading && <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 animate-spin" />}
            </div>

            {open && suggestions.length > 0 && (
                <div className="suggest-dropdown">
                    {suggestions.map((item, i) => {
                        const name = item.name || item;
                        return (
                            <div
                                key={i}
                                className={`suggest-item ${i === activeIndex ? 'suggest-item-active' : ''}`}
                                onMouseDown={() => handleSelect(name)}
                                onMouseEnter={() => setActiveIndex(i)}
                            >
                                <p className="font-semibold text-ink-800 text-sm">{name}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}