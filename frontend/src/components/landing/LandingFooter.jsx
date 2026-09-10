import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from '../../data/landingContent';

export default function LandingFooter() {
    const { brand, footer } = landingContent;

    return (
        <div className="border-t border-line/70">
            <div className="landing-container grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg text-dark">
                            <Dumbbell className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="text-lg font-bold tracking-tight">{brand.name}</span>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{footer.about}</p>
                </div>

                <nav aria-label="Explore">
                    <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Explore</p>
                    <ul className="mt-4 space-y-3">
                        {footer.navLinks.map((link) => (
                            <li key={link.id}>
                                <a href={link.href} className="text-sm text-ink-soft transition-colors hover:text-accent">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <nav aria-label="Account">
                    <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Account</p>
                    <ul className="mt-4 space-y-3">
                        {footer.authLinks.map((link) => (
                            <li key={link.label}>
                                <Link to={link.to} className="text-sm text-ink-soft transition-colors hover:text-accent">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="border-t border-line/70">
                <div className="landing-container flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
                    <p className="text-xs text-ink-muted">{footer.legal}</p>
                    <p className="text-xs text-ink-muted">{brand.tagline}</p>
                </div>
            </div>
        </div>
    );
}