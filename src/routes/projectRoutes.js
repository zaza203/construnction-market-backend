import express from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { upload, handleUploadErrors } from '../middlewares/uploadProjects.js'

const router = express.Router({ mergeParams: true });

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', authenticateToken, upload.single('image'), handleUploadErrors, createProject);
router.put('/:id', authenticateToken, upload.single('image'), handleUploadErrors, updateProject);
router.delete('/:id', authenticateToken, deleteProject);

export default router;
