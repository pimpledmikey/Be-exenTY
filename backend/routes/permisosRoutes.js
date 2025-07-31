import { Router } from 'express';
import { checkPermisoModulo } from '../controllers/permisosController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', verifyAuth, checkPermisoModulo);

export default router;
