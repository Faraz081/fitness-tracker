import { landingContent } from '../../data/landingContent';
import Reveal from './Reveal';

export default function HowItWorksSection() {
    const { howItWorks } = landingContent;

    return (
        <section id="how-it-works" className="landing-section" aria-labelledby="how-it-works-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="landing-eyebrow mb-4">How it works</p>
                        <h2 id="how-it-works-heading" className="text-3xl font-bold sm:text-4xl">From first log to real results</h2>
                        <p className="mt-4 text-lg text-ink-soft">Three simple steps — no setup marathon, no learning curve.</p>
                    </div>
                </Reveal>

                <ol className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
                    {howItWorks.map((step, index) => (
                        <Reveal key={step.step} delay={index * 0.08}>
                            <li className="relative flex h-full flex-col items-center gap-4 text-center">
                                {index < howItWorks.length - 1 ? (
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-[calc(50%+3.5rem)] top-7 hidden h-px w-[calc(100%-7rem)] bg-line md:block"
                                    />
                                ) : null}
                                <span
                                    className="dash-num flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-xl text-accent"
                                    aria-hidden="true"
                                >
                                    {step.step}
                                </span>
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="max-w-xs text-sm leading-relaxed text-ink-soft">{step.description}</p>
                            </li>
                        </Reveal>
                    ))}
                </ol>
            </div>
        </section>
    );
}