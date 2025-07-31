import express from 'express';
import { changePassword } from '../controllers/seguridadController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/password', verifyAuth, changePassword);

export default router;
