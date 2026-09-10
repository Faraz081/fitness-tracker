import { useState } from 'react';
import { Button } from '../ui/Button.jsx';

const PRESETS = [
    { key: 'last7', label: 'Last 7 days', days: 7 },
    { key: 'last30', label: 'Last 30 days', days: 30 },
    { key: 'last90', label: 'Last 90 days', days: 90 },
    { key: 'thisMonth', label: 'This Month', type: 'thisMonth' },
    { key: 'lastMonth', label: 'Last Month', type: 'lastMonth' },
    { key: 'thisYear', label: 'This Year', type: 'thisYear' },
    { key: 'allTime', label: 'All Time', type: 'allTime' },
];

function toDateInput(d) {
    return d.toISOString().split('T')[0];
}

function getPresetRange(preset) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (preset.type) {
        case 'thisMonth':
            return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
        case 'lastMonth': {
            const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const end = new Date(today.getFullYear(), today.getMonth(), 0);
            return { from: start, to: end };
        }
        case 'thisYear':
            return { from: new Date(today.getFullYear(), 0, 1), to: today };
        case 'allTime':
            return { from: new Date(2020, 0, 1), to: today };
        default: {
            const from = new Date(today);
            from.setDate(from.getDate() - (preset.days || 30));
            return { from, to: today };
        }
    }
}

export function DateRangeSelector({ from, to, onRangeChange, isLoading }) {
    const [activePreset, setActivePreset] = useState('last30');
    const [customFrom, setCustomFrom] = useState(from || '');
    const [customTo, setCustomTo] = useState(to || '');
    const [error, setError] = useState('');

    const handlePreset = (preset) => {
        setActivePreset(preset.key);
        const range = getPresetRange(preset);
        const f = toDateInput(range.from);
        const t = toDateInput(range.to);
        setCustomFrom(f);
        setCustomTo(t);
        setError('');
        onRangeChange(f, t);
    };

    const handleGenerate = () => {
        if (!customFrom || !customTo) {
            setError('Please select both start and end dates');
            return;
        }
        if (customFrom > customTo) {
            setError('Start date must be before or equal to end date');
            return;
        }
        setError('');
        setActivePreset('custom');
        onRangeChange(customFrom, customTo);
    };

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Date range presets">
                {PRESETS.map((preset) => (
                    <button
                        key={preset.key}
                        onClick={() => handlePreset(preset)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                            activePreset === preset.key
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'bg-dark-700 text-text-secondary hover:text-text-primary hover:bg-dark-600 border border-dark-500'
                        }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label htmlFor="report-from" className="block text-xs text-text-secondary mb-1">From</label>
                    <input
                        id="report-from"
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-500 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label htmlFor="report-to" className="block text-xs text-text-secondary mb-1">To</label>
                    <input
                        id="report-to"
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-dark-700 border border-dark-500 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} size="sm">
                    Generate
                </Button>
            </div>
            {error && (
                <p className="mt-2 text-sm text-error" role="alert">{error}</p>
            )}
        </div>
    );
}
