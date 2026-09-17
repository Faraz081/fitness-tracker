import { Router } from 'express';
import { getAnalyticsHandler } from '../controllers/analytics.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateQuery } from '../middleware/validate.js';
import { analyticsQuerySchema } from '../utils/validators.js';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.get('/', validateQuery(analyticsQuerySchema), getAnalyticsHandler);