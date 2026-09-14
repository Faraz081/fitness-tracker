import { Schema, model } from 'mongoose';

const milestoneSchema = new Schema({
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    threshold: { type: Number, required: true, min: 0, max: 100 },
    reachedAt: { type: String },
}, { _id: false });

const goalSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
        type: String,
        required: true,
        enum: ['strength', 'weight', 'endurance', 'habit'],
    },
    targetValue: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 20, default: 'kg' },
    startDate: { type: String },
    targetDate: { type: String },
    completedAt: { type: String },
    milestones: { type: [milestoneSchema], default: [] },
}, { timestamps: true });
goalSchema.index({ owner: 1, createdAt: -1 });
export const Goal = model('Goal', goalSchema);