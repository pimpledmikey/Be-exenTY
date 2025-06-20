import { Router } from 'express';
import { updateUserTheme, createUser, createGroup, getUsuarios, getGrupos, updateGroup, deleteGroup, updateUser, deleteUser, getUsuariosSimple } from '../controllers/userController.js';
import onlyAdmin from '../middlewares/onlyAdmin.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.post('/theme', updateUserTheme);
router.post('/create', auth, onlyAdmin, createUser);
router.post('/grupo', auth, onlyAdmin, createGroup);
router.post('/grupos', auth, onlyAdmin, createGroup);
router.put('/grupos/:id', auth, onlyAdmin, updateGroup);
router.delete('/grupos/:id', auth, onlyAdmin, deleteGroup);

router.get('/usuarios', auth, onlyAdmin, getUsuarios);
router.get('/grupos', auth, onlyAdmin, getGrupos);
router.put('/usuarios/:id', auth, onlyAdmin, updateUser);
router.delete('/usuarios/:id', auth, onlyAdmin, deleteUser);
router.get('/usuarios-simple', getUsuariosSimple);

export default router;
