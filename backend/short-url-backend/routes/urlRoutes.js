// routes/urlRoutes.js
import { Router } from 'express';
import { createShortUrl, redirectUrl, getQrCode, getStats } from '../controllers/urlController.js';

const router = Router();

router.post('/shorten', createShortUrl);
router.get('/s/:code', redirectUrl);
router.get('/qrcode/:code', getQrCode);
router.get('/stats/:code', getStats);

export default router;


