import { Apple, BarChart3, Bell, Dumbbell, Target, TrendingUp } from 'lucide-react';
import { landingContent } from '../../data/landingContent';
import Reveal from './Reveal';

const ICON_MAP = {
    Dumbbell,
    Apple,
    TrendingUp,
    Target,
    BarChart3,
    Bell,
};

export default function FeaturesSection() {
    const { features } = landingContent;

    return (
        <section id="features" className="landing-section" aria-labelledby="features-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="landing-eyebrow mb-4">What you get</p>
                        <h2 id="features-heading" className="text-3xl font-bold sm:text-4xl">Everything you track, in one dashboard</h2>
                        <p className="mt-4 text-lg text-ink-soft">
                            FitTrack covers the full loop of a fitness habit — logging, analysis, goals, and proof.
                        </p>
                    </div>
                </Reveal>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = ICON_MAP[feature.icon];
                        return (
                            <Reveal key={feature.key} delay={index * 0.05}>
                                <article className="dash-card flex h-full flex-col gap-4 p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent" aria-hidden="true">
                                        {Icon ? <Icon className="h-6 w-6" /> : null}
                                    </div>
                                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-ink-soft">{feature.description}</p>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}