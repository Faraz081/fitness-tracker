import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
const typeConfig = {
    success: { icon: CheckCircle2, color: 'text-success', label: 'Success' },
    error: { icon: XCircle, color: 'text-error', label: 'Error' },
    warning: { icon: AlertTriangle, color: 'text-warning', label: 'Warning' },
    info: { icon: Info, color: 'text-primary', label: 'Info' },
};
export function ToastContainer({ toasts, onDismiss }) {
    return (<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
            const config = typeConfig[toast.type];
            return (<motion.div key={toast.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }} className="glass-elevated rounded-xl p-4 shadow-lg flex items-start gap-3 border border-white/10">
              <config.icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.color}`}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="text-sm text-text-secondary break-words">{toast.message}</p>
              </div>
              <button onClick={() => onDismiss(toast.id)} className="text-dark-200 hover:text-white transition-colors shrink-0 cursor-pointer">
                <X className="h-4 w-4"/>
              </button>
            </motion.div>);
        })}
      </AnimatePresence>
    </div>);
}
