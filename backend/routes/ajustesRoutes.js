import { Router } from 'express';
import * as ajustesController from '../controllers/ajustesController.js';
import checkModuleAccess from '../middlewares/checkModuleAccess.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.get('/', auth, checkModuleAccess, ajustesController.getAjustes);
router.post('/', auth, checkModuleAccess, ajustesController.createAjuste);

export default router;
