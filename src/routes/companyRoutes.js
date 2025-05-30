import express from 'express';
import {
  listCompanies,
  createCompany,
  getCompanyByUsername,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
  incrementCompanyViewCount,
  getCompaniesByCategory,
  getCompanyWithLowestViews,
  getProjectsByCompanyUsername,
  listCompaniesbyLocation
} from '../controllers/companyController.js';
import { listAllProjects } from '../controllers/projectController.js';
import projectRoutes from './projectRoutes.js';
import { upload, handleUploadErrors } from '../middlewares/uploadCompany.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/projects', authenticateToken, listAllProjects)
router.get('/', listCompanies);
router.get('/by_location', listCompaniesbyLocation)
router.get('/:username', getCompanyByUsername);
router.post('/', upload.single('logo'), handleUploadErrors, createCompany);
router.post('/:id/increment-view', incrementCompanyViewCount);
router.get('/category/:categoryId', getCompaniesByCategory);
router.get('/view-count/featured', getCompanyWithLowestViews);
router.get('/:username/projects', getProjectsByCompanyUsername);

router.put('/:id', authenticateToken, upload.single('logo'), handleUploadErrors, updateCompany);
router.patch('/:id/status', authenticateToken, updateCompanyStatus);
router.delete('/:id', authenticateToken, deleteCompany);

router.use('/:companyId/projects', projectRoutes);

export default router;
