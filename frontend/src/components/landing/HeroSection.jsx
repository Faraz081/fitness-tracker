import { landingContent } from '../../data/landingContent';
import LandingLink from './LandingLink';
import Reveal from './Reveal';

export default function HeroSection() {
    const { hero } = landingContent;
    const { visual } = hero;

    return (
        <section className="landing-section relative overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_70%_20%,rgba(249,115,22,0.12)_0px,transparent_50%),radial-gradient(at_20%_70%,rgba(234,88,12,0.06)_0px,transparent_50%)]"
            />
            <div className="landing-container relative grid items-center gap-12 lg:grid-cols-2">
                <div>
                    <Reveal>
                        <p className="landing-eyebrow mb-5">{hero.eyebrow}</p>
                    </Reveal>
                    <Reveal delay={0.05}>
                        <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl xl:text-6xl">{hero.title}</h1>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{hero.subhead}</p>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <LandingLink to={hero.primaryCta.to} label={hero.primaryCta.label} size="lg" />
                            <LandingLink
                                to={hero.secondaryCta.to}
                                label={hero.secondaryCta.label}
                                variant={hero.secondaryCta.variant}
                                size="lg"
                            />
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.1} className="flex justify-center">
                    <div className="relative">
                        <div className="landing-hero-ring landing-glow" role="img" aria-label={visual.label}>
                            <div className="landing-float absolute -bottom-3 left-1/2 w-52 -translate-x-1/2 rounded-2xl border border-line bg-panel p-4 text-center shadow-lg sm:w-60">
                                <p className="dash-num text-3xl text-accent">{visual.chip.value}{visual.chip.suffix}</p>
                                <p className="mt-1 text-sm text-ink-soft">{visual.chip.label}</p>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}