import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Calendar, Edit3, Plus, Trash2, Utensils, Zap, } from 'lucide-react';
import * as api from '../services/api';
import { MealForm } from '../components/MealForm';
import { Badge, Button, Input, ListSkeleton } from '../components/ui';
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_META = {
    breakfast: { label: 'Breakfast', icon: Apple },
    lunch: { label: 'Lunch', icon: Utensils },
    dinner: { label: 'Dinner', icon: Utensils },
    snack: { label: 'Snack', icon: Zap },
};
function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function formatQuantity(entry) {
    if (entry.quantity === 1 && !entry.unit)
        return '';
    return `${entry.quantity}${entry.unit ? ` ${entry.unit}` : ''}`;
}
export default function Nutrition() {
    const [date, setDate] = useState(today());
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);
    const [successNote, setSuccessNote] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [entryData, summaryData] = await Promise.all([
                api.listNutrition({ date }),
                api.getNutritionSummary(date),
            ]);
            setEntries(entryData);
            setSummary(summaryData);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load nutrition');
        }
        finally {
            setLoading(false);
        }
    }, [date]);
    useEffect(() => {
        void load();
    }, [load]);
    function showSuccess(message) {
        setSuccessNote(message);
        window.setTimeout(() => setSuccessNote(null), 3000);
    }
    function openAdd() {
        setEditing(null);
        setFormOpen(true);
    }
    function openEdit(entry) {
        setEditing(entry);
        setFormOpen(true);
    }
    async function handleSubmit(payload) {
        setSaving(true);
        setError(null);
        try {
            if (editing) {
                await api.updateNutritionEntry(editing.id, payload);
                showSuccess('Entry updated');
            }
            else {
                await api.createNutritionEntry(payload);
                showSuccess('Entry added');
            }
            setFormOpen(false);
            setEditing(null);
            setDate(payload.date);
            await load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save entry');
        }
        finally {
            setSaving(false);
        }
    }
    async function handleDelete(id) {
        if (deletingId)
            return;
        setDeletingId(id);
        setError(null);
        try {
            await api.deleteNutritionEntry(id);
            setConfirmId(null);
            showSuccess('Entry deleted');
            await load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete entry');
        }
        finally {
            setDeletingId(null);
        }
    }
    const grouped = MEAL_ORDER.map((mealType) => ({
        mealType,
        ...MEAL_META[mealType],
        items: entries.filter((e) => e.mealType === mealType),
    }));
    return (<div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center glow shrink-0">
            <Apple className="h-5 w-5 text-dark"/>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-gradient">Nutrition</span>
            </h1>
            <p className="text-sm text-text-muted">Track your daily food and macros</p>
          </div>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4"/>
          Add entry
        </Button>
      </motion.div>

      <div className="glass-elevated rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-2">
          <Input id="nutrition-date" label="Date" type="date" icon={<Calendar className="h-4 w-4"/>} value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-56"/>
          <div className="hidden sm:block pb-4">
            <Button variant="outline" onClick={() => setDate(today())}>
              Today
            </Button>
          </div>
        </div>

        {summary && (<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="rounded-xl bg-dark-700/40 border border-dark-400/30 p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Calories</p>
              <p className="text-xl font-bold">
                <span className="text-gradient">{summary.calories}</span>
              </p>
            </div>
            <div className="rounded-xl bg-dark-700/40 border border-dark-400/30 p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Protein</p>
              <p className="text-xl font-bold">{summary.protein}g</p>
            </div>
            <div className="rounded-xl bg-dark-700/40 border border-dark-400/30 p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Carbs</p>
              <p className="text-xl font-bold">{summary.carbs}g</p>
            </div>
            <div className="rounded-xl bg-dark-700/40 border border-dark-400/30 p-3">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Fat</p>
              <p className="text-xl font-bold">{summary.fat}g</p>
            </div>
          </div>)}
      </div>

      {successNote && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-success bg-success/10 border border-success/30 rounded-xl p-3">
          {successNote}
        </motion.div>)}

      {error && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3">
          {error}
        </motion.div>)}

      {loading ? (<ListSkeleton count={3}/>) : entries.length === 0 ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated rounded-3xl p-8 text-center">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-dark-700 flex items-center justify-center mb-5">
            <Apple className="h-10 w-10 text-primary"/>
          </div>
          <h3 className="text-xl font-bold mb-1">No entries for this date</h3>
          <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
            Log a meal or snack to start tracking your daily calories and macros.
          </p>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4"/>
            Add your first entry
          </Button>
        </motion.div>) : (<div className="space-y-6">
          {grouped.map((group) => group.items.length > 0 && (<motion.div key={group.mealType} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-dark-700/40 border-b border-white/5">
                    <group.icon className="h-4 w-4 text-primary"/>
                    <span className="text-sm font-bold">{group.label}</span>
                    <Badge color="neutral">{group.items.length}</Badge>
                  </div>
                  <div className="divide-y divide-white/5">
                    {group.items.map((entry) => {
                    const qty = formatQuantity(entry);
                    return (<div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{entry.foodName}</span>
                              {qty && (<span className="text-xs text-text-muted">{qty}</span>)}
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">
                              {entry.calories} kcal · {entry.protein}g P · {entry.carbs}g C ·{' '}
                              {entry.fat}g F
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => openEdit(entry)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-dark-600 transition-colors cursor-pointer" title="Edit entry">
                              <Edit3 className="h-4 w-4"/>
                            </button>
                            {confirmId === entry.id ? (<div className="flex items-center gap-2">
                                <Button variant="danger" size="sm" onClick={() => handleDelete(entry.id)} isLoading={deletingId === entry.id}>
                                  {deletingId === entry.id ? 'Deleting…' : 'Confirm'}
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                                  Cancel
                                </Button>
                              </div>) : (<button type="button" onClick={() => setConfirmId(entry.id)} className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer" title="Delete entry">
                                <Trash2 className="h-4 w-4"/>
                              </button>)}
                          </div>
                        </div>);
                })}
                  </div>
                </motion.div>))}
        </div>)}

      {formOpen && (<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="w-full max-w-lg glass-elevated rounded-2xl shadow-xl p-5 sm:p-6 my-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="gradient-primary h-9 w-9 rounded-xl flex items-center justify-center glow shrink-0">
                <Apple className="h-4 w-4 text-dark"/>
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {editing ? 'Edit entry' : 'Add entry'}
                </h2>
                <p className="text-xs text-text-muted">
                  {editing ? 'Update your food details' : 'Log a meal or snack'}
                </p>
              </div>
            </div>
            <MealForm defaultDate={date} initialEntry={editing} pending={saving} onSubmit={handleSubmit} onCancel={() => {
                setFormOpen(false);
                setEditing(null);
            }}/>
          </div>
        </motion.div>)}
    </div>);
}
