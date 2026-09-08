import jwt from 'jsonwebtoken';
import { JWT_EXPIRES, JWT_SECRET } from '../config/index.js';
const SIGN_OPTIONS = { expiresIn: JWT_EXPIRES };
const { sign: jwtSign, verify: jwtVerify } = jwt;
export function signAuthToken(userId) {
    return jwtSign({ sub: userId }, JWT_SECRET, SIGN_OPTIONS);
}
export function verifyAuthToken(token) {
    return jwtVerify(token, JWT_SECRET);
}
