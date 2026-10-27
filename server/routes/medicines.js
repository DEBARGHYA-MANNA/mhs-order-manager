const express = require('express');
const router = express.Router();
const {
    searchMedicines,
    searchCompanies,
    getAllMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
} = require('../controllers/medicineController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.get('/', searchMedicines); // GET /api/medicines?q=para
router.get('/companies', searchCompanies); // GET /api/medicines/companies?q=cip
router.get('/all', getAllMedicines); // GET /api/medicines/all

router.post('/', createMedicine);
router.put('/:id', updateMedicine);
router.delete('/:id', adminOnly, deleteMedicine);

module.exports = router;