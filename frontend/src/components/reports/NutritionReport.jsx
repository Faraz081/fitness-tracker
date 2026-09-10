import { ReportCard } from './ReportCard.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { CardSkeleton } from '../ui/Skeleton.jsx';
import { MacroDonut } from './MacroDonut.jsx';
import { SvgLineChart } from '../analytics/charts/SvgLineChart.jsx';
import { caloriesDailySeries, macroSlices, shortDate } from '../../utils/reportCharts.js';

function round1(n) {
    return n != null ? +n.toFixed(1) : null;
}

const MEAL_LABELS = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
};

export function NutritionReport({ data, isLoading, dateRange }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    if (!data) return null;

    const macroData = macroSlices(data.summary);
    const macroTotal = macroData.reduce((s, m) => s + m.value, 0);

    if (data.summary?.daysLogged === 0) {
        return (
            <EmptyState
                icon={<span aria-hidden="true">🍎</span>}
                title="No nutrition entries in this date range"
                message="Log your meals or widen the date range to see your nutrition report."
            />
        );
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-text-primary mb-4">Nutrition Report</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <ReportCard title="Total Calories">
                    <p className="text-2xl font-bold">{Math.round(data.summary.totalCalories)}</p>
                </ReportCard>
                <ReportCard title="Avg Daily">
                    <p className="text-2xl font-bold">{round1(data.summary.avgDailyCalories)} kcal</p>
                </ReportCard>
                <ReportCard title="Days Logged">
                    <p className="text-2xl font-bold">{data.summary.daysLogged}</p>
                </ReportCard>
                <ReportCard title="Protein">
                    <p className="text-2xl font-bold">{Math.round(data.summary.totalProtein)}g</p>
                    <p className="text-xs text-text-secondary">avg {round1(data.summary.avgDailyProtein)}g</p>
                </ReportCard>
                <ReportCard title="Carbs">
                    <p className="text-2xl font-bold">{Math.round(data.summary.totalCarbs)}g</p>
                    <p className="text-xs text-text-secondary">avg {round1(data.summary.avgDailyCarbs)}g</p>
                </ReportCard>
                <ReportCard title="Fat">
                    <p className="text-2xl font-bold">{Math.round(data.summary.totalFat)}g</p>
                    <p className="text-xs text-text-secondary">avg {round1(data.summary.avgDailyFat)}g</p>
                </ReportCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <ReportCard title="Calories Per Day">
                    {data.dailyTotals.length > 0 ? (
                        <SvgLineChart
                            ariaLabel="Calories per day"
                            series={[{
                                key: 'calories',
                                label: 'Calories',
                                color: 'var(--color-accent)',
                                unit: ' kcal',
                                points: caloriesDailySeries(data.dailyTotals).map((d) => ({
                                    value: Math.round(d.value),
                                    'x-label': shortDate(d.date),
                                })),
                            }]}
                        />
                    ) : (
                        <p className="text-sm text-text-secondary">No calorie entries in this range.</p>
                    )}
                </ReportCard>
                <ReportCard title="Macro Distribution">
                    {macroData.length > 0 ? (
                        <MacroDonut slices={macroData} total={macroTotal} />
                    ) : (
                        <p className="text-sm text-text-secondary">No macro totals in this range.</p>
                    )}
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Meal Type Breakdown">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-text-secondary border-b border-dark-600">
                                <th className="py-2">Meal Type</th>
                                <th className="py-2 text-right">Entries</th>
                                <th className="py-2 text-right">Calories</th>
                                <th className="py-2 text-right">Protein</th>
                                <th className="py-2 text-right">Carbs</th>
                                <th className="py-2 text-right">Fat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.mealTypeBreakdown.map((m) => (
                                <tr key={m.mealType} className="border-b border-dark-700">
                                    <td className="py-2">{MEAL_LABELS[m.mealType] || m.mealType}</td>
                                    <td className="py-2 text-right">{m.entries}</td>
                                    <td className="py-2 text-right">{Math.round(m.calories)}</td>
                                    <td className="py-2 text-right">{Math.round(m.protein)}g</td>
                                    <td className="py-2 text-right">{Math.round(m.carbs)}g</td>
                                    <td className="py-2 text-right">{Math.round(m.fat)}g</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Daily Totals">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-text-secondary border-b border-dark-600">
                                    <th className="py-2">Date</th>
                                    <th className="py-2 text-right">Calories</th>
                                    <th className="py-2 text-right">Protein</th>
                                    <th className="py-2 text-right">Carbs</th>
                                    <th className="py-2 text-right">Fat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.dailyTotals.map((d) => (
                                    <tr key={d.date} className="border-b border-dark-700">
                                        <td className="py-2">{d.date}</td>
                                        <td className="py-2 text-right">{Math.round(d.calories)}</td>
                                        <td className="py-2 text-right">{Math.round(d.protein)}g</td>
                                        <td className="py-2 text-right">{Math.round(d.carbs)}g</td>
                                        <td className="py-2 text-right">{Math.round(d.fat)}g</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ReportCard>
            </div>

            <div className="mb-6">
                <ReportCard title="Meals">
                    {data.meals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-text-secondary border-b border-dark-600">
                                        <th className="py-2">Date</th>
                                        <th className="py-2">Meal</th>
                                        <th className="py-2">Food</th>
                                        <th className="py-2 text-right">Qty</th>
                                        <th className="py-2 text-right">Calories</th>
                                        <th className="py-2 text-right">P</th>
                                        <th className="py-2 text-right">C</th>
                                        <th className="py-2 text-right">F</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.meals.map((m) => (
                                        <tr key={m.id} className="border-b border-dark-700">
                                            <td className="py-2">{m.date}</td>
                                            <td className="py-2">{MEAL_LABELS[m.mealType] || m.mealType}</td>
                                            <td className="py-2 font-medium">{m.foodName}</td>
                                            <td className="py-2 text-right">{m.quantity} {m.unit ?? ''}</td>
                                            <td className="py-2 text-right">{Math.round(m.calories)}</td>
                                            <td className="py-2 text-right">{m.protein}g</td>
                                            <td className="py-2 text-right">{m.carbs}g</td>
                                            <td className="py-2 text-right">{m.fat}g</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No meals logged in this range.</p>
                    )}
                </ReportCard>
            </div>

            <ReportCard title="Calorie Goal">
                <EmptyState
                    title="No goal set in this range"
                    message="Persist a calorie or macro goal to see adherence comparisons."
                />
            </ReportCard>
        </div>
    );
}