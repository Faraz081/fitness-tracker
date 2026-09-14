import { Router } from 'express';
import {
    getProgressHandler,
    addWeightHandler,
    updateWeightHandler,
    deleteWeightHandler,
    addMeasurementHandler,
    updateMeasurementHandler,
    deleteMeasurementHandler,
} from '../controllers/progress.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
    weightCreateSchema,
    weightUpdateSchema,
    measurementCreateSchema,
    measurementUpdateSchema,
} from '../utils/validators.js';

export const progressRouter = Router();
progressRouter.use(authenticate);
progressRouter.get('/', getProgressHandler);
progressRouter.post('/weight', validate(weightCreateSchema), addWeightHandler);
progressRouter.patch('/weight/:id', validate(weightUpdateSchema), updateWeightHandler);
progressRouter.delete('/weight/:id', deleteWeightHandler);
progressRouter.post('/measurements', validate(measurementCreateSchema), addMeasurementHandler);
progressRouter.patch('/measurements/:id', validate(measurementUpdateSchema), updateMeasurementHandler);
progressRouter.delete('/measurements/:id', deleteMeasurementHandler);