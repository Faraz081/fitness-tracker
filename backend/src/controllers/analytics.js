import { getAnalyticsData } from '../services/analyticsService.js';
import { success } from '../utils/response.js';

export async function getAnalyticsHandler(req, res, next) {
    try {
        const q = req.validatedQuery || {};
        const data = await getAnalyticsData(req.userId ?? '', {
            from: q.from,
            to: q.to,
            category: q.category,
        });
        success(res, data);
    } catch (err) {
        next(err);
    }
}