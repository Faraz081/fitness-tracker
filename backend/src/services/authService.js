import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/apiError.js';
const toSanitizedUser = (user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
});
export async function register(input) {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
        throw new AppError(409, 'Email already registered', 'DUPLICATE_EMAIL');
    }
    const user = await User.create({
        name: input.name,
        email: input.email,
        password: input.password,
    });
    return toSanitizedUser(user);
}
export async function login(input) {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
        throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
        throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    return toSanitizedUser(user);
}
export async function getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }
    return toSanitizedUser(user);
}
