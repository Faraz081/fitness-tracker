import { Router } from 'express';
import { getProfileHandler, updateProfileHandler } from '../controllers/profile.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { profileUpdateSchema } from '../utils/validators.js';
export const profileRouter = Router();
profileRouter.use(authenticate);
profileRouter.get('/', getProfileHandler);
profileRouter.patch('/', validate(profileUpdateSchema), updateProfileHandler);
