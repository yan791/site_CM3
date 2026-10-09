import type { PointerEvent, ReactNode } from 'react'
import { cn } from '../lib/cn'

type Variante = 'turquesa' | 'luz' | 'vidro' | 'escuro' | 'translucido'

type Props = {
  texto: string
  variante?: Variante
  pequeno?: boolean
  largo?: boolean
  className?: string
  icone?: ReactNode
} & (
  | { href: string; externo?: boolean; onClick?: () => void; tipo?: never; desativado?: never }
  | { href?: never; externo?: never; onClick?: () => void; tipo?: 'button' | 'submit'; desativado?: boolean }
)

/*
  Botão da CM3: pílula em degradê turquesa, sobe de leve e brilha no hover,
  e o texto rola para cima. Sem setas: o texto fica centralizado, como a academia já usava.
*/
export function Botao(p: Props) {
  const classe = cn('botao', p.variante ?? 'turquesa', p.pequeno && 'pequeno', p.largo && 'largo', p.className)

  const entrar = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
  }

  const miolo = (
    <>
      <span className="botao-fundo" aria-hidden="true" />
      {p.icone}
      <span className="botao-texto">
        <span>{p.texto}</span>
        <span aria-hidden="true">{p.texto}</span>
      </span>
    </>
  )

  if (p.href !== undefined)
    return (
      <a
        className={classe}
        href={p.href}
        onPointerEnter={entrar}
        onPointerLeave={entrar}
        onClick={p.onClick}
        {...(p.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {miolo}
      </a>
    )

  return (
    <button
      className={classe}
      type={p.tipo ?? 'button'}
      disabled={p.desativado}
      onPointerEnter={entrar}
      onPointerLeave={entrar}
      onClick={p.onClick}
    >
      {miolo}
    </button>
  )
}
