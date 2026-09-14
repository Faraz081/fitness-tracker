import { Schema, model } from 'mongoose';
const measurementSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    chestCm: { type: Number, min: 0, max: 300 },
    waistCm: { type: Number, min: 0, max: 300 },
    armsCm: { type: Number, min: 0, max: 200 },
    hipsCm: { type: Number, min: 0, max: 300 },
    thighsCm: { type: Number, min: 0, max: 200 },
}, { timestamps: true });
measurementSchema.index({ owner: 1, date: -1 });
export const Measurement = model('Measurement', measurementSchema);