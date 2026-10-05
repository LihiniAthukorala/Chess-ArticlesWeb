const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', authMiddleware, requireAdmin, createCategory);
router.put('/:id', authMiddleware, requireAdmin, updateCategory);
router.delete('/:id', authMiddleware, requireAdmin, deleteCategory);

module.exports = router;
