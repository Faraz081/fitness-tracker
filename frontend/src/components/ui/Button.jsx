import { motion } from 'framer-motion';
const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] cursor-pointer whitespace-nowrap';
const variantClasses = {
    primary: 'gradient-primary text-dark shadow-glow hover:shadow-glow-lg hover:brightness-110',
    secondary: 'bg-dark-600 text-text-primary border border-dark-400 hover:bg-dark-500 hover:border-dark-300',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-dark-700',
    danger: 'bg-error/10 text-error border border-error/30 hover:bg-error/20 hover:border-error/40',
    outline: 'bg-transparent text-text-primary border border-primary/40 hover:border-primary hover:bg-primary/5',
};
const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};
export function Button({ variant = 'primary', size = 'md', isLoading = false, icon, fullWidth = false, className = '', disabled, children, ...props }) {
    return (<motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -1 }} className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`} disabled={disabled || isLoading} type={props.type ?? 'button'} onClick={props.onClick} title={props.title} aria-label={props['aria-label']} id={props.id}>
      {isLoading ? (<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>) : (icon)}
      {children}
    </motion.button>);
}
