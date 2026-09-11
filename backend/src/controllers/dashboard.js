import { getDashboardData } from '../services/dashboardService.js';
import { success } from '../utils/response.js';

export async function getDashboardHandler(req, res, next) {
    try {
        const data = await getDashboardData(req.userId ?? '');
        success(res, data);
    } catch (err) {
        next(err);
    }
}
