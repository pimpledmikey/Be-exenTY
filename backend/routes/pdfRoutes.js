import { Router } from 'express';
import { generarPdfSolicitudSimple, validarSolicitudParaPdf, generarPdfSolicitudFromId } from '../controllers/pdfControllerJsPDF.js';
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
router.get('/solicitud/:id', verifyAuth, generarPdfSolicitudFromId);

export default router;
