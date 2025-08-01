import { Router } from 'express';
import { loginUser, getUserPermissions, getCurrentUser, updateUserTheme } from '../controllers/loginController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', loginUser);
router.get('/me', verifyAuth, getCurrentUser);
router.get('/me/permissions', verifyAuth, getUserPermissions);
router.put('/me/theme', verifyAuth, updateUserTheme);

export default router;
