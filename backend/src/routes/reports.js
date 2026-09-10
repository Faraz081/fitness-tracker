import { Router } from 'express';
import {
    getOverviewHandler,
    getWorkoutHandler,
    getNutritionHandler,
    getProgressHandler,
} from '../controllers/reports.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateQuery } from '../middleware/validate.js';
import { reportQuerySchema, reportTypeSchema } from '../utils/validators.js';

export const reportsRouter = Router();
reportsRouter.use(authenticate);

const handlerMap = {
    overview: getOverviewHandler,
    workout: getWorkoutHandler,
    nutrition: getNutritionHandler,
    progress: getProgressHandler,
};

reportsRouter.get('/:type', (req, res, next) => {
    const typeResult = reportTypeSchema.safeParse(req.params.type);
    if (!typeResult.success) {
        return res.status(400).json({ success: false, error: { message: 'Invalid report type', code: 'VALIDATION_ERROR' } });
    }
    req.params.type = typeResult.data;
    next();
}, validateQuery(reportQuerySchema), (req, res, next) => {
    const handler = handlerMap[req.params.type];
    if (!handler) {
        return res.status(400).json({ success: false, error: { message: 'Invalid report type', code: 'VALIDATION_ERROR' } });
    }
    handler(req, res, next);
});
