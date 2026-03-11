import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { appConfigController } from '../controllers/appConfigController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `app-logo-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  }
});

// Any user can read the config (needed for login page)
router.get('/', appConfigController.getConfig);

// Only authenticated admins can update config
// For simplicity, we just use authMiddleware. In a real app we might check roles.
router.post('/', authMiddleware, upload.single('appLogo'), appConfigController.updateConfig);

export default router;
