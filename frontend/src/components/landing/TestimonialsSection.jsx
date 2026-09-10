import { Quote } from 'lucide-react';
import { landingContent } from '../../data/landingContent';
import Reveal from './Reveal';

export default function TestimonialsSection() {
    const { testimonials } = landingContent;
    const hasIllustrative = testimonials.some((testimonial) => testimonial.illustrative);

    return (
        <section id="testimonials" className="landing-section" aria-labelledby="testimonials-heading">
            <div className="landing-container">
                <Reveal>
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="landing-eyebrow mb-4">What members say</p>
                        <h2 id="testimonials-heading" className="text-3xl font-bold sm:text-4xl">Backed by people who track for real</h2>
                    </div>
                </Reveal>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Reveal key={testimonial.name} delay={index * 0.07}>
                            <figure className="dash-card flex h-full flex-col gap-4 p-6">
                                <Quote className="h-6 w-6 text-accent" aria-hidden="true" />
                                <blockquote>
                                    <p className="text-sm leading-relaxed text-ink">“{testimonial.quote}”</p>
                                </blockquote>
                                <figcaption className="mt-auto flex items-center justify-between gap-2 border-t border-line/70 pt-4">
                                    <div>
                                        <p className="text-sm font-semibold">{testimonial.name}</p>
                                        <p className="text-xs text-ink-muted">{testimonial.role}</p>
                                    </div>
                                    {testimonial.illustrative ? (
                                        <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-muted">
                                            [Illustrative]
                                        </span>
                                    ) : null}
                                </figcaption>
                            </figure>
                        </Reveal>
                    ))}
                </div>

                {hasIllustrative ? (
                    <p className="mt-6 text-center text-xs text-ink-muted">
                        Testimonials shown are illustrative personas created to demonstrate the experience — not real user accounts.
                    </p>
                ) : null}
            </div>
        </section>
    );
}