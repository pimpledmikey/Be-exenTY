import { Router } from 'express';
import { 
  getSolicitudes, 
  createSolicitud, 
  getSolicitudById, 
  getSolicitudByFolio, 
  updateSolicitudStatus,
  getSolicitudesPendientes,
  getSolicitudDetalleAutorizacion,
  autorizarSolicitud,
  getDashboardStats,
  getDashboardSolicitudesRecientes
} from '../controllers/solicitudesController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import checkAuthorizationAccess, { checkAuthorizationViewAccess } from '../middlewares/checkAuthorizationAccess.js';

const router = Router();

// Rutas básicas de solicitudes
router.get('/', verifyAuth, getSolicitudes);
router.post('/', verifyAuth, createSolicitud);
router.get('/:id', verifyAuth, getSolicitudById);
router.get('/folio/:folio', verifyAuth, getSolicitudByFolio);
router.put('/:id/status', verifyAuth, updateSolicitudStatus);

// Rutas específicas para autorización (con permisos especiales)
router.get('/pendientes', verifyAuth, checkAuthorizationViewAccess, getSolicitudesPendientes);
router.get('/:id/detalle', verifyAuth, checkAuthorizationViewAccess, getSolicitudDetalleAutorizacion);
router.put('/:id/autorizar', verifyAuth, checkAuthorizationAccess, autorizarSolicitud);

// Rutas para dashboard (requieren permisos de visualización)
router.get('/dashboard/stats', verifyAuth, checkAuthorizationViewAccess, getDashboardStats);
router.get('/dashboard/recientes', verifyAuth, checkAuthorizationViewAccess, getDashboardSolicitudesRecientes);

// Ruta para generar PDF de solicitud
router.get('/:id/pdf', verifyAuth, async (req, res) => {
  try {
    // Usar el generador de PDF que ya funcionaba (jsPDF)
    const { generarPdfSolicitudSimple } = await import('../controllers/pdfControllerJsPDF.js');
    return generarPdfSolicitudSimple(req, res);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al generar PDF',
      message: error.message 
    });
  }
});

export default router;