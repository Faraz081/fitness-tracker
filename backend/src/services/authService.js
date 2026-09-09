import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { Notification } from '../models/Notification.js';
import { NotificationSettings } from '../models/NotificationSettings.js';
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
export async function changePassword(userId, input) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }
    const validCurrent = await bcrypt.compare(input.currentPassword, user.password);
    if (!validCurrent) {
        throw new AppError(401, 'Invalid current password', 'INVALID_PASSWORD');
    }
    const sameAsCurrent = await bcrypt.compare(input.newPassword, user.password);
    if (sameAsCurrent) {
        throw new AppError(400, 'New password must be different from the current password', 'VALIDATION_ERROR');
    }
    user.password = input.newPassword;
    await user.save();
    return toSanitizedUser(user);
}
export async function deleteAccount(userId, email) {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }
    if (email !== user.email) {
        throw new AppError(403, 'Confirmation email does not match your account', 'CONFIRMATION_MISMATCH');
    }
    await Notification.deleteMany({ owner: userId });
    await NotificationSettings.deleteMany({ owner: userId });
    await Workout.deleteMany({ owner: userId });
    await Nutrition.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);
    return toSanitizedUser(user);
}
