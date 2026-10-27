const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            default: null,
        },
        medicineName: {
            type: String,
            required: [true, 'Medicine name is required'],
            trim: true,
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        size: {
            type: String,
            trim: true,
            default: '',
        },
        gstRate: {
            type: Number,
            default: 12,
        },
        buyingPrice: {
            type: Number,
            default: null,
            // Filled ONLY after arrival
        },
        isDelivered: {
            type: Boolean,
            default: false,
            // Checkbox during arrival confirmation
        },
    },
    { _id: true }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },
        contactId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
            required: [true, 'Contact is required'],
        },
        contactName: {
            type: String,
            required: true,
        },
        contactPhone: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['drafted', 'ordered', 'partially_arrived', 'arrived'],
            default: 'drafted',
        },
        isSingleCompany: {
            type: Boolean,
            default: false,
        },
        singleCompanyName: {
            type: String,
            trim: true,
            default: '',
        },
        items: [orderItemSchema],

        // Financials (calculated after arrival, kept in backend)
        subtotal: {
            type: Number,
            default: 0,
        },
        gstAmount: {
            type: Number,
            default: 0,
        },
        grandTotal: {
            type: Number,
            default: 0,
        },

        // Timestamps for each status change
        draftedAt: {
            type: Date,
            default: Date.now,
        },
        orderedAt: {
            type: Date,
            default: null,
        },
        arrivedAt: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const today = new Date();
        const dateStr =
            today.getFullYear().toString() +
            (today.getMonth() + 1).toString().padStart(2, '0') +
            today.getDate().toString().padStart(2, '0');

        // Count today's orders
        const count = await mongoose.model('Order').countDocuments({
            orderNumber: new RegExp(`^ORD-${dateStr}`),
        });

        this.orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

// Calculate financials method
orderSchema.methods.calculateFinancials = function () {
    let subtotal = 0;
    let gstAmount = 0;

    this.items.forEach((item) => {
        if (item.buyingPrice && item.isDelivered) {
            const itemTotal = item.buyingPrice * item.quantity;
            const itemGst = (itemTotal * item.gstRate) / 100;
            subtotal += itemTotal;
            gstAmount += itemGst;
        }
    });

    this.subtotal = Math.round(subtotal * 100) / 100;
    this.gstAmount = Math.round(gstAmount * 100) / 100;
    this.grandTotal = Math.round((subtotal + gstAmount) * 100) / 100;

    return this;
};

// Indexes
orderSchema.index({ status: 1 });
orderSchema.index({ contactId: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ orderedAt: -1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);