'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { HiSearch, HiPhone, HiOfficeBuilding } from 'react-icons/hi';

export default function ContactSelector({ selectedContact, onSelect }) {
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/contacts?search=${encodeURIComponent(query)}`);
            setContacts(res.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
        fetchContacts(value);
    };

    const handleSelect = (contact) => {
        onSelect(contact);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative">
            {/* Selected Contact Display */}
            {selectedContact ? (
                <div
                    className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-xl cursor-pointer hover:bg-primary-100 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div>
                        <p className="font-semibold text-primary-800">
                            {selectedContact.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-primary-600">
                            <span className="flex items-center gap-1">
                                <HiPhone size={12} /> {selectedContact.phone}
                            </span>
                            {selectedContact.company && (
                                <span className="flex items-center gap-1">
                                    <HiOfficeBuilding size={12} /> {selectedContact.company}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(null);
                        }}
                    >
                        Change
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 border-2 border-dashed border-surface-200 rounded-xl text-surface-500 hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
                >
                    + Select a Contact / Supplier
                </button>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full bg-white border border-surface-200 rounded-xl shadow-lg mt-2 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-surface-100">
                        <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                            <input
                                type="text"
                                className="input pl-10"
                                placeholder="Search contacts..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-surface-400 text-sm">
                                Loading...
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="p-4 text-center text-surface-400 text-sm">
                                No contacts found
                            </div>
                        ) : (
                            contacts.map((contact) => (
                                <div
                                    key={contact._id}
                                    className="px-4 py-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-0 transition-colors"
                                    onClick={() => handleSelect(contact)}
                                >
                                    <p className="font-medium text-sm text-surface-800">
                                        {contact.name}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-surface-400">
                                        <span>{contact.phone}</span>
                                        {contact.company && <span>• {contact.company}</span>}
                                        <span className="capitalize">• {contact.type}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}