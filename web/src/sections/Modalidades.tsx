import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, ChevronLeft, ChevronRight, Droplets, Dumbbell, Flower2, HeartPulse, Music, Waves, type LucideProps } from 'lucide-react'
import { CircularGallery, type GalleryItem } from '@/components/ui/circular-gallery'
import { cn } from '../lib/cn'
import { rolarPara, ScrollTrigger } from '../lib/scroll'
import { modalidades, nivel } from '../dados/site'
import { resumoDaTurma } from '../dados/grade'

/*
  Nível 02. As sete modalidades num anel 3D (CircularGallery).
  A rolagem da seção gira o anel e traz uma modalidade de cada vez para a frente;
  o painel embaixo mostra a da frente, com os dias e horários reais da grade.
*/
const icones: Record<string, ComponentType<LucideProps>> = {
  musculacao: Dumbbell,
  funcional: Activity,
  ritmos: Music,
  natacao: Waves,
  hidroginastica: Droplets,
  hidroterapia: HeartPulse,
  pilates: Flower2,
}

const itens: GalleryItem[] = modalidades.map((m, i) => ({
  common: m.nome,
  binomial: `${String(i + 1).padStart(2, '0')} · ${m.grade ? 'Aula coletiva' : 'Treino personalizado'}`,
  photo: { url: m.foto.src, text: `${m.nome} na CM3`, pos: m.foto.pos, by: m.foto.credito },
}))

const total = modalidades.length
const passo = 360 / total

/** tamanho do anel conforme a tela (cartões menores no celular e em telas baixas) */
function useMedidas() {
  const calcular = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    const altura = Math.round(Math.min(w < 860 ? 240 : 330, h * (w < 860 ? 0.3 : 0.355)))
    const largura = Math.round(altura * 0.74)
    return { altura, largura, raio: Math.round(largura * (w < 860 ? 1.42 : 1.9)) }
  }
  const [m, setM] = useState(calcular)
  useEffect(() => {
    const f = () => setM(calcular())
    addEventListener('resize', f)
    return () => removeEventListener('resize', f)
  }, [])
  return m
}

export function Modalidades() {
  const secao = useRef<HTMLElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const rotacao = useRef(0)
  const gatilho = useRef<ScrollTrigger | null>(null)
  const [ativo, setAtivo] = useState(0)
  const medidas = useMedidas()

  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: secao.current!,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => {
        rotacao.current = -s.progress * (total - 1) * passo
        barra.current!.style.transform = `scaleX(${s.progress.toFixed(4)})`
      },
    })
    gatilho.current = st
    return () => st.kill()
  }, [])

  const irPara = (i: number) => {
    const st = gatilho.current
    if (!st) return
    const alvo = (i + total) % total
    rolarPara(st.start + (st.end - st.start) * (alvo / (total - 1)) + 1)
  }

  const m = modalidades[ativo]
  const Icone = icones[m.slug]
  const horarios = useMemo(() => (m.grade ? resumoDaTurma(m.grade) : []), [m])

  return (
    <section id="modalidades" className="modalidades escuro" ref={secao} style={{ height: `${100 + (total - 1) * 52}svh` }}>
      <div className="mod-palco">
        <div className="mod-cabeca">
          <div>
            <p className="rotulo">Nível {nivel('modalidades')} · Modalidades</p>
            <h2 className="titulo">
              Encontre o seu <em>ritmo.</em>
            </h2>
          </div>
          <p className="texto">Do treino de força às aulas na piscina: sete modalidades para todas as idades e objetivos. Role para girar.</p>
        </div>

        <div className="mod-galeria">
          <CircularGallery
            items={itens}
            radius={medidas.raio}
            itemWidth={medidas.largura}
            itemHeight={medidas.altura}
            getRotation={() => rotacao.current}
            onActiveChange={setAtivo}
            aria-label="Galeria das modalidades da CM3"
          />
        </div>

        <div className="mod-rodape">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={m.slug}
              className="mod-detalhe"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="icone-circulo">
                <Icone strokeWidth={1.8} />
              </span>
              <div className="mod-detalhe-texto">
                <h3 className="mod-nome">{m.nome}</h3>
                <p className="mod-linha">{m.linha}</p>
                <ul className="mod-horas">
                  {horarios.length ? (
                    horarios.map((h) => (
                      <li key={h.dias}>
                        <b>{h.dias}</b>
                        <span>{h.horas.join(' · ')}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <b>{m.nota}</b>
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mod-nav">
            <span className="mod-contador" aria-hidden="true">
              <b>{String(ativo + 1).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}
            </span>
            <div className="mod-pontos" role="group" aria-label="Escolher modalidade">
              {modalidades.map((x, i) => (
                <button key={x.slug} type="button" className={cn(i === ativo && 'ativo')} aria-label={x.nome} aria-current={i === ativo} onClick={() => irPara(i)} />
              ))}
            </div>
            <div className="mod-setas">
              <button type="button" aria-label="Modalidade anterior" onClick={() => irPara(ativo - 1)} disabled={ativo === 0}>
                <ChevronLeft />
              </button>
              <button type="button" aria-label="Próxima modalidade" onClick={() => irPara(ativo + 1)} disabled={ativo === total - 1}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        <div className="mod-progresso" aria-hidden="true">
          <span ref={barra} />
        </div>
      </div>
    </section>
  )
}
