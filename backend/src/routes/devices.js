import { Router } from 'express';
import deviceController from '../controllers/deviceController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', deviceController.getAll);
router.get('/stats', deviceController.getStats);
router.get('/:id', deviceController.getById);
router.post('/', deviceController.create);
router.put('/:id', deviceController.update);
router.delete('/:id', deviceController.delete);
router.post('/:id/link', deviceController.link);
router.post('/:id/unlink', deviceController.unlink);

export default router;
