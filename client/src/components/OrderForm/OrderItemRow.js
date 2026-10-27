'use client';

import MedicineAutoSuggest from '../AutoSuggest/MedicineAutoSuggest';
import CompanyAutoSuggest from '../AutoSuggest/CompanyAutoSuggest';
import { HiOutlineTrash } from 'react-icons/hi';

const SIZE_OPTIONS = [
    '5ml', '10ml', '15ml', '20ml', '25ml', '30ml', '50ml', '60ml', '100ml',
    '200ml', '250ml', '500ml', '1L',
    '50mg', '100mg', '150mg', '200mg', '250mg', '300mg', '500mg', '650mg',
    '1g', '5g', '10g', '15g', '20g', '25g', '30g', '50g', '100g',
    '1 strip', '1 box', '1 bottle', '1 tube', '1 pack',
];

export default function OrderItemRow({
    item,
    index,
    onChange,
    onRemove,
    isSingleCompany,
    singleCompanyName,
}) {
    const handleFieldChange = (field, value) => {
        onChange(index, { ...item, [field]: value });
    };

    const handleMedicineSelect = (suggestion) => {
        onChange(index, {
            ...item,
            medicineName: suggestion.name,
            company: isSingleCompany ? singleCompanyName : suggestion.company,
            medicineId: suggestion._id,
            // If suggestion has sizes, keep current or set first one
            size: item.size || (suggestion.sizes && suggestion.sizes[0]) || '',
        });
    };

    const handleCompanySelect = (company) => {
        handleFieldChange('company', company);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
            {/* Row number */}
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm shrink-0 self-start mt-1">
                {index + 1}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Medicine Name */}
                <div>
                    <label className="label">Medicine Name</label>
                    <MedicineAutoSuggest
                        value={item.medicineName}
                        onChange={(val) => handleFieldChange('medicineName', val)}
                        onSelect={handleMedicineSelect}
                        placeholder="Type medicine name..."
                    />
                </div>

                {/* Company */}
                <div>
                    <label className="label">Company</label>
                    <CompanyAutoSuggest
                        value={isSingleCompany ? singleCompanyName : item.company}
                        onChange={(val) => handleFieldChange('company', val)}
                        onSelect={handleCompanySelect}
                        placeholder="Type company name..."
                        disabled={isSingleCompany}
                    />
                </div>

                {/* Size */}
                <div>
                    <label className="label">Size</label>
                    <div className="relative">
                        <input
                            type="text"
                            list={`size-options-${index}`}
                            className="input"
                            value={item.size}
                            onChange={(e) => handleFieldChange('size', e.target.value)}
                            placeholder="e.g. 10ml"
                        />
                        <datalist id={`size-options-${index}`}>
                            {SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size} />
                            ))}
                        </datalist>
                    </div>
                </div>

                {/* Quantity */}
                <div>
                    <label className="label">Quantity</label>
                    <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) =>
                            handleFieldChange('quantity', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        placeholder="Qty"
                    />
                </div>
            </div>

            {/* Remove button */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="self-start mt-7 p-2 text-surface-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                title="Remove item"
            >
                <HiOutlineTrash size={18} />
            </button>
        </div>
    );
}