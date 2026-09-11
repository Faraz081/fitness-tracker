import { Router } from 'express';
import { getDashboardHandler } from '../controllers/dashboard.js';
import { authenticate } from '../middleware/authenticate.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/', getDashboardHandler);
