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

const router = Router();

// Rutas básicas de solicitudes
router.get('/', verifyAuth, getSolicitudes);
router.post('/', verifyAuth, createSolicitud);
router.get('/:id', verifyAuth, getSolicitudById);
router.get('/folio/:folio', verifyAuth, getSolicitudByFolio);
router.put('/:id/status', verifyAuth, updateSolicitudStatus);

// Rutas específicas para autorización (usando solo verifyAuth como las demás vistas)
router.get('/pendientes', verifyAuth, getSolicitudesPendientes);
router.get('/:id/detalle', verifyAuth, getSolicitudDetalleAutorizacion);
router.put('/:id/autorizar', verifyAuth, autorizarSolicitud);

// Rutas para dashboard (usando solo verifyAuth como las demás vistas)
router.get('/dashboard/stats', verifyAuth, getDashboardStats);
router.get('/dashboard/recientes', verifyAuth, getDashboardSolicitudesRecientes);

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