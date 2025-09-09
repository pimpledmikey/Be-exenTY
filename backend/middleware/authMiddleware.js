import jwt from 'jsonwebtoken';
import pool from '../db.js';

// Middleware para verificar autenticación
export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beexenty_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar permisos específicos
export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      console.log('🔍 checkPermission - req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('🔍 checkPermission - Módulo:', module, 'Acción:', action);
      
      const userId = req.user.user?.user_id || req.user.user_id;
      
      if (!userId) {
        console.error('❌ checkPermission - user_id no encontrado. Estructura req.user:', req.user);
        return res.status(403).json({
          success: false,
          message: 'Usuario no válido'
        });
      }
      
      console.log('🔍 checkPermission - userId extraído:', userId);
      
      // Obtener permisos del usuario
      const [userPermissions] = await pool.execute(`
        SELECT 
          p.name as permission_name,
          p.module,
          rp.can_view,
          rp.can_create,
          rp.can_edit,
          rp.can_delete
        FROM users u
        JOIN roles r ON u.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.user_id = ? AND p.module = ?
      `, [userId, module]);

      console.log('🔍 checkPermission - Permisos encontrados:', userPermissions);

      if (userPermissions.length === 0) {
        console.log('❌ checkPermission - Sin permisos para módulo:', module);
        return res.status(403).json({
          success: false,
          message: `No tienes acceso al módulo ${module}`
        });
      }

      // Verificar el permiso específico
      const hasPermission = userPermissions.some(permission => {
        switch (action) {
          case 'view':
            return permission.can_view;
          case 'create':
            return permission.can_create;
          case 'edit':
            return permission.can_edit;
          case 'delete':
            return permission.can_delete;
          default:
            return false;
        }
      });

      console.log('🔍 checkPermission - Tiene permiso:', hasPermission);

      if (!hasPermission) {
        console.log('❌ checkPermission - Sin permiso para acción:', action);
        return res.status(403).json({
          success: false,
          message: `No tienes permisos para ${action} en ${module}`
        });
      }

      console.log('✅ checkPermission - Permiso concedido');
      next();
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middleware para verificar si es administrador
export const checkAdmin = async (req, res, next) => {
  try {
    console.log('🔍 checkAdmin - req.user completo:', JSON.stringify(req.user, null, 2));
    const userId = req.user.user?.user_id || req.user.user_id;
    
    if (!userId) {
      console.error('❌ checkAdmin - user_id no encontrado. Estructura req.user:', req.user);
      return res.status(403).json({
        success: false,
        message: 'Usuario no válido'
      });
    }
    
    console.log('🔍 checkAdmin - Buscando rol para user_id:', userId);
    
    const [userRole] = await pool.execute(`
      SELECT r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.user_id = ?
    `, [userId]);

    console.log('🔍 checkAdmin - Resultado consulta:', userRole);

    if (userRole.length === 0 || userRole[0].role_name !== 'Administrador') {
      console.log('❌ checkAdmin - No es administrador:', userRole[0]?.role_name || 'Sin rol');
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
    }

    console.log('✅ checkAdmin - Es administrador');
    next();
  } catch (error) {
    console.error('❌ Error verificando rol de administrador:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función helper para obtener permisos del usuario
export const getUserPermissions = async (userId) => {
  try {
    const [permissions] = await pool.execute(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.module,
        rp.can_view,
        rp.can_create,
        rp.can_edit,
        rp.can_delete
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
      ORDER BY p.module, p.name
    `, [userId]);

    return permissions;
  } catch (error) {
    console.error('Error obteniendo permisos del usuario:', error);
    return [];
  }
};
