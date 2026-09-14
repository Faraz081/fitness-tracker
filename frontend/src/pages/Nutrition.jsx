import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import * as api from '../services/api';
import { AiFoodSearch } from '../components/nutrition/AiFoodSearch';
import { AddToMealModal } from '../components/nutrition/AddToMealModal';
import { MealTabs, MEAL_ORDER } from '../components/nutrition/MealTabs';
import { MealSection } from '../components/nutrition/MealSection';
import { useDashboardRefresh } from '../context/DashboardContext';

function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function Nutrition() {
    const { refreshDashboard } = useDashboardRefresh();
    const [activeTab, setActiveTab] = useState('breakfast');
    const [entries, setEntries] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [modalEstimate, setModalEstimate] = useState(null);

    const load = useCallback(async () => {
        try {
            const todayEntries = await api.listNutrition({ date: today() });
            setEntries(todayEntries);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load nutrition entries');
        }
        finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const grouped = useMemo(() => {
        const map = Object.fromEntries(MEAL_ORDER.map((mealType) => [mealType, []]));
        entries.forEach((entry) => {
            if (map[entry.mealType]) {
                map[entry.mealType].push(entry);
            }
        });
        return map;
    }, [entries]);

    function handleSelectResult(estimate) {
        setModalEstimate(estimate);
    }

    async function handleConfirmAdd(entry) {
        if (saving) {
            return;
        }
        setSaving(true);
        try {
            const created = await api.createNutritionEntry({
                ...entry,
                source: 'ai',
            });
            setEntries((prev) => [created, ...prev]);
            refreshDashboard();
            setModalEstimate(null);
        }
        catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Failed to save entry');
        }
        finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6 flex-wrap"
            >
                <div className="gradient-primary h-10 w-10 rounded-xl flex items-center justify-center glow shrink-0">
                    <Utensils className="h-5 w-5 text-dark" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        <span className="text-gradient">AI Food Search</span>
                    </h1>
                </div>
            </motion.div>

            <AiFoodSearch onSelect={handleSelectResult} />

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-sm text-error bg-error/10 border border-error/30 rounded-xl p-3"
                    role="alert"
                >
                    {error}
                </motion.div>
            )}

            <MealTabs active={activeTab} onChange={setActiveTab} />

            {!loaded ? (
                <div className="glass-elevated rounded-2xl p-6 text-sm text-text-muted" role="status">
                    Loading today's meals…
                </div>
            ) : (
                <MealSection mealType={activeTab} entries={grouped[activeTab]} />
            )}
            <AddToMealModal
                estimate={modalEstimate}
                defaultMealType={activeTab}
                onClose={() => setModalEstimate(null)}
                onAdd={handleConfirmAdd}
            />
        </div>
    );
}