import { Router } from 'express';
import { 
  getSolicitudes, 
  createSolicitud, 
  getSolicitudById, 
  getSolicitudByFolio, 
  updateSolicitudStatus 
} from '../controllers/solicitudesController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas de solicitudes
router.get('/', verifyAuth, getSolicitudes);
router.post('/', verifyAuth, createSolicitud);
router.get('/:id', verifyAuth, getSolicitudById);
router.get('/folio/:folio', verifyAuth, getSolicitudByFolio);
router.put('/:id/status', verifyAuth, updateSolicitudStatus);

export default router;