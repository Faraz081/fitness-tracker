import { MongoServerError } from 'mongodb';
import { AppError } from '../utils/apiError.js';
import { fail } from '../utils/response.js';
export function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        fail(res, err.statusCode, err.message, err.code);
        return;
    }
    if (err instanceof MongoServerError && err.code === 11000) {
        fail(res, 409, 'Email already registered', 'DUPLICATE_EMAIL');
        return;
    }
    console.error(err);
    fail(res, 500, 'Internal server error', 'INTERNAL_ERROR');
}
