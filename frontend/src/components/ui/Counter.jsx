import { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue, useTransform, motion } from 'framer-motion';
export function Counter({ to, from = 0, duration = 1.5, className = '', children, }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    useEffect(() => {
        if (inView) {
            const controls = animate(count, to, { duration, ease: 'easeOut' });
            return controls.stop;
        }
    }, [inView, count, to, duration]);
    return (<motion.span ref={ref} className={className}>
      <motion.span>{rounded}</motion.span>
      {children}
    </motion.span>);
}
