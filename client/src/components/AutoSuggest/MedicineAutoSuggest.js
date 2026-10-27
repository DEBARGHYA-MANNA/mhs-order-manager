'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';

export default function MedicineAutoSuggest({
    value,
    onChange,
    onSelect,
    placeholder = 'Type medicine name...',
    className = '',
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value || value.length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/medicines?q=${encodeURIComponent(value)}`);
                setSuggestions(res.data.data || []);
                setIsOpen(true);
                setActiveIndex(-1);
            } catch (error) {
                console.error('Auto-suggest error:', error);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value]);

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleSelect = (suggestion) => {
        onSelect(suggestion);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                ref={inputRef}
                type="text"
                className={`input ${className}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (suggestions.length > 0) setIsOpen(true);
                }}
                placeholder={placeholder}
                autoComplete="off"
            />

            {isOpen && suggestions.length > 0 && (
                <div className="suggest-dropdown">
                    {suggestions.map((item, index) => (
                        <div
                            key={item._id}
                            className={`suggest-item ${index === activeIndex ? 'suggest-item-active' : ''
                                }`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            <span className="font-medium">{item.name}</span>
                            <span className="text-surface-400 ml-2">({item.company})</span>
                            {item.sizes && item.sizes.length > 0 && (
                                <span className="text-xs text-surface-300 ml-2">
                                    [{item.sizes.join(', ')}]
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}