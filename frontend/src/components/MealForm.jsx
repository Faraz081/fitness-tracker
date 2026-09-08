import { useEffect, useState } from 'react';
import { Apple, Calendar, Save } from 'lucide-react';
import { Button, Input, Select } from './ui';
export const MEAL_TYPES = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];
export function MealForm({ defaultDate, initialEntry, pending = false, onSubmit, onCancel }) {
    const [mealType, setMealType] = useState('breakfast');
    const [foodName, setFoodName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [date, setDate] = useState(defaultDate);
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (!initialEntry) {
            setMealType('breakfast');
            setFoodName('');
            setQuantity('');
            setUnit('');
            setCalories('');
            setProtein('');
            setCarbs('');
            setFat('');
            setDate(defaultDate);
            return;
        }
        setMealType(initialEntry.mealType);
        setFoodName(initialEntry.foodName);
        setQuantity(initialEntry.quantity ? String(initialEntry.quantity) : '');
        setUnit(initialEntry.unit ?? '');
        setCalories(String(initialEntry.calories));
        setProtein(initialEntry.protein ? String(initialEntry.protein) : '');
        setCarbs(initialEntry.carbs ? String(initialEntry.carbs) : '');
        setFat(initialEntry.fat ? String(initialEntry.fat) : '');
        setDate(toDateInput(initialEntry.date) || defaultDate);
    }, [initialEntry, defaultDate]);
    function validate() {
        const next = {};
        if (!foodName.trim()) {
            next.foodName = 'Food name is required';
        }
        else if (foodName.trim().length > 100) {
            next.foodName = 'Food name must be 100 characters or fewer';
        }
        if (calories === '' || Number(calories) < 0 || Number(calories) > 2000) {
            next.calories = 'Calories must be between 0 and 2000';
        }
        if (protein !== '' && (Number(protein) < 0 || Number(protein) > 500)) {
            next.protein = 'Protein must be between 0 and 500';
        }
        if (carbs !== '' && (Number(carbs) < 0 || Number(carbs) > 500)) {
            next.carbs = 'Carbs must be between 0 and 500';
        }
        if (fat !== '' && (Number(fat) < 0 || Number(fat) > 500)) {
            next.fat = 'Fat must be between 0 and 500';
        }
        if (quantity !== '' && (Number(quantity) <= 0 || Number(quantity) > 1000)) {
            next.quantity = 'Quantity must be greater than 0 and at most 1000';
        }
        if (date && Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
            next.form = 'Invalid date';
        }
        return next;
    }
    function handleSubmit(e) {
        e.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0)
            return;
        onSubmit({
            foodName: foodName.trim(),
            quantity: quantity === '' ? undefined : Number(quantity),
            unit: unit.trim() === '' ? undefined : unit.trim(),
            calories: Number(calories),
            protein: protein === '' ? undefined : Number(protein),
            carbs: carbs === '' ? undefined : Number(carbs),
            fat: fat === '' ? undefined : Number(fat),
            mealType,
            date: date === '' ? defaultDate : date,
        });
    }
    return (<form onSubmit={handleSubmit} noValidate className="space-y-1">
      {errors.form && (<div className="text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3">{errors.form}</div>)}

      <Select id="meal-type" label="Meal type" value={mealType} onChange={(e) => setMealType(e.target.value)}>
        {MEAL_TYPES.map((mt) => (<option key={mt.value} value={mt.value}>
            {mt.label}
          </option>))}
      </Select>

      <Input id="food-name" label="Food name" placeholder="e.g. Oatmeal, Chicken breast" icon={<Apple className="h-4 w-4"/>} value={foodName} onChange={(e) => setFoodName(e.target.value)} maxLength={100} error={errors.foodName}/>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
        <Input id="quantity" label="Quantity (optional)" type="number" inputMode="decimal" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} error={errors.quantity}/>
        <Input id="unit" label="Unit (optional)" placeholder="e.g. bowl, g, cups" value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={20}/>
      </div>

      <Input id="calories" label="Calories" type="number" inputMode="decimal" placeholder="300" value={calories} onChange={(e) => setCalories(e.target.value)} error={errors.calories}/>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
        <Input id="protein" label="Protein (g)" type="number" inputMode="decimal" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} error={errors.protein}/>
        <Input id="carbs" label="Carbs (g)" type="number" inputMode="decimal" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} error={errors.carbs}/>
        <Input id="fat" label="Fat (g)" type="number" inputMode="decimal" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} error={errors.fat}/>
      </div>

      <Input id="meal-date" label="Date" type="date" icon={<Calendar className="h-4 w-4"/>} value={date} onChange={(e) => setDate(e.target.value)}/>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" size="lg" isLoading={pending} className="flex-1">
          {!pending && <Save className="h-4 w-4"/>}
          {pending ? 'Saving…' : initialEntry ? 'Save changes' : 'Add entry'}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>);
}
function toDateInput(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
