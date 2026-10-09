import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap, velocidade } from '../lib/scroll'
import { faixas } from '../dados/site'

/*
  Duas fitas cruzadas na virada do claro para o escuro.
  Andam sozinhas, aceleram com a rolagem e mudam de sentido junto com ela.
*/
function Fita({ itens, cor, sentido, inclinacao }: { itens: string[]; cor: 'turquesa' | 'escura'; sentido: 1 | -1; inclinacao: string }) {
  const caixa = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trilho.current!
    let x = 0
    let largura = 0
    let direcao: number = sentido
    let visivel = false
    const medir = () => {
      largura = (el.firstElementChild as HTMLElement).offsetWidth
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting))
    io.observe(caixa.current!)

    const passo = (_t: number, dt: number) => {
      if (!visivel || !largura) return
      const v = velocidade()
      if (Math.abs(v) > 0.4) direcao = Math.sign(v) * sentido
      x -= (0.045 + Math.min(Math.abs(v), 80) * 0.014) * Math.min(dt, 50) * direcao
      x = (((x % largura) + largura) % largura) - largura
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`
    }
    gsap.ticker.add(passo)
    return () => {
      gsap.ticker.remove(passo)
      ro.disconnect()
      io.disconnect()
    }
  }, [sentido])

  return (
    <div className={`fita fita-${cor}`} ref={caixa} style={{ '--inc': inclinacao } as CSSProperties}>
      <div className="fita-trilho" ref={trilho}>
        {[0, 1, 2].map((k) => (
          <div className="fita-grupo" key={k} aria-hidden={k > 0 || undefined}>
            {itens.map((t) => (
              <span key={t}>
                {t}
                <i className="fita-ponto" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Faixas() {
  return (
    <div className="faixas" aria-hidden="true">
      <Fita itens={faixas.escura} cor="escura" sentido={-1} inclinacao="2.2deg" />
      <Fita itens={faixas.turquesa} cor="turquesa" sentido={1} inclinacao="-2.6deg" />
    </div>
  )
}
