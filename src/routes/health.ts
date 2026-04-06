import { Router } from 'express';
import { healthCheck, readiness } from '../controllers/health';

const router = Router();

router.get('/health', healthCheck);
router.get('/ready', readiness);

export default router;
