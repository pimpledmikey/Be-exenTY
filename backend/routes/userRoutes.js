import { Router } from 'express';
import { updateUserTheme, createUser, createGroup, getUsuarios, getGrupos, updateGroup, deleteGroup, updateUser, deleteUser, getUsuariosSimple } from '../controllers/userController.js';
import { verifyAuth, checkAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/theme', updateUserTheme);
router.post('/create', verifyAuth, checkAdmin, createUser);
router.post('/usuarios', verifyAuth, checkAdmin, createUser); // Agregar ruta alternativa
router.post('/grupo', verifyAuth, checkAdmin, createGroup);
router.post('/grupos', verifyAuth, checkAdmin, createGroup);
router.put('/grupos/:id', verifyAuth, checkAdmin, updateGroup);
router.delete('/grupos/:id', verifyAuth, checkAdmin, deleteGroup);

router.get('/usuarios', verifyAuth, checkAdmin, getUsuarios);
router.get('/grupos', verifyAuth, checkAdmin, getGrupos);
router.put('/usuarios/:id', verifyAuth, checkAdmin, updateUser);
router.delete('/usuarios/:id', verifyAuth, checkAdmin, deleteUser);
router.get('/usuarios-simple', getUsuariosSimple);

export default router;
