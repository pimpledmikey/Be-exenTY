import express from 'express';
import { changePassword } from '../controllers/seguridadController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.put('/password', auth, changePassword);

export default router;
