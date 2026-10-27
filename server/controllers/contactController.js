const Contact = require('../models/Contact');

// @desc    Get all contacts
// @route   GET /api/contacts
const getContacts = async (req, res, next) => {
    try {
        const { search, type } = req.query;

        let query = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        if (type) {
            query.type = type;
        }

        const contacts = await Contact.find(query)
            .sort({ name: 1 })
            .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
const getContact = async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id).populate(
            'createdBy',
            'name'
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create contact
// @route   POST /api/contacts
const createContact = async (req, res, next) => {
    try {
        req.body.createdBy = req.user._id;

        const contact = await Contact.create(req.body);

        res.status(201).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
const updateContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete contact (soft delete)
// @route   DELETE /api/contacts/:id
const deleteContact = async (req, res, next) => {
    try {
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
};