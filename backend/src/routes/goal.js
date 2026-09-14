import { Router } from 'express';
import {
    getGoalsHandler,
    createGoalHandler,
    updateGoalHandler,
    deleteGoalHandler,
    addHydrationHandler,
    deleteHydrationHandler,
} from '../controllers/goal.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { goalCreateSchema, goalUpdateSchema, hydrationCreateSchema } from '../utils/validators.js';

export const goalRouter = Router();
goalRouter.use(authenticate);
goalRouter.get('/', getGoalsHandler);
goalRouter.post('/', validate(goalCreateSchema), createGoalHandler);
goalRouter.patch('/:id', validate(goalUpdateSchema), updateGoalHandler);
goalRouter.delete('/:id', deleteGoalHandler);
goalRouter.post('/hydration', validate(hydrationCreateSchema), addHydrationHandler);
goalRouter.delete('/hydration/:id', deleteHydrationHandler);