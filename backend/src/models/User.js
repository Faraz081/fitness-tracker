import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/index.js';
const userSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    bio: { type: String, trim: true, maxlength: 500 },
    age: { type: Number, min: 13, max: 120 },
    weightKg: { type: Number, min: 20, max: 400 },
    heightCm: { type: Number, min: 60, max: 280 },
    goal: { type: String, enum: ['lose', 'maintain', 'gain', 'other'] },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    avatarUrl: { type: String, trim: true, maxlength: 500, default: null },
    preferences: {
        units: { type: String, enum: ['kg', 'lb'], default: 'kg' },
        theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    },
});
userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});
export const User = model('User', userSchema);
