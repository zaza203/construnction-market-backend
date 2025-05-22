import express from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { upload, handleUploadErrors } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', listCategories);
router.post('/', authenticateToken, upload.single('image'), handleUploadErrors, createCategory);
router.put('/:id', authenticateToken, upload.single('image'), handleUploadErrors, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;
