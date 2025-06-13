import express from 'express';
import {
  logActivity
} from '../controllers/activityLogController.js';

const router = express.Router();

router.post('/', logActivity);

export default router;
