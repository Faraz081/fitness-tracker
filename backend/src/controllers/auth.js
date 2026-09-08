import * as authService from '../services/authService.js';
import { signAuthToken } from '../utils/jwt.js';
import { success } from '../utils/response.js';
import { COOKIE_NAME, NODE_ENV, jwtExpiryMs } from '../config/index.js';
export async function registerHandler(req, res) {
    const user = await authService.register(req.body);
    success(res, user, 201);
}
export async function loginHandler(req, res) {
    const user = await authService.login(req.body);
    const token = signAuthToken(user.id);
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: NODE_ENV === 'production',
        maxAge: jwtExpiryMs(),
    });
    success(res, { user });
}
export async function meHandler(req, res) {
    const user = await authService.getUserById(req.userId ?? '');
    success(res, user);
}
export async function logoutHandler(_req, res) {
    res.clearCookie(COOKIE_NAME, { sameSite: 'lax' });
    success(res, {});
}
