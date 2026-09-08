import { motion } from 'framer-motion';
export function Card({ children, className = '', hover = false, index = 0 }) {
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }} whileHover={hover ? { y: -4, boxShadow: '0 8px 30px rgba(255, 140, 66, 0.1)' } : {}} className={`glass-elevated rounded-2xl p-5 transition-all duration-200 ${className}`}>
      {children}
    </motion.div>);
}
