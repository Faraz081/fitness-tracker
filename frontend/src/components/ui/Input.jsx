import { motion } from 'framer-motion';
import { useState } from 'react';
export function Input({ label, error, icon, className = '', id, onFocus, onBlur, ...props }) {
    const [focused, setFocused] = useState(false);
    return (<div className="mb-4">
      {label && (<label htmlFor={id} className={`block text-sm font-medium mb-1.5 transition-colors ${focused ? 'text-primary' : 'text-text-secondary'}`}>
          {label}
        </label>)}
      <motion.div animate={focused
            ? { boxShadow: '0 0 0 3px rgba(255, 140, 66, 0.2), 0 0 12px rgba(255, 140, 66, 0.1)' }
            : { boxShadow: '0 0 0 0px rgba(255, 140, 66, 0)' }} transition={{ duration: 0.2 }} className="relative">
        {icon && (<span className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focused ? 'text-primary' : 'text-dark-300'}`}>
            {icon}
          </span>)}
        <input id={id} onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
        }} onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
        }} className={`w-full rounded-xl bg-dark-600/50 border ${error
            ? 'border-error/50 focus:border-error'
            : 'border-dark-400/50 focus:border-primary'} ${icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 text-sm text-text-primary placeholder-dark-300 transition-all duration-200 focus:outline-none ${className}`} {...props}/>
      </motion.div>
      {error && (<motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-error mt-1">
          {error}
        </motion.p>)}
    </div>);
}
