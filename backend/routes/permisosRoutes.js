import { Router } from 'express';
import { checkPermisoModulo } from '../controllers/permisosController.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, checkPermisoModulo);

export default router;
