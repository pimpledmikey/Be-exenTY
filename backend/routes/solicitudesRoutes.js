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
import { verifyAuth, checkPermission } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas básicas de solicitudes con permisos granulares
router.get('/', verifyAuth, checkPermission('solicitudes', 'view'), getSolicitudes);
router.post('/', verifyAuth, checkPermission('solicitudes', 'create'), createSolicitud);

// Rutas específicas ANTES de las rutas con parámetros
router.get('/pendientes', verifyAuth, checkPermission('solicitudes', 'view'), getSolicitudesPendientes);
router.get('/dashboard/stats', verifyAuth, checkPermission('solicitudes', 'view'), getDashboardStats);
router.get('/dashboard/recientes', verifyAuth, checkPermission('solicitudes', 'view'), getDashboardSolicitudesRecientes);

// Rutas con parámetros (DESPUÉS de las rutas específicas)
router.get('/:id', verifyAuth, checkPermission('solicitudes', 'view'), getSolicitudById);
router.get('/folio/:folio', verifyAuth, checkPermission('solicitudes', 'view'), getSolicitudByFolio);
router.put('/:id/status', verifyAuth, checkPermission('solicitudes', 'edit'), updateSolicitudStatus);
router.get('/:id/detalle', verifyAuth, checkPermission('solicitudes', 'view'), getSolicitudDetalleAutorizacion);
router.put('/:id/autorizar', verifyAuth, checkPermission('solicitudes', 'edit'), autorizarSolicitud);

// Ruta para generar PDF de solicitud
router.get('/:id/pdf', verifyAuth, checkPermission('solicitudes', 'view'), async (req, res) => {
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