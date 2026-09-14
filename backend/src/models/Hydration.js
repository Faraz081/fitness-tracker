import { Schema, model } from 'mongoose';
const hydrationSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    amountMl: { type: Number, required: true, min: 50, max: 5000, default: 250 },
    note: { type: String, trim: true, maxlength: 200 },
}, { timestamps: true });
hydrationSchema.index({ owner: 1, date: -1 });
export const Hydration = model('Hydration', hydrationSchema);