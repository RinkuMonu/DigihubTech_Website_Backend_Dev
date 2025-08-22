import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controller/Category.controller.js';
import { isAdmin } from '../middleware/isAdmin.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();

router.post('/',upload.array('image', 5), isAdmin, createCategory);
router.get('/', getCategories);
router.get('/:id', isAdmin, getCategoryById);
router.put('/:id', isAdmin, updateCategory);
// Route to delete a category by ID
router.delete('/:id', isAdmin, deleteCategory);

export default router;
