import { User } from '../models/User.js';
import { AppError } from '../utils/apiError.js';
const toProfile = (user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    bio: user.bio ?? null,
    age: user.age ?? null,
    weightKg: user.weightKg ?? null,
    heightCm: user.heightCm ?? null,
    goal: user.goal ?? null,
    fitnessLevel: user.fitnessLevel ?? null,
    avatarUrl: user.avatarUrl ?? null,
});
export async function getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }
    return toProfile(user);
}
export async function updateProfile(userId, patch) {
    const user = await User.findByIdAndUpdate(userId, { $set: patch }, { new: true, runValidators: true });
    if (!user) {
        throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
    }
    return toProfile(user);
}
