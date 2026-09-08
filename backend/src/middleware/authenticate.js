import { COOKIE_NAME } from '../config/index.js';
import { verifyAuthToken } from '../utils/jwt.js';
import { fail } from '../utils/response.js';
export function authenticate(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
        fail(res, 401, 'Unauthorized', 'UNAUTHORIZED');
        return;
    }
    try {
        const payload = verifyAuthToken(token);
        if (!payload.sub) {
            fail(res, 401, 'Unauthorized', 'UNAUTHORIZED');
            return;
        }
        req.userId = payload.sub;
        next();
    }
    catch {
        fail(res, 401, 'Unauthorized', 'UNAUTHORIZED');
    }
}
