'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';

export default function CompanyAutoSuggest({
    value,
    onChange,
    onSelect,
    placeholder = 'Type company name...',
    disabled = false,
    className = '',
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!value || value.length < 1 || disabled) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(
                    `/medicines/companies?q=${encodeURIComponent(value)}`
                );
                setSuggestions(res.data.data || []);
                setIsOpen(true);
                setActiveIndex(-1);
            } catch (error) {
                console.error('Company auto-suggest error:', error);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value, disabled]);

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

    const handleSelect = (company) => {
        onSelect(company);
        setIsOpen(false);
        setActiveIndex(-1);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <input
                type="text"
                className={`input ${className}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (suggestions.length > 0) setIsOpen(true);
                }}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
            />

            {isOpen && suggestions.length > 0 && (
                <div className="suggest-dropdown">
                    {suggestions.map((company, index) => (
                        <div
                            key={company}
                            className={`suggest-item ${index === activeIndex ? 'suggest-item-active' : ''
                                }`}
                            onClick={() => handleSelect(company)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            {company}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}