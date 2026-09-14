import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, Search, X } from 'lucide-react';
import * as api from '../../services/api';
import { Button, Badge, Input } from '../ui';

const MACRO_BADGES = [
    { key: 'calories', label: 'CAL', color: 'primary', display: (value) => `${value} kcal` },
    { key: 'protein', label: 'P', color: 'success', display: (value) => `${value}g` },
    { key: 'carbs', label: 'C', color: 'warning', display: (value) => `${value}g` },
    { key: 'fat', label: 'F', color: 'error', display: (value) => `${value}g` },
];

function errorMessage(err) {
    if (err instanceof api.ApiError) {
        if (err.status === 503 || err.code === 'AI_UNCONFIGURED') {
            return 'AI analysis is not configured on this server. Please contact the administrator.';
        }
        if (err.status === 502 || err.code === 'AI_UNAVAILABLE') {
            return 'AI analysis is temporarily unavailable. Please try again.';
        }
        if (err.status === 422 || err.code === 'AI_NOT_FOOD') {
            return 'Food could not be identified. Please try another search.';
        }
    }
    return err instanceof Error ? err.message : 'AI analysis failed. Please try again.';
}

function servingText(estimate) {
    const { quantity, unit } = estimate;
    if (quantity === undefined || quantity === null) {
        return '';
    }
    return `per ${quantity}${unit ?? ''}`;
}

export function AiFoodSearch({ onSelect }) {
    const [query, setQuery] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState(null);
    const requestSeq = useRef(0);

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) {
            setInputError('Enter a food or drink to search.');
            return;
        }
        if (analyzing) {
            return;
        }
        setInputError(null);
        const seq = ++requestSeq.current;
        setAnalyzing(true);
        setError(null);
        setResult(null);
        try {
            const estimate = await api.analyzeNutrition({ query: trimmed });
            if (seq !== requestSeq.current) {
                return;
            }
            setResult(estimate);
        }
        catch (err) {
            if (seq !== requestSeq.current) {
                return;
            }
            setError(errorMessage(err));
        }
        finally {
            if (seq === requestSeq.current) {
                setAnalyzing(false);
            }
        }
    }

    function handleClear() {
        requestSeq.current += 1;
        setResult(null);
        setError(null);
        setInputError(null);
    }

    return (
        <div className="glass-elevated rounded-2xl p-4 sm:p-5 mb-6" aria-label="AI food search">
            <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-start">
                    <div className="flex-1">
                        <Input
                            id="ai-food-name"
                            placeholder="banana"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            maxLength={200}
                            disabled={analyzing}
                            autoComplete="off"
                        />
                        <p className="text-xs text-text-muted">
                            Supports natural language — try 'large chicken breast' or '100g of oats with milk'
                        </p>
                    </div>
                    <div className="sm:pt-0">
                        <Button type="submit" isLoading={analyzing} fullWidth>
                            {!analyzing && <Search className="h-4 w-4" />}
                            {analyzing ? 'Analyzing…' : 'Search'}
                        </Button>
                    </div>
                </div>
                {inputError && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-error" role="alert">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {inputError}
                    </p>
                )}
            </form>

            {analyzing && (
                <div className="mt-4 flex items-center gap-3 text-sm text-text-muted" role="status" aria-label="Analyzing food">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)]" />
                    Gemini is analyzing your food…
                </div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error"
                    role="alert"
                >
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                    <p className="mt-1 pl-6 text-xs text-text-muted">Try a different description or search again.</p>
                </motion.div>
            )}

            {result && !analyzing && (
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    aria-label="Search result"
                    className="mt-4 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4"
                >
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            1 RESULT — CLICK TO ADD
                        </p>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted transition-colors hover:text-error cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold">{result.foodName}</h3>
                                {servingText(result) && (
                                    <span className="text-xs text-text-muted">{servingText(result)}</span>
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {MACRO_BADGES.map((macro) => (
                                    <Badge key={macro.key} color={macro.color}>
                                        {macro.label} {macro.display(result[macro.key])}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus className="h-4 w-4" />}
                            title={`Choose a meal to add ${result.foodName}`}
                            aria-label={`Choose a meal to add ${result.foodName}`}
                            onClick={() => onSelect(result)}
                        />
                    </div>
                </motion.section>
            )}
        </div>
    );
}