import { Router } from 'express';
import {
  getUsersWithRoles,
  getRoles,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  getUserPermissions,
  migrateUserToRBAC
} from '../controllers/roleController.js';
import { verifyAuth, checkAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas protegidas que requieren autenticación de administrador
router.get('/users', verifyAuth, checkAdmin, getUsersWithRoles);
router.get('/', verifyAuth, checkAdmin, getRoles);
router.get('/permissions', verifyAuth, checkAdmin, getPermissions);
router.get('/:roleId/permissions', verifyAuth, checkAdmin, getRolePermissions);
router.put('/permissions', verifyAuth, checkAdmin, updateRolePermissions);

// Rutas para gestión de usuarios individuales
router.get('/users/:userId/permissions', verifyAuth, getUserPermissions);
router.post('/users/:userId/migrate', verifyAuth, checkAdmin, migrateUserToRBAC);

export default router;
