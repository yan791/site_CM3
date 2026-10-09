import { AnimatePresence, motion } from 'motion/react'
import { avisos } from '../lib/aviso'

export function Aviso() {
  const aviso = avisos.usar()
  return (
    <div className="aviso-area" role="status" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {aviso && (
          <motion.div
            key={aviso.id}
            className="aviso"
            initial={{ y: 24, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <i aria-hidden="true" />
            {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
