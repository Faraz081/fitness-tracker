import { useEffect, useRef } from 'react';
import { landingContent } from '../../data/landingContent';
import LandingLink from './LandingLink';

export default function MobileNavMenu({ onClose }) {
    const firstItemRef = useRef(null);
    const { navbar } = landingContent;

    useEffect(() => {
        firstItemRef.current?.focus();
    }, []);

    return (
        <div id="mobile-nav" className="border-t border-line/60 bg-panel md:hidden">
            <div className="landing-container flex flex-col gap-1 py-4">
                {navbar.links.map((link, index) => (
                    <a
                        key={link.id}
                        ref={index === 0 ? firstItemRef : undefined}
                        href={link.href}
                        onClick={onClose}
                        className="rounded-lg px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-dark-700 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {link.label}
                    </a>
                ))}

                <div className="mt-3 flex flex-col gap-3 border-t border-line/60 pt-4">
                    <LandingLink to={navbar.login.to} label={navbar.login.label} variant={navbar.login.variant} className="w-full" />
                    <LandingLink to={navbar.cta.to} label={navbar.cta.label} className="w-full" />
                </div>
            </div>
        </div>
    );
}