import { useEffect, useRef, useState } from 'react';
import { Dumbbell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { landingContent } from '../../data/landingContent';
import LandingLink from './LandingLink';
import MobileNavMenu from './MobileNavMenu';

export default function LandingNavbar() {
    const [open, setOpen] = useState(false);
    const toggleRef = useRef(null);
    const { brand, navbar } = landingContent;

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
                toggleRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return (
        <nav className="sticky top-0 z-50 border-b border-line/60 bg-bg/85 backdrop-blur-md" aria-label="Primary">
            <div className="landing-container flex h-16 items-center justify-between gap-4">
                <Link to="/landing" className="flex shrink-0 items-center gap-2.5" aria-label={brand.ariaLabel}>
                    <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg text-dark">
                        <Dumbbell className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-bold tracking-tight">{brand.name}</span>
                </Link>

                <div className="hidden items-center gap-7 md:flex">
                    {navbar.links.map((link) => (
                        <a key={link.id} href={link.href} className="nav-link text-sm text-ink-soft transition-colors hover:text-ink">
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    <LandingLink to={navbar.login.to} label={navbar.login.label} variant={navbar.login.variant} size="sm" />
                    <LandingLink to={navbar.cta.to} label={navbar.cta.label} size="sm" />
                </div>

                <button
                    ref={toggleRef}
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
                    aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                >
                    {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                </button>
            </div>

            {open ? <MobileNavMenu onClose={() => setOpen(false)} /> : null}
        </nav>
    );
}