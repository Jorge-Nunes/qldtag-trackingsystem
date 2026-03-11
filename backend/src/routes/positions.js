import { Router } from 'express';
import positionController from '../controllers/positionController.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.use(optionalAuth);

router.get('/', positionController.getAll);
router.get('/latest', positionController.getLatest);
router.get('/device/:deviceId', positionController.getByDevice);
router.get('/history', positionController.getHistory);
router.get('/:id', positionController.getById);
router.post('/', positionController.create);

export default router;
