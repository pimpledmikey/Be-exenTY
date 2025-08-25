import { Router } from 'express';
import { generarPdfSolicitudSimple, validarSolicitudParaPdf } from '../controllers/pdfControllerJsPDF.js';

const router = Router();

router.get('/ping', (req, res) => {
  res.json({ status: 'OK', message: 'PDF service is running with jsPDF' });
});

// Ruta para validar solicitud antes de generar PDF
router.post('/validar-solicitud', validarSolicitudParaPdf);

// Ruta para generar PDF (ahora registra salidas automáticamente)
router.post('/solicitud', generarPdfSolicitudSimple);

export default router;
