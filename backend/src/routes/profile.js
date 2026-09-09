import { Router } from 'express';
import {
    getPreferencesHandler,
    getProfileHandler,
    updatePreferencesHandler,
    updateProfileHandler,
} from '../controllers/profile.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { preferencesPatchSchema, profileUpdateSchema } from '../utils/validators.js';
export const profileRouter = Router();
profileRouter.use(authenticate);
profileRouter.get('/', getProfileHandler);
profileRouter.patch('/', validate(profileUpdateSchema), updateProfileHandler);
profileRouter.get('/preferences', getPreferencesHandler);
profileRouter.patch('/preferences', validate(preferencesPatchSchema), updatePreferencesHandler);
