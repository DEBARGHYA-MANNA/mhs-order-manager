const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Contact name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            // Store with country code e.g. 919876543210
        },
        company: {
            type: String,
            trim: true,
            default: '',
        },
        type: {
            type: String,
            enum: ['representative', 'supplier', 'distributor'],
            default: 'supplier',
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for searching
contactSchema.index({ name: 'text', company: 'text' });

module.exports = mongoose.model('Contact', contactSchema);