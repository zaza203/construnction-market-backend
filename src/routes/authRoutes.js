import express from 'express';
import {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  listUsers
} from '../controllers/authController.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, listUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;
