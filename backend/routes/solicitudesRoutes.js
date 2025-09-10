import { Router } from 'express';
import pool from '../db.js';
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
router.get('/:id/items', verifyAuth, checkPermission('solicitudes', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Obteniendo items para solicitud ID:', id);
    
    const [items] = await pool.query(`
      SELECT si.*, 
             a.name as article_name, 
             a.code as article_code,
             COALESCE(stock.stock, 0) as stock_actual
      FROM solicitudes_items si
      LEFT JOIN articles a ON si.article_id = a.article_id
      LEFT JOIN inventory_stock stock ON si.article_id = stock.article_id
      WHERE si.solicitud_id = ?
      ORDER BY a.name
    `, [id]);
    
    console.log(`📋 Items encontrados: ${items.length}`);
    res.json({ success: true, items });
  } catch (error) {
    console.error('❌ Error obteniendo items:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
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