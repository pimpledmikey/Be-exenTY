import express from 'express';
import { 
  getRolesWithPermissions, 
  getAvailableModules, 
  updateRolePermissions, 
  createRole,
  getUserPermissions 
} from '../controllers/roleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener roles con permisos
router.get('/roles', getRolesWithPermissions);

// Obtener módulos disponibles
router.get('/modules', getAvailableModules);

// Obtener permisos del usuario actual
router.get('/my-permissions', getUserPermissions);

// Actualizar permisos de un rol
router.put('/roles/:roleId/permissions', updateRolePermissions);

// Crear nuevo rol
router.post('/roles', createRole);

export default router;
