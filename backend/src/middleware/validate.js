import { AppError } from '../utils/apiError.js';
export function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR'));
            return;
        }
        req.body = result.data;
        next();
    };
}
export function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR'));
            return;
        }
        req.validatedQuery = result.data;
        next();
    };
}
