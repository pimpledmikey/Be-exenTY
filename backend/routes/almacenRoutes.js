import { Router } from 'express';
import * as almacenController from '../controllers/almacenController.js';
import { verifyAuth, checkPermission } from '../middleware/authMiddleware.js';
import validarStock from '../middlewares/validarStock.js';

const router = Router();

// Rutas de artículos con permisos granulares
router.get('/articulos', verifyAuth, checkPermission('almacen', 'view'), almacenController.getArticulos);
router.post('/articulos', verifyAuth, checkPermission('almacen', 'create'), almacenController.createArticulo);
router.put('/articulos/:id', verifyAuth, checkPermission('almacen', 'edit'), almacenController.updateArticulo);
router.delete('/articulos/:id', verifyAuth, checkPermission('almacen', 'delete'), almacenController.deleteArticulo);

// Rutas de entradas con permisos granulares
router.get('/entradas', verifyAuth, checkPermission('entradas', 'view'), almacenController.getEntradas);
router.post('/entradas', verifyAuth, checkPermission('entradas', 'create'), almacenController.createEntrada);

// Rutas de salidas con permisos granulares y validación de stock
router.get('/salidas', verifyAuth, checkPermission('salidas', 'view'), almacenController.getSalidas);
router.post('/salidas', verifyAuth, checkPermission('salidas', 'create'), validarStock, almacenController.createSalida);
router.post('/validar-stock', verifyAuth, checkPermission('salidas', 'create'), almacenController.validarStockDisponible);
router.post('/validar-stock-multiple', verifyAuth, checkPermission('salidas', 'create'), almacenController.validarStockMultiple);

// Rutas de consulta (solo requieren permisos de vista)
router.get('/stock', verifyAuth, checkPermission('almacen', 'view'), almacenController.getStock);
router.get('/articulos-simple', verifyAuth, checkPermission('almacen', 'view'), almacenController.getArticulosSimple);
router.get('/articulos-con-stock', verifyAuth, checkPermission('almacen', 'view'), almacenController.getArticulosConStock);
router.get('/catalogos/grupos', verifyAuth, checkPermission('almacen', 'view'), almacenController.getCatalogoGrupos);
router.get('/catalogos/medidas', verifyAuth, checkPermission('almacen', 'view'), almacenController.getCatalogoMedidas);
router.get('/catalogos/unidades', verifyAuth, checkPermission('almacen', 'view'), almacenController.getCatalogoUnidades);

// Nuevas rutas para historial de salidas automáticas
router.get('/historial-salidas-automaticas', verifyAuth, checkPermission('salidas', 'view'), almacenController.getHistorialSalidasAutomaticas);
router.get('/salidas-folio/:folio', verifyAuth, checkPermission('salidas', 'view'), almacenController.getSalidaPorFolio);

export default router;

