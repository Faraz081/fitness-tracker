import { Schema, model } from 'mongoose';
const weightSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    weightKg: { type: Number, required: true, min: 20, max: 400 },
}, { timestamps: true });
weightSchema.index({ owner: 1, date: -1 });
export const BodyWeight = model('BodyWeight', weightSchema);