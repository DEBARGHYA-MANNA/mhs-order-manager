'use client';

import { useState, useEffect } from 'react';
import BottomSheet from './BottomSheet';
import { X } from 'lucide-react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function ResponsiveModal({ isOpen, onClose, title, children }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        {children}
      </BottomSheet>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
            <h2 className="text-base font-bold text-ink-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}