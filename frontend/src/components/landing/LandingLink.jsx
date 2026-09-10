import { Link } from 'react-router-dom';

const variantClasses = {
    primary:
        'gradient-primary text-dark shadow-glow hover:shadow-glow-lg hover:brightness-110',
    outline:
        'bg-transparent text-text-primary border border-primary/40 hover:border-primary hover:bg-primary/5',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-dark-700',
};

const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

export default function LandingLink({ to, label, variant = 'primary', size = 'md', className = '' }) {
    const classes = [
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark active:scale-[0.97] cursor-pointer whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
    ].join(' ');

    return (
        <Link to={to} className={classes}>
            {label}
        </Link>
    );
}