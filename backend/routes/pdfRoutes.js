import { Router } from 'express';
import { generarPdfSolicitudSimple, validarSolicitudParaPdf } from '../controllers/pdfControllerJsPDF.js';
// import { generarPdfSolicitudEspecifico } from '../controllers/pdfController.js'; // Temporalmente deshabilitado
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/ping', (req, res) => {
  res.json({ status: 'OK', message: 'PDF service is running with jsPDF' });
});

// Ruta para validar solicitud antes de generar PDF
router.post('/validar-solicitud', validarSolicitudParaPdf);

// Ruta para generar PDF (ahora registra salidas automáticamente)
router.post('/solicitud', generarPdfSolicitudSimple);

// Ruta para generar PDF de solicitud específica (usando jsPDF por ahora)
router.get('/solicitud/:id', verifyAuth, async (req, res) => {
  try {
    // Usar el generador que ya funcionaba
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
