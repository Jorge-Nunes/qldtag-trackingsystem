import { Router } from 'express';
import configController from '../controllers/configController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/system', configController.getSystemInfo);
router.get('/traccar', configController.getTraccarConfig);
router.put('/traccar', configController.saveTraccarConfig);
router.post('/traccar/test', configController.testTraccarConnection);
router.post('/traccar/sync', configController.syncTraccar);
router.get('/api', configController.getApiConfig);
router.put('/api', configController.saveApiConfig);
router.post('/sync/trigger', configController.triggerSync);
router.post('/sync/device/:deviceId', configController.syncDevicePositions);

export default router;
