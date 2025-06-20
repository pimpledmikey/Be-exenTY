import { Router } from 'express';
import * as almacenController from '../controllers/almacenController.js';
import checkModuleAccess from '../middlewares/checkModuleAccess.js';
import auth from '../middlewares/auth.js';

const router = Router();

router.get('/articulos', auth, checkModuleAccess, almacenController.getArticulos);
router.post('/articulos', auth, checkModuleAccess, almacenController.createArticulo);
router.put('/articulos/:id', auth, checkModuleAccess, almacenController.updateArticulo);
router.delete('/articulos/:id', auth, checkModuleAccess, almacenController.deleteArticulo);
router.get('/entradas', auth, checkModuleAccess, almacenController.getEntradas);
router.post('/entradas', auth, checkModuleAccess, almacenController.createEntrada);
router.get('/salidas', auth, checkModuleAccess, almacenController.getSalidas);
router.post('/salidas', auth, checkModuleAccess, almacenController.createSalida);
router.get('/stock', auth, checkModuleAccess, almacenController.getStock);
router.get('/articulos-simple', auth, checkModuleAccess, almacenController.getArticulosSimple);

export default router;

