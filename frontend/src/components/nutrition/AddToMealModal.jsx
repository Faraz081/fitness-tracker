import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button, Input, Modal, Select } from '../ui';
import { MEAL_META, MEAL_ORDER } from './MealTabs';

const NUTRIENTS = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'sugar', label: 'Sugar', unit: 'g' },
    { key: 'sodium', label: 'Sodium', unit: 'g' },
];

function formatValue(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '—';
    }
    if (value === 0) {
        return '0';
    }
    if (value < 0.01) {
        return value.toFixed(3);
    }
    if (value < 1) {
        return value.toFixed(2);
    }
    if (value < 100) {
        return value.toFixed(1);
    }
    return String(Math.round(value));
}

export function AddToMealModal({ estimate, defaultMealType, onClose, onAdd }) {
    const isOpen = estimate != null;
    const [mealType, setMealType] = useState(defaultMealType);
    const [quantityValue, setQuantityValue] = useState('100');
    const [quantityError, setQuantityError] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setMealType(defaultMealType);
        setQuantityValue(estimate?.quantity != null ? String(estimate.quantity) : '100');
        setQuantityError(null);
        setSubmitError(null);
        setSubmitting(false);
    }, [isOpen, estimate, defaultMealType]);

    const baseQuantity =
        estimate && Number.isFinite(estimate.quantity) && estimate.quantity > 0 ? estimate.quantity : 1;

    const numericQuantity = Number(quantityValue);
    const validQuantity = Number.isFinite(numericQuantity) && numericQuantity >= 0.01 && numericQuantity <= 1000;
    const scale = validQuantity ? numericQuantity / baseQuantity : 1;

    const scaledValue = (value) => (typeof value === 'number' ? value * scale : undefined);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!estimate) return;
        if (!validQuantity) {
            setQuantityError('Enter a quantity between 0.01 and 1000');
            return;
        }
        const roundHalfUp = (value) => (typeof value === 'number' ? Math.round(value * 10) / 10 : value);
        setSubmitting(true);
        setSubmitError(null);
        const baseServing = Number.isFinite(estimate.quantity) && estimate.quantity > 0
            ? estimate.quantity
            : 1;
        const applyScale = (value) => roundHalfUp((value / baseServing) * numericQuantity);
        try {
            await onAdd({
                foodName: estimate.foodName,
                quantity: numericQuantity,
                unit: 'g',
                calories: applyScale(estimate.calories),
                protein: applyScale(estimate.protein),
                carbs: applyScale(estimate.carbs),
                fat: applyScale(estimate.fat),
                mealType,
            });
        }
        catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to add food. Please try again.');
            setSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Food">
            {estimate && (
                <form onSubmit={handleSubmit} noValidate>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold">{estimate.foodName}</h3>
                        <Badge color="primary">AI</Badge>
                    </div>
                    {Number.isFinite(estimate.quantity) && estimate.quantity > 0 && (
                        <p className="text-xs text-text-muted mb-4">
                            Nutrition per {estimate.quantity}
                            {estimate.unit ?? ''} serving
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] p-4 mb-5">
                        {NUTRIENTS.map(({ key, label, unit }) => (
                            <div key={key} className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-sm text-text-secondary">{label}</span>
                                <span className="text-sm font-semibold text-text-primary tabular-nums truncate">
                                    {formatValue(scaledValue(estimate[key]))}{' '}
                                    <span className="text-xs font-normal text-text-muted">{unit}</span>
                                </span>
                            </div>
                        ))}
                    </div>

                    <Input
                        id="ai-add-quantity"
                        label="Quantity (g)"
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        max="1000"
                        step="0.1"
                        value={quantityValue}
                        onChange={(e) => {
                            setQuantityValue(e.target.value);
                            setQuantityError(null);
                        }}
                        error={quantityError}
                    />
                    <p className="text-xs text-text-muted -mt-3 mb-4">
                        Nutrition values update automatically as you change the quantity.
                    </p>

                    <Select
                        id="ai-add-meal"
                        label="Add To"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                    >
                        {MEAL_ORDER.map((key) => (
                            <option key={key} value={key}>
                                {MEAL_META[key].label}
                            </option>
                        ))}
                    </Select>

                    {submitError && (
                        <p className="text-sm text-error mb-4" role="alert">
                            {submitError}
                        </p>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                        <Button variant="ghost" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={submitting}
                            icon={<Plus className="h-4 w-4" />}
                        >
                            Add Food
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}