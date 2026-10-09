import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/cn'
import { limitar } from '../lib/midia'
import { Botao } from '../components/Botao'
import { MarcaCM3 } from '../components/Logo'

/*
  O momento interativo do site: o visitante faz uma "repetição".
  Enquanto segura, a frase ganha peso (fica forte, literalmente)
  e a sala se enche de turquesa. Soltar antes da hora relaxa devagar, nunca de uma vez.
  Completou: a conquista acende e o caminho segue para os planos.
*/
const linhas = [['O', 'treino', 'de', 'hoje'], ['é', 'a', 'conquista'], ['de', 'amanhã.']]
const total = linhas.flat().length
const SUBIDA = 1700 // ms segurando para completar
const DESCIDA = 1000 // ms para relaxar do topo até zero

export function Forca() {
  const secao = useRef<HTMLElement>(null)
  const palavras = useRef<HTMLSpanElement[]>([])
  const carga = useRef<SVGCircleElement>(null)
  const numero = useRef<HTMLSpanElement>(null)
  const valor = useRef(0)
  const segurando = useRef(false)
  const pronto = useRef(false)
  const raf = useRef(0)
  const toque = useRef(false)
  const [estado, setEstado] = useState<'parado' | 'segurando' | 'feito'>('parado')

  const aplicar = () => {
    const k = valor.current
    palavras.current.forEach((w, n) => {
      const kk = limitar(k * 1.3 - (n / total) * 0.3)
      w.style.fontWeight = String(Math.round(160 + 740 * kk))
      w.style.setProperty('--k', kk.toFixed(3))
    })
    carga.current!.style.strokeDashoffset = String(1 - k)
    numero.current!.textContent = `${Math.round(k * 100)}%`
    secao.current!.style.setProperty('--forca', k.toFixed(3))
  }

  const rodar = () => {
    let antes = performance.now()
    const quadro = (agora: number) => {
      const dt = Math.min(120, agora - antes)
      antes = agora
      if (segurando.current) valor.current = Math.min(1, valor.current + dt / SUBIDA)
      else valor.current = Math.max(0, valor.current - dt / DESCIDA)
      aplicar()
      if (valor.current >= 1 && !pronto.current) {
        pronto.current = true
        segurando.current = false
        setEstado('feito')
        if (toque.current) navigator.vibrate?.(40)
        raf.current = 0
        return
      }
      raf.current = segurando.current || valor.current > 0 ? requestAnimationFrame(quadro) : 0
    }
    if (!raf.current) raf.current = requestAnimationFrame(quadro)
  }

  const comecar = () => {
    if (pronto.current) return
    segurando.current = true
    setEstado('segurando')
    rodar()
  }
  const soltar = () => {
    if (!segurando.current) return
    segurando.current = false
    if (!pronto.current) setEstado('parado')
  }
  const repetir = () => {
    pronto.current = false
    setEstado('parado')
    rodar()
  }

  const tecla = (e: KeyboardEvent, desce: boolean) => {
    if (e.key !== ' ' && e.key !== 'Enter') return
    e.preventDefault()
    if (desce && !e.repeat) comecar()
    if (!desce) soltar()
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  useEffect(() => aplicar(), [])

  let n = -1
  return (
    <section className={cn('forca escuro', estado === 'feito' && 'feita')} ref={secao} aria-label="Faça uma repetição">
      <div className="forca-miolo">
        <p className="rotulo">Faça o teste</p>
        <p className="forca-frase">
          {linhas.map((l, a) => (
            <span className="forca-linha" key={a}>
              {l.map((w) => {
                n++
                const m = n
                return (
                  <span key={m} className="forca-pal" ref={(el) => void (el && (palavras.current[m] = el))}>
                    {w}
                  </span>
                )
              })}
            </span>
          ))}
        </p>

        <div className="forca-controle">
          <button
            type="button"
            className={cn('segurar', estado === 'segurando' && 'apertado', estado === 'feito' && 'completo')}
            aria-label="Segure para fazer força"
            onPointerDown={(e) => {
              toque.current = e.pointerType === 'touch'
              try {
                e.currentTarget.setPointerCapture(e.pointerId)
              } catch {
                /* sem captura, o soltar ainda chega pelo pointerup */
              }
              comecar()
            }}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onLostPointerCapture={soltar}
            onKeyDown={(e) => tecla(e, true)}
            onKeyUp={(e) => tecla(e, false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="segurar-trilha" cx="60" cy="60" r="56" />
              <circle className="segurar-carga" cx="60" cy="60" r="56" pathLength={1} ref={carga} transform="rotate(-90 60 60)" />
            </svg>
            <span className="segurar-miolo" aria-hidden="true">
              <MarcaCM3 />
            </span>
            <span className="segurar-numero" ref={numero} aria-hidden="true">
              0%
            </span>
          </button>
          <p className="forca-dica" aria-live="polite">
            {estado === 'feito' ? 'Conquista desbloqueada.' : estado === 'segurando' ? 'Isso. Não solta.' : 'Segure o círculo para fazer força'}
          </p>
        </div>

        <AnimatePresence>
          {estado === 'feito' && (
            <motion.div
              className="forca-final"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              <p>Esse é o treino de hoje. Agora é com você: escolha o plano e comece no seu ritmo.</p>
              <div className="forca-acoes">
                <Botao href="#planos" texto="Escolher meu plano" />
                <button type="button" className="linha-acao claro" onClick={repetir}>
                  Fazer de novo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
