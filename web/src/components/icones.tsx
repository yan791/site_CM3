/* ícones de linha (lucide) com os nomes usados no site; o do Instagram é desenhado aqui */
import type { LucideProps } from 'lucide-react'
import { MapPin, MessageCircle, Plus, User, X } from 'lucide-react'

type P = { className?: string }
const props = (className?: string): LucideProps => ({ className: className ?? 'ico', strokeWidth: 1.8, 'aria-hidden': true })

export const IconeUsuario = ({ className }: P) => <User {...props(className)} />
export const IconeLocal = ({ className }: P) => <MapPin {...props(className)} />
export const IconeConversa = ({ className }: P) => <MessageCircle {...props(className)} />
export const IconeMais = ({ className }: P) => <Plus {...props(className)} />
export const IconeFechar = ({ className }: P) => <X {...props(className)} />

export const IconeInstagram = ({ className }: P) => (
  <svg className={className ?? 'ico'} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
  </svg>
)
