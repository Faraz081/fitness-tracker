import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { profileRouter } from './routes/profile.js';
import { workoutRouter } from './routes/workout.js';
import { nutritionRouter } from './routes/nutrition.js';
import { notificationRouter } from './routes/notification.js';
import { reportsRouter } from './routes/reports.js';
import { dashboardRouter } from './routes/dashboard.js';
import { progressRouter } from './routes/progress.js';
import { goalRouter } from './routes/goal.js';
import { analyticsRouter } from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';
import { CLIENT_ORIGIN } from './config/index.js';
export function createApp() {
    const app = express();
    app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/auth', authRouter);
    app.use('/api/users/me', profileRouter);
    app.use('/api/workouts', workoutRouter);
    app.use('/api/nutrition', nutritionRouter);
    app.use('/api/notifications', notificationRouter);
    app.use('/api/reports', reportsRouter);
    app.use('/api/dashboard', dashboardRouter);
    app.use('/api/progress', progressRouter);
    app.use('/api/goals', goalRouter);
    app.use('/api/analytics', analyticsRouter);
    app.use((_req, res) => {
        res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
    });
    app.use(errorHandler);
    return app;
}
