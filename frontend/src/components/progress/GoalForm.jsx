import { useState } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import { GOAL_CATEGORIES } from '../../data/constants';
import { todayISO } from '../../utils/filterUtils';

const UNIT_OPTIONS = {
    strength: ['kg', 'lb'],
    weight: ['kg', 'lb'],
    endurance: ['km', 'mi', 'min', 'sessions'],
    habit: ['sessions', 'days', 'min'],
};

export function GoalForm({ isOpen, onClose, initialGoal = null, onSubmit, busy = false }) {
    const [title, setTitle] = useState(initialGoal?.title ?? '');
    const [category, setCategory] = useState(initialGoal?.category ?? 'strength');
    const [targetValue, setTargetValue] = useState(initialGoal?.targetValue != null ? String(initialGoal.targetValue) : '');
    const [unit, setUnit] = useState(initialGoal?.unit ?? 'kg');
    const [startDate, setStartDate] = useState(initialGoal?.startDate ?? todayISO());
    const [targetDate, setTargetDate] = useState(initialGoal?.targetDate ?? '');

    const unitOptions = UNIT_OPTIONS[category] ?? UNIT_OPTIONS.strength;
    const parsedTarget = Number.parseFloat(targetValue);
    const valid = title.trim().length > 0 && Number.isFinite(parsedTarget) && parsedTarget > 0;

    function handleCategoryChange(nextCategory) {
        setCategory(nextCategory);
        const nextUnit = UNIT_OPTIONS[nextCategory]?.[0] ?? 'kg';
        setUnit(nextUnit);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!valid || busy) {
            return;
        }
        onSubmit({
            title: title.trim(),
            category,
            targetValue: parsedTarget,
            unit,
            startDate: startDate || todayISO(),
            targetDate: targetDate || undefined,
        });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialGoal ? 'Edit goal' : 'Add a goal'}>
            <form onSubmit={handleSubmit}>
                <Input
                    label="Goal title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={category === 'strength' ? 'e.g. Squat 120 kg' : category === 'weight' ? 'e.g. Reach 78 kg' : category === 'endurance' ? 'e.g. Run 5 km' : 'e.g. 3 workouts per week'}
                />
                <Select label="Category" value={category} onChange={(event) => handleCategoryChange(event.target.value)}>
                    {GOAL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Input
                            label="Target value"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min="0.1"
                            value={targetValue}
                            onChange={(event) => setTargetValue(event.target.value)}
                            placeholder="e.g. 120"
                        />
                    </div>
                    <div>
                        <Select label="Unit" value={unit} onChange={(event) => setUnit(event.target.value)}>
                            {unitOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Input label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                    </div>
                    <div>
                        <Input label="Target date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
                    </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type="submit" isLoading={busy} disabled={!valid}>{initialGoal ? 'Save changes' : 'Add goal'}</Button>
                </div>
            </form>
        </Modal>
    );
}