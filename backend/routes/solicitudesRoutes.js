import { Router } from 'express';
import * as solicitudesController from '../controllers/solicitudesController.js';
import { verifyAuth, checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas de solicitudes
router.get('/', verifyAuth, checkPermission('solicitudes', 'view'), solicitudesController.getSolicitudes);
router.post('/', verifyAuth, checkPermission('solicitudes', 'create'), solicitudesController.createSolicitud);
router.get('/:id', verifyAuth, checkPermission('solicitudes', 'view'), solicitudesController.getSolicitudById);
router.get('/folio/:folio', verifyAuth, checkPermission('solicitudes', 'view'), solicitudesController.getSolicitudByFolio);

export default router;