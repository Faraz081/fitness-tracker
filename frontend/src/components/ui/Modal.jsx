import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
export function Modal({ isOpen, onClose, title, children, className = '' }) {
    return (<AnimatePresence>
      {isOpen && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={onClose}/>
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-elevated rounded-2xl shadow-xl ${className}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              {title && <h2 className="text-lg font-bold">{title}</h2>}
              <button onClick={onClose} className="p-1.5 rounded-lg text-dark-200 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer">
                <X className="h-5 w-5"/>
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </>)}
    </AnimatePresence>);
}
