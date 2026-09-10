import { CheckCircle2 } from 'lucide-react';
import { landingContent } from '../../data/landingContent';
import Reveal from './Reveal';

export default function BenefitsSection() {
    const { benefits } = landingContent;

    return (
        <section id="benefits" className="landing-section" aria-labelledby="benefits-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="landing-eyebrow mb-4">Why people stay</p>
                        <h2 id="benefits-heading" className="text-3xl font-bold sm:text-4xl">Built around outcomes, not just tracking</h2>
                        <p className="mt-4 text-lg text-ink-soft">
                            Every feature exists to move the numbers that matter — consistency, progress, and confidence.
                        </p>
                    </div>
                </Reveal>

                <div className="mt-14 grid gap-6 md:grid-cols-2">
                    {benefits.map((benefit, index) => (
                        <Reveal key={benefit.key} delay={index * 0.05}>
                            <article className="dash-card flex h-full flex-col gap-4 p-6">
                                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                                <ul className="space-y-2">
                                    {benefit.points.map((point) => (
                                        <li key={point} className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}