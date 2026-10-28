import { FileEdit, Send, PackageSearch, PackageCheck } from 'lucide-react';

export const STATUS_CONFIG = {
    drafted: { label: 'Drafted', pillClass: 'pill-drafted', icon: FileEdit },
    ordered: { label: 'Ordered', pillClass: 'pill-ordered', icon: Send },
    partially_arrived: {
        label: 'Partially Arrived',
        pillClass: 'pill-partially_arrived',
        icon: PackageSearch,
    },
    arrived: { label: 'Arrived', pillClass: 'pill-arrived', icon: PackageCheck },
};

export const STATUS_FILTERS = [
    { value: 'all', label: 'All Orders' },
    { value: 'drafted', label: 'Drafted' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'partially_arrived', label: 'Partially Arrived' },
    { value: 'arrived', label: 'Arrived' },
];