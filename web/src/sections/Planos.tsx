import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { animate, motion, useInView } from 'motion/react'
import { Check } from 'lucide-react'
import { cn } from '../lib/cn'
import { usePublico, type Plano } from '../lib/api'
import { abrirPortal } from '../lib/portal'
import { nivel } from '../dados/site'
import { Botao } from '../components/Botao'

/*
  Nível 03. Os planos vêm do painel administrativo (API).
  Os valores contam até o preço quando o cartão aparece.
*/
const reais = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function Planos() {
  const { plans } = usePublico()
  return (
    <section id="planos" className="planos claro">
      <div className="conteudo planos-grade">
        <div className="planos-lado">
          <p className="rotulo">Nível {nivel('planos')} · Planos</p>
          <h2 className="titulo">
            Seu objetivo.
            <br />
            <em>Seu plano.</em>
          </h2>
          <p className="texto">Escolha o ritmo que combina com você. A equipe confirma os detalhes e acompanha o seu primeiro passo.</p>
          <p className="nota">* Valores e benefícios ilustrativos. Consulte a recepção para confirmar condições, disponibilidade e matrícula.</p>
        </div>
        <div className="planos-lista">
          {plans.map((p, n) => (
            <CartaoPlano key={p.id} plano={p} indice={n} destaque={n === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function CartaoPlano({ plano, indice, destaque }: { plano: Plano; indice: number; destaque: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const visto = useInView(ref, { once: true, margin: '-15% 0px' })
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!visto) return
    const c = animate(0, plano.price, { duration: 1.5, ease: [0.16, 1, 0.3, 1], onUpdate: setValor, onComplete: () => setValor(plano.price) })
    return () => c.stop()
  }, [visto, plano.price])

  const [inteiro, centavos] = reais.format(valor).split(',')
  const beneficios = plano.description
    .split('•')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))

  const luz = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <motion.article
      ref={ref}
      className={cn('plano', destaque && 'destaque')}
      onPointerMove={luz}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.95, delay: indice * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      {destaque && <span className="plano-borda" aria-hidden="true" />}
      <div className="plano-topo">
        <span className="plano-num">{String(indice + 1).padStart(2, '0')} / Plano</span>
        {destaque && <span className="plano-selo">Mais escolhido</span>}
      </div>
      <h3 className="plano-nome">{plano.name}</h3>
      <p className="plano-preco">
        <span className="sr-only">
          {reais.format(plano.price)} reais por {plano.period}
        </span>
        <span aria-hidden="true" className="plano-valor">
          <small>R$</small>
          <strong>{inteiro}</strong>
          <span>,{centavos}</span>
          <em>/ {plano.period}</em>
        </span>
      </p>
      <ul className="plano-lista">
        {beneficios.map((b) => (
          <li key={b}>
            <Check aria-hidden="true" strokeWidth={2.4} />
            {b}
          </li>
        ))}
      </ul>
      <div className="plano-acao">
        <Botao texto="Quero esse plano" variante={destaque ? 'luz' : 'turquesa'} largo onClick={() => abrirPortal('register')} />
      </div>
    </motion.article>
  )
}
