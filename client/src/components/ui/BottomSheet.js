'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BottomSheet({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div className="sheet-overlay" onClick={onClose} />
            <div className="sheet-content">
                <div className="sheet-handle" />
                {title && (
                    <div className="flex items-center justify-between px-5 pt-3 pb-2">
                        <h3 className="text-base font-bold text-ink-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <div className="px-5 pb-6">{children}</div>
            </div>
        </>
    );
}