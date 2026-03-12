import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', userController.getAllUsers);
router.patch('/:id/approve', userController.approveUser);
router.patch('/:id/reject', userController.rejectUser);
router.patch('/:id', userController.updateUser);
router.patch('/:id/password', userController.changePassword);
router.delete('/:id', userController.deleteUser);

export default router;
