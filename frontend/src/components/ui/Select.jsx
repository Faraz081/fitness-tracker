import { motion } from 'framer-motion';
export function Select({ label, error, className = '', id, children, ...props }) {
    return (<div className="mb-4">
      {label && (<label htmlFor={id} className="block text-sm font-medium mb-1.5 text-text-secondary">
          {label}
        </label>)}
      <div className="relative">
        <select id={id} className={`appearance-none w-full rounded-xl bg-dark-600/50 border ${error ? 'border-error/50' : 'border-dark-400/50'} px-3.5 py-2.5 text-sm text-text-primary cursor-pointer focus:outline-none focus:border-primary transition-all duration-200 ${className}`} {...props}>
          {children}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      {error && (<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-error mt-1">
          {error}
        </motion.p>)}
    </div>);
}
