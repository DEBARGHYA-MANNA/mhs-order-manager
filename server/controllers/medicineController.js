const Medicine = require('../models/Medicine');

// @desc    Search medicines (auto-suggest)
// @route   GET /api/medicines?q=para
const searchMedicines = async (req, res, next) => {
    try {
        const { q, company } = req.query;

        let query = {};

        if (q) {
            query.name = { $regex: q, $options: 'i' };
        }

        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }

        const medicines = await Medicine.find(query)
            .sort({ name: 1, company: 1 })
            .limit(20);

        // Format for auto-suggest: "Paracetamol (Cipla)"
        const suggestions = medicines.map((med) => ({
            _id: med._id,
            name: med.name,
            company: med.company,
            sizes: med.sizes,
            gstRate: med.gstRate,
            label: `${med.name} (${med.company})`,
        }));

        res.status(200).json({
            success: true,
            count: suggestions.length,
            data: suggestions,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search company names (auto-suggest)
// @route   GET /api/medicines/companies?q=cip
const searchCompanies = async (req, res, next) => {
    try {
        const { q } = req.query;

        let match = {};
        if (q) {
            match.company = { $regex: q, $options: 'i' };
        }

        const companies = await Medicine.aggregate([
            { $match: match },
            { $group: { _id: '$company' } },
            { $sort: { _id: 1 } },
            { $limit: 20 },
        ]);

        res.status(200).json({
            success: true,
            data: companies.map((c) => c._id),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all medicines
// @route   GET /api/medicines/all
const getAllMedicines = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const medicines = await Medicine.find(query)
            .sort({ name: 1, company: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Medicine.countDocuments(query);

        res.status(200).json({
            success: true,
            count: medicines.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: medicines,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create medicine (usually auto-created from orders)
// @route   POST /api/medicines
const createMedicine = async (req, res, next) => {
    try {
        const { name, company, sizes, gstRate } = req.body;

        // Check if medicine with same name + company exists
        let medicine = await Medicine.findOne({
            name: { $regex: `^${name.trim()}$`, $options: 'i' },
            company: { $regex: `^${company.trim()}$`, $options: 'i' },
        });

        if (medicine) {
            // Merge sizes if new ones provided
            if (sizes && sizes.length > 0) {
                const allSizes = [...new Set([...medicine.sizes, ...sizes])];
                medicine.sizes = allSizes;
                await medicine.save();
            }

            return res.status(200).json({
                success: true,
                message: 'Medicine already exists. Sizes merged.',
                data: medicine,
                isExisting: true,
            });
        }

        // Create new medicine entry
        medicine = await Medicine.create({
            name: name.trim(),
            company: company.trim(),
            sizes: sizes || [],
            gstRate: gstRate || 12,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            data: medicine,
            isExisting: false,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
const updateMedicine = async (req, res, next) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
const deleteMedicine = async (req, res, next) => {
    try {
        const medicine = await Medicine.findByIdAndDelete(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Medicine deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchMedicines,
    searchCompanies,
    getAllMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
};