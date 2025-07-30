import express from 'express';
import * as catalogosController from '../controllers/catalogosController.js';

const router = express.Router();

// --- Grupos ---
router.get('/grupos', catalogosController.getGrupos);
router.post('/grupos', catalogosController.createGrupo);
router.put('/grupos/:id', catalogosController.updateGrupo);
router.delete('/grupos/:id', catalogosController.deleteGrupo);

// --- Medidas ---
router.get('/medidas', catalogosController.getMedidas);
router.post('/medidas', catalogosController.createMedida);
router.put('/medidas/:id', catalogosController.updateMedida);
router.delete('/medidas/:id', catalogosController.deleteMedida);

// --- Unidades ---
router.get('/unidades', catalogosController.getUnidades);
router.post('/unidades', catalogosController.createUnidad);
router.put('/unidades/:id', catalogosController.updateUnidad);
router.delete('/unidades/:id', catalogosController.deleteUnidad);

export default router;


