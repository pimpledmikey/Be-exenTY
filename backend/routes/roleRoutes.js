import express from 'express';
import { 
  getUsersWithRoles, 
  getRoles, 
  getPermissions, 
  getRolePermissions,
  updateUserRole, 
  updateRolePermissions 
} from '../controllers/roleController.js';
import { verifyAuth, checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta de test muy simple
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Role routes funcionando', 
    timestamp: new Date().toISOString(),
    status: 'ok' 
  });
});

// Ruta de debug sin autenticación
router.get('/debug-users', async (req, res) => {
  try {
    console.log('🔧 Debug route - iniciando...');
    const { getUsersWithRoles } = await import('../controllers/roleController.js');
    
    // Crear un objeto mock request/response
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log('🔧 Debug route - respuesta:', data);
        res.json(data);
      },
      status: (code) => ({
        json: (data) => {
          console.log('🔧 Debug route - error:', code, data);
          res.status(code).json(data);
        }
      })
    };
    
    await getUsersWithRoles(mockReq, mockRes);
  } catch (error) {
    console.error('🔧 Debug route - error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rutas protegidas (orden importante: específicas antes que genéricas)
router.get('/users', verifyAuth, checkAdmin, getUsersWithRoles);
router.get('/permissions', verifyAuth, checkAdmin, getPermissions);
router.get('/:roleId/permissions', verifyAuth, checkAdmin, getRolePermissions);
router.get('/', verifyAuth, checkAdmin, getRoles);
router.put('/user/:userId/role', verifyAuth, checkAdmin, updateUserRole);
router.put('/role/:roleId/permissions', verifyAuth, checkAdmin, updateRolePermissions);

export default router;
