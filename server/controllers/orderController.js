const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Contact = require('../models/Contact');
const {
    buildWhatsAppMessage,
    buildWhatsAppURL,
} = require('../utils/whatsappTemplate');

// Helper: Auto-save medicines from order items
const autoSaveMedicines = async (items, userId) => {
    const medicineIds = [];

    for (const item of items) {
        try {
            let medicine = await Medicine.findOne({
                name: { $regex: `^${item.medicineName.trim()}$`, $options: 'i' },
                company: { $regex: `^${item.company.trim()}$`, $options: 'i' },
            });

            if (!medicine) {
                // Create new medicine entry
                medicine = await Medicine.create({
                    name: item.medicineName.trim(),
                    company: item.company.trim(),
                    sizes: item.size ? [item.size] : [],
                    gstRate: item.gstRate || 12,
                    createdBy: userId,
                });
            } else {
                // Merge size if new
                if (item.size && !medicine.sizes.includes(item.size)) {
                    medicine.sizes.push(item.size);
                    await medicine.save();
                }
            }

            medicineIds.push({ index: items.indexOf(item), id: medicine._id });
        } catch (err) {
            // If duplicate key error, find the existing one
            if (err.code === 11000) {
                const existing = await Medicine.findOne({
                    name: { $regex: `^${item.medicineName.trim()}$`, $options: 'i' },
                    company: { $regex: `^${item.company.trim()}$`, $options: 'i' },
                });
                if (existing) {
                    medicineIds.push({ index: items.indexOf(item), id: existing._id });
                }
            }
        }
    }

    return medicineIds;
};

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
    try {
        const { status, contactId, startDate, endDate, page = 1, limit = 20 } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (contactId) {
            query.contactId = contactId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('contactId', 'name phone company')
            .populate('userId', 'name');

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: orders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('contactId', 'name phone company type')
            .populate('userId', 'name shopName');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
    try {
        const { contactId, items, isSingleCompany, singleCompanyName, notes } = req.body;

        // Get contact details
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found.',
            });
        }

        // If single company, override all item companies
        let processedItems = items;
        if (isSingleCompany && singleCompanyName) {
            processedItems = items.map((item) => ({
                ...item,
                company: singleCompanyName,
            }));
        }

        // Auto-save medicines to database
        const medicineIds = await autoSaveMedicines(processedItems, req.user._id);

        // Attach medicine IDs to items
        processedItems = processedItems.map((item, index) => {
            const found = medicineIds.find((m) => m.index === index);
            return {
                ...item,
                medicineId: found ? found.id : null,
            };
        });

        // Create order
        const order = await Order.create({
            contactId: contact._id,
            contactName: contact.name,
            contactPhone: contact.phone,
            userId: req.user._id,
            userName: req.user.name,
            status: 'drafted',
            isSingleCompany: isSingleCompany || false,
            singleCompanyName: singleCompanyName || '',
            items: processedItems,
            notes: notes || '',
            draftedAt: new Date(),
        });

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order (only drafts can be fully edited)
// @route   PUT /api/orders/:id
const updateOrder = async (req, res, next) => {
    try {
        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        // Only drafted orders can be fully edited
        if (order.status !== 'drafted') {
            return res.status(400).json({
                success: false,
                message: 'Only drafted orders can be edited.',
            });
        }

        const { contactId, items, isSingleCompany, singleCompanyName, notes } = req.body;

        // If contact changed, get new contact details
        if (contactId && contactId !== order.contactId.toString()) {
            const contact = await Contact.findById(contactId);
            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found.',
                });
            }
            order.contactId = contact._id;
            order.contactName = contact.name;
            order.contactPhone = contact.phone;
        }

        // Process items
        if (items) {
            let processedItems = items;
            if (isSingleCompany && singleCompanyName) {
                processedItems = items.map((item) => ({
                    ...item,
                    company: singleCompanyName,
                }));
            }

            // Auto-save new medicines
            const medicineIds = await autoSaveMedicines(processedItems, req.user._id);
            processedItems = processedItems.map((item, index) => {
                const found = medicineIds.find((m) => m.index === index);
                return {
                    ...item,
                    medicineId: found ? found.id : null,
                };
            });

            order.items = processedItems;
        }

        if (isSingleCompany !== undefined) order.isSingleCompany = isSingleCompany;
        if (singleCompanyName !== undefined) order.singleCompanyName = singleCompanyName;
        if (notes !== undefined) order.notes = notes;

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send order (drafted → ordered) + generate WhatsApp link
// @route   PUT /api/orders/:id/send
const sendOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        if (order.status !== 'drafted') {
            return res.status(400).json({
                success: false,
                message: 'Only drafted orders can be sent.',
            });
        }

        if (!order.items || order.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order has no items. Add items before sending.',
            });
        }

        // Update status
        order.status = 'ordered';
        order.orderedAt = new Date();
        await order.save();

        // Build WhatsApp message
        const shopName = req.user.shopName || 'MHS Medical Store';
        const message = buildWhatsAppMessage(order, shopName);
        const whatsappURL = buildWhatsAppURL(order.contactPhone, message);

        res.status(200).json({
            success: true,
            data: order,
            whatsappURL,
            message,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm arrival (ordered → arrived/partially_arrived)
// @route   PUT /api/orders/:id/arrive
const confirmArrival = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        if (order.status !== 'ordered' && order.status !== 'partially_arrived') {
            return res.status(400).json({
                success: false,
                message: 'Only ordered or partially arrived orders can be confirmed.',
            });
        }

        const { items } = req.body;
        // items: [{ _id: "itemId", isDelivered: true/false, buyingPrice: 100 }, ...]

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide item delivery status.',
            });
        }

        // Update each item's delivery status and buying price
        items.forEach((update) => {
            const item = order.items.id(update._id);
            if (item) {
                item.isDelivered = update.isDelivered;
                if (update.isDelivered && update.buyingPrice !== undefined) {
                    item.buyingPrice = update.buyingPrice;
                }
            }
        });

        // Determine order status
        const allDelivered = order.items.every((item) => item.isDelivered);
        const someDelivered = order.items.some((item) => item.isDelivered);

        if (allDelivered) {
            order.status = 'arrived';
        } else if (someDelivered) {
            order.status = 'partially_arrived';
        }
        // If none delivered, status stays as 'ordered'

        order.arrivedAt = new Date();

        // Calculate financials
        order.calculateFinancials();

        await order.save();

        res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Re-order (copy an existing order into a new draft)
// @route   POST /api/orders/:id/reorder
const reorder = async (req, res, next) => {
    try {
        const originalOrder = await Order.findById(req.params.id);

        if (!originalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Original order not found.',
            });
        }

        // Create new items without prices and delivery status
        const newItems = originalOrder.items.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            company: item.company,
            quantity: item.quantity,
            size: item.size,
            gstRate: item.gstRate,
            buyingPrice: null,
            isDelivered: false,
        }));

        // Create new draft order
        const newOrder = await Order.create({
            contactId: originalOrder.contactId,
            contactName: originalOrder.contactName,
            contactPhone: originalOrder.contactPhone,
            userId: req.user._id,
            userName: req.user.name,
            status: 'drafted',
            isSingleCompany: originalOrder.isSingleCompany,
            singleCompanyName: originalOrder.singleCompanyName,
            items: newItems,
            notes: `Re-order from ${originalOrder.orderNumber}`,
            draftedAt: new Date(),
        });

        res.status(201).json({
            success: true,
            data: newOrder,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order (admin only, drafts only)
// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.',
            });
        }

        if (order.status !== 'drafted' && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Only draft orders can be deleted by staff.',
            });
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    sendOrder,
    confirmArrival,
    reorder,
    deleteOrder,
};