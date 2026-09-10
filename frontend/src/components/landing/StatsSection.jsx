import { useReducedMotion } from 'framer-motion';
import { Counter } from '../ui/Counter';
import { landingContent } from '../../data/landingContent';
import Reveal from './Reveal';

export default function StatsSection() {
    const reduce = useReducedMotion();
    const { stats } = landingContent;
    const hasIllustrative = stats.some((stat) => stat.illustrative);

    return (
        <section id="stats" className="landing-section" aria-labelledby="stats-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="landing-eyebrow mb-4">The numbers so far</p>
                        <h2 id="stats-heading" className="text-3xl font-bold sm:text-4xl">Tracking that shows up in the data</h2>
                    </div>
                </Reveal>

                <dl className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Reveal key={stat.label} delay={index * 0.06}>
                            <div className="dash-card flex h-full flex-col items-center gap-2 p-6 text-center">
                                <dd className="dash-num order-first text-3xl text-accent sm:text-4xl">
                                    <span aria-hidden="true">{stat.prefix}</span>
                                    {reduce ? stat.value : <Counter to={stat.value} />}
                                    <span aria-hidden="true">{stat.suffix}</span>
                                </dd>
                                <dt className="text-sm leading-snug text-ink-soft">{stat.label}</dt>
                                {stat.illustrative ? (
                                    <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-muted">
                                        Illustrative
                                    </span>
                                ) : null}
                            </div>
                        </Reveal>
                    ))}
                </dl>

                {hasIllustrative ? (
                    <p className="mt-6 text-center text-xs text-ink-muted">
                        Illustrative figures are examples for demonstration. Capability counts (e.g., workout categories and tracking views) reflect the current product.
                    </p>
                ) : null}
            </div>
        </section>
    );
}