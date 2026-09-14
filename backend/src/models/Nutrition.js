import { Schema, model } from 'mongoose';
const nutritionSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodName: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: { type: Number, default: 1, min: 0.01, max: 1000 },
    unit: { type: String, trim: true, maxlength: 20 },
    calories: { type: Number, required: true, min: 0, max: 2000 },
    protein: { type: Number, default: 0, min: 0, max: 500 },
    carbs: { type: Number, default: 0, min: 0, max: 500 },
    fat: { type: Number, default: 0, min: 0, max: 500 },
    mealType: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    source: {
        type: String,
        enum: ['ai', 'manual'],
        default: 'manual',
    },
    date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });
nutritionSchema.index({ owner: 1, date: 1, mealType: 1 });
export const Nutrition = model('Nutrition', nutritionSchema);
