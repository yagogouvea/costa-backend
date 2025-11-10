import { Router } from 'express';
import { prestadorLogin } from '../controllers/prestadorAuthController';

const router = Router();

router.post('/login', prestadorLogin);

export default router;

