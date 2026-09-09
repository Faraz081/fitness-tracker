import { Palette, Scale } from 'lucide-react';
import { THEME_OPTIONS, UNIT_OPTIONS } from '../../data/constants';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../hooks/useToast';

export function PreferencesForm() {
    const { preferences, updateUnits, updateTheme } = useSettings();
    const { success, error: showError } = useToast();

    async function handleUnitsChange(event) {
        const units = event.target.value;
        try {
            await updateUnits(units);
            success(`Weight units set to ${units}`);
        }
        catch (err) {
            showError(err instanceof Error ? err.message : 'Could not update units');
        }
    }

    async function handleThemeChange(event) {
        const theme = event.target.value;
        try {
            await updateTheme(theme);
            success(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme applied`);
        }
        catch (err) {
            showError(err instanceof Error ? err.message : 'Could not update theme');
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                    <Scale className="h-4 w-4" />
                    Weight units
                </span>
                <select
                    aria-label="Weight units"
                    value={preferences.units}
                    onChange={handleUnitsChange}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
                >
                    {UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    Changes how weights are shown across the app. Stored records are unchanged.
                </p>
            </label>

            <label className="block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                    <Palette className="h-4 w-4" />
                    Theme
                </span>
                <select
                    aria-label="Theme"
                    value={preferences.theme}
                    onChange={handleThemeChange}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
                >
                    {THEME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    Dark is default; Light uses the same color tokens.
                </p>
            </label>
        </div>
    );
}