import { Router } from 'express';
import { generarPdfSolicitudSimple } from '../controllers/pdfControllerJsPDF.js';

const router = Router();

router.get('/ping', (req, res) => {
  res.json({ status: 'OK', message: 'PDF service is running with jsPDF' });
});

router.post('/solicitud', generarPdfSolicitudSimple);

export default router;
