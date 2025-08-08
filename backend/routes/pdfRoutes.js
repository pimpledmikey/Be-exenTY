import { Router } from 'express';
import { generarPdfSolicitud, pingPdf } from '../controllers/pdfController.js';

const router = Router();

router.get('/ping', pingPdf);
router.post('/solicitud', generarPdfSolicitud);

export default router;
