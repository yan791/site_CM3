import { Fragment, useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { ScrollTrigger } from '../lib/scroll'
import { foto, limitar } from '../lib/midia'
import { contato, nivel, pilares } from '../dados/site'
import { ClipboardCheck, HeartHandshake, Waves } from 'lucide-react'

/*
  Nível 01. O texto acende palavra por palavra conforme a rolagem,
  como luzes ligando uma a uma, e as fotos reais da academia
  se abrem no meio da frase.
*/
const manifesto: (string | { src: string; alt: string })[] = [
  'Na CM3, cada pessoa tem o seu ponto de partida.',
  { src: foto('musculacao-960.webp'), alt: 'Aluna treinando com barra na musculação' },
  'O treino se adapta ao seu objetivo',
  { src: foto('funcional-960.webp'), alt: 'Aluna fazendo afundo com kettlebells no funcional' },
  'e a energia de quem treina ao lado ajuda você a seguir em frente.',
  { src: foto('natacao-900.webp'), alt: 'Turma de natação infantil na piscina da CM3' },
]

const iconesPilar = { avaliacao: ClipboardCheck, estrutura: Waves, acolhimento: HeartHandshake }

function IconePilar({ nome }: { nome: keyof typeof iconesPilar }) {
  const I = iconesPilar[nome]
  return <I strokeWidth={1.8} aria-hidden="true" />
}

const subir = {
  hidden: { opacity: 0, y: 36 },
  show: (n: number) => ({ opacity: 1, y: 0, transition: { duration: 0.9, delay: n * 0.1, ease: [0.16, 1, 0.3, 1] as const } }),
}

export function Academia() {
  const texto = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    const el = texto.current!
    const pecas = [...el.querySelectorAll<HTMLElement>('[data-peca]')]
    const ultimos = pecas.map(() => -1)
    const pintar = (prog: number) => {
      const x = prog * (pecas.length + 3)
      pecas.forEach((w, n) => {
        const k = Math.round(limitar(x - n) * 100) / 100
        if (k === ultimos[n]) return
        ultimos[n] = k
        w.style.setProperty('--k', String(k))
      })
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: 'bottom 45%',
      onUpdate: (s) => pintar(s.progress),
      onRefresh: (s) => pintar(s.progress),
    })
    return () => st.kill()
  }, [])

  return (
    <section id="academia" className="academia claro">
      <div className="conteudo">
        <p className="rotulo">Nível {nivel('academia')} · A academia</p>
        <p className="manifesto" ref={texto}>
          {manifesto.map((parte, n) =>
            typeof parte === 'string' ? (
              <Fragment key={n}>
                {parte.split(' ').map((palavra, m) => (
                  <Fragment key={m}>
                    <span className="pal" data-peca>
                      {palavra}
                    </span>{' '}
                  </Fragment>
                ))}
              </Fragment>
            ) : (
              <Fragment key={n}>
                <span className="pal-foto" data-peca>
                  <img src={parte.src} alt={parte.alt} loading="lazy" />
                </span>{' '}
              </Fragment>
            ),
          )}
        </p>

        <div className="pilares">
          {pilares.map((p, n) => (
            <motion.article key={p.titulo} className="pilar" variants={subir} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-12% 0px' }} custom={n}>
              <div className="pilar-marca">
                <span className="icone-circulo">
                  <IconePilar nome={p.icone} />
                </span>
                <span className="pilar-num">{String(n + 1).padStart(2, '0')}</span>
              </div>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </motion.article>
          ))}
        </div>

        <motion.div className="credencial" variants={subir} initial="hidden" whileInView="show" viewport={{ once: true }} custom={1}>
          <strong>{contato.cref}</strong>
          <span>Registro no Conselho Regional de Educação Física, com profissionais habilitados para orientar o seu treino.</span>
        </motion.div>
      </div>
    </section>
  )
}
