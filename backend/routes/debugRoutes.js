import express from 'express';
import { debugStockArticle24, limpiarStockArticle24, verificarVistaStock, corregirVistaStock } from '../controllers/debugController.js';

const router = express.Router();

// Rutas temporales para debug
router.get('/stock-article24', debugStockArticle24);
router.post('/limpiar-stock24', limpiarStockArticle24);
router.get('/verificar-vista', verificarVistaStock);
router.post('/corregir-vista', corregirVistaStock);

export default router;
