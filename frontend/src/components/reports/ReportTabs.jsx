import { useState } from 'react';

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'workout', label: 'Workout' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'progress', label: 'Progress' },
];

export function ReportTabs({ activeTab, onTabChange }) {
    return (
        <div role="tablist" aria-label="Report tabs" className="flex gap-1 border-b border-dark-600 mb-6">
            {TABS.map((tab) => (
                <button
                    key={tab.key}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    tabIndex={activeTab === tab.key ? 0 : -1}
                    onClick={() => onTabChange(tab.key)}
                    onKeyDown={(e) => {
                        const idx = TABS.findIndex((t) => t.key === activeTab);
                        if (e.key === 'ArrowRight') {
                            e.preventDefault();
                            onTabChange(TABS[(idx + 1) % TABS.length].key);
                        } else if (e.key === 'ArrowLeft') {
                            e.preventDefault();
                            onTabChange(TABS[(idx - 1 + TABS.length) % TABS.length].key);
                        }
                    }}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-t-lg ${
                        activeTab === tab.key
                            ? 'text-primary border-b-2 border-primary bg-dark-700/50'
                            : 'text-text-secondary hover:text-text-primary hover:bg-dark-700/30'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
