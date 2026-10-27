const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        sizes: {
            type: [String],
            default: [],
            // e.g. ["10ml", "30ml", "100ml", "500mg", "1g"]
        },
        gstRate: {
            type: Number,
            default: 12,
            // Kept in DB but not shown in frontend for now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// COMPOUND UNIQUE INDEX: Same medicine + same company = 1 entry
// "Paracetamol + Cipla" is different from "Paracetamol + Sun Pharma"
medicineSchema.index({ name: 1, company: 1 }, { unique: true });

// Text index for search/auto-suggest
medicineSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);