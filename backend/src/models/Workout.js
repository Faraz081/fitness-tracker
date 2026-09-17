import { Schema, model } from 'mongoose';
const exerciseSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    sets: { type: Number, required: true, min: 1, max: 50 },
    reps: { type: Number, required: true, min: 1, max: 500 },
    weightKg: { type: Number, min: 0 },
    notes: { type: String, trim: true, maxlength: 500 },
    restTimeSec: { type: Number, min: 0, max: 600 },
}, { _id: false });
const workoutSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    category: {
        type: String,
        required: true,
        enum: ['strength', 'cardio', 'flexibility', 'hybrid', 'other'],
    },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 2000 },
    exercises: { type: [exerciseSchema], default: [] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { timestamps: true });
export const Workout = model('Workout', workoutSchema);
