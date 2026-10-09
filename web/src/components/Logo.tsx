import { cn } from '../lib/cn'

/*
  Símbolo da CM3 redesenhado a partir do perfil da academia:
  a cabeça redonda sobre o corpo em "V", com os braços para cima.
  Quando o arquivo oficial do logo chegar, ele entra no lugar deste desenho.
*/
export function MarcaCM3({ className }: { className?: string }) {
  return (
    <svg className={cn('marca', className)} viewBox="12.5 0 26.5 44" aria-hidden="true">
      <circle cx="26.2" cy="8.6" r="8.2" />
      <path d="M14 19.2C18 21 22 23.5 26.5 24.6C30 25.2 33 23 34.6 19.5L36.8 12.6C37.6 17 37.2 22 35.6 27C34 33 31.6 38.5 29.4 43.2C27.6 37 25 31.5 21.6 27.6C19 24.6 16.2 22 14 19.2Z" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('logo', className)}>
      <MarcaCM3 className="logo-marca" />
      <span className="logo-nome">CM3</span>
      <span className="logo-sub">Academia</span>
    </span>
  )
}
