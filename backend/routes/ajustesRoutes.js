import { Router } from 'express';
import * as ajustesController from '../controllers/ajustesController.js';
import { verifyAuth, checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyAuth, checkPermission('administracion', 'view'), ajustesController.getAjustes);
router.post('/', verifyAuth, checkPermission('administracion', 'create'), ajustesController.createAjuste);

export default router;
