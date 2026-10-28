'use client';

import { X, Hash, Ruler } from 'lucide-react';
import MedicineAutoSuggest from '../AutoSuggest/MedicineAutoSuggest';
import CompanyAutoSuggest from '../AutoSuggest/CompanyAutoSuggest';

const SIZE_PRESETS = [
    '2ml', '5ml', '10ml', '15ml', '20ml', '30ml', '50ml', '60ml', '100ml', '120ml', '200ml', '500ml', '1L',
    '5g', '10g', '15g', '20g', '25g', '30g', '50g', '100g',
    '1 strip', '2 strips', '10 tabs', '15 tabs', '30 tabs',
    '1 vial', '5 vials', '10 vials',
    'Small', 'Medium', 'Large',
    '1 box', '1 unit', '1 piece', 'N/A',
];

export default function OrderItemRow({ item, index, isSingleCompany, singleCompanyName, onUpdate, onRemove, canRemove }) {
    function handleMedicineSelect(medicine) {
        onUpdate({
            medicineId: medicine._id,
            medicineName: medicine.name,
            company: isSingleCompany ? singleCompanyName : medicine.company || item.company,
            size: item.size || (medicine.sizes && medicine.sizes[0]) || '',
        });
    }

    return (
        <div className="bg-ink-50/60 rounded-[18px] p-4 border border-ink-100">
            <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    {index + 1}
                </div>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                        <label className="label mb-1.5">Medicine Name</label>
                        <MedicineAutoSuggest
                            value={item.medicineName}
                            onChange={(val) => onUpdate({ medicineName: val, medicineId: null })}
                            onSelect={handleMedicineSelect}
                            placeholder="e.g. Paracetamol Syrup"
                        />
                    </div>

                    <div>
                        <label className="label mb-1.5">Company</label>
                        <CompanyAutoSuggest
                            value={isSingleCompany ? singleCompanyName : item.company}
                            onChange={(val) => onUpdate({ company: val })}
                            disabled={isSingleCompany}
                            placeholder="Company / brand"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label mb-1.5 flex items-center gap-1"><Ruler size={11} /> Size</label>
                            <input
                                className="input"
                                list={`sizes-${index}`}
                                value={item.size}
                                onChange={(e) => onUpdate({ size: e.target.value })}
                                placeholder="10ml"
                            />
                            <datalist id={`sizes-${index}`}>
                                {SIZE_PRESETS.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="label mb-1.5 flex items-center gap-1"><Hash size={11} /> Qty</label>
                            <input
                                type="number"
                                min="1"
                                className="input"
                                value={item.quantity}
                                onChange={(e) => onUpdate({ quantity: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {canRemove && (
                    <button type="button" onClick={onRemove} className="btn-icon btn-ghost shrink-0 mt-1 text-danger hover:bg-danger-bg">
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}