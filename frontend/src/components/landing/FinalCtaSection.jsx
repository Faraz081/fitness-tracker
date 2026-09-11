import { landingContent } from '../../data/landingContent';
import LandingLink from './LandingLink';
import Reveal from './Reveal';

export default function FinalCtaSection() {
    const { finalCta } = landingContent;

    return (
        <section id="signup" className="landing-section" aria-labelledby="final-cta-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="relative overflow-hidden rounded-3xl border border-line bg-panel p-8 text-center sm:p-14">
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_50%_0%,rgba(249,115,22,0.14)_0px,transparent_55%)]"
                        />
                        <p className="landing-eyebrow mb-4">{finalCta.eyebrow}</p>
                        <h2 id="final-cta-heading" className="mx-auto max-w-3xl text-3xl font-bold sm:text-5xl">
                            {finalCta.headline}
                        </h2>
                        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">{finalCta.subhead}</p>
                        <div className="mt-9 flex justify-center">
                            <LandingLink to={finalCta.primaryCta.to} label={finalCta.primaryCta.label} size="lg" />
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}