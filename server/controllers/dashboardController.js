const Order = require('../models/Order');
const Contact = require('../models/Contact');
const Medicine = require('../models/Medicine');

// Helper: Get date range from period
const getDateRange = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
        case 'weekly':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case 'quarterly':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return { startDate, endDate: now };
};

// @desc    Get dashboard summary (stat cards)
// @route   GET /api/dashboard/summary
const getSummary = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const draftedOrders = await Order.countDocuments({ status: 'drafted' });
        const orderedOrders = await Order.countDocuments({ status: 'ordered' });
        const partiallyArrived = await Order.countDocuments({ status: 'partially_arrived' });
        const arrivedOrders = await Order.countDocuments({ status: 'arrived' });
        const totalContacts = await Contact.countDocuments({ isActive: true });
        const totalMedicines = await Medicine.countDocuments();

        // Total spending (from arrived orders)
        const spendingResult = await Order.aggregate([
            { $match: { status: { $in: ['arrived', 'partially_arrived'] } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ]);
        const totalSpending = spendingResult.length > 0 ? spendingResult[0].total : 0;

        // Pending arrivals (ordered but not arrived)
        const pendingArrivals = orderedOrders + partiallyArrived;

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                draftedOrders,
                orderedOrders,
                partiallyArrived,
                arrivedOrders,
                pendingArrivals,
                totalContacts,
                totalMedicines,
                totalSpending,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Orders by contact (for bar chart)
// @route   GET /api/dashboard/orders-by-contact?period=monthly
const getOrdersByContact = async (req, res, next) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'drafted' },
                },
            },
            {
                $group: {
                    _id: '$contactName',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$grandTotal' },
                },
            },
            { $sort: { orderCount: -1 } },
            { $limit: 15 },
        ]);

        res.status(200).json({
            success: true,
            period,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Spending over time (for line chart)
// @route   GET /api/dashboard/spending-trend?period=yearly
const getSpendingTrend = async (req, res, next) => {
    try {
        const { period = 'yearly' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        let groupFormat;
        if (period === 'weekly' || period === 'monthly') {
            groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$arrivedAt' } };
        } else {
            groupFormat = { $dateToString: { format: '%Y-%m', date: '$arrivedAt' } };
        }

        const result = await Order.aggregate([
            {
                $match: {
                    arrivedAt: { $gte: startDate, $lte: endDate },
                    status: { $in: ['arrived', 'partially_arrived'] },
                },
            },
            {
                $group: {
                    _id: groupFormat,
                    totalSpent: { $sum: '$grandTotal' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            period,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Top ordered medicines (for horizontal bar)
// @route   GET /api/dashboard/top-medicines?period=monthly
const getTopMedicines = async (req, res, next) => {
    try {
        const { period = 'monthly' } = req.query;
        const { startDate, endDate } = getDateRange(period);

        const result = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $ne: 'drafted' },
                },
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        name: '$items.medicineName',
                        company: '$items.company',
                    },
                    totalQuantity: { $sum: '$items.quantity' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
        ]);

        res.status(200).json({
            success: true,
            period,
            data: result.map((r) => ({
                medicineName: r._id.name,
                company: r._id.company,
                label: `${r._id.name} (${r._id.company})`,
                totalQuantity: r.totalQuantity,
                orderCount: r.orderCount,
            })),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Order status breakdown (for doughnut)
// @route   GET /api/dashboard/status-breakdown
const getStatusBreakdown = async (req, res, next) => {
    try {
        const result = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummary,
    getOrdersByContact,
    getSpendingTrend,
    getTopMedicines,
    getStatusBreakdown,
};