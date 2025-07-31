import { Router } from 'express';
import { loginUser, getUserPermissions } from '../controllers/loginController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', loginUser);
router.get('/me/permissions', verifyAuth, getUserPermissions);

export default router;
