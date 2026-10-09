import { motion } from 'motion/react'
import { contato } from '../dados/site'
import { Botao } from '../components/Botao'

const linha = {
  hidden: { y: '108%' },
  show: (n: number) => ({ y: 0, transition: { duration: 1, delay: n * 0.08, ease: [0.16, 1, 0.3, 1] as const } }),
}

export function Chamada() {
  return (
    <section className="chamada">
      <div className="chamada-luzes" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <motion.div className="conteudo chamada-miolo" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-20% 0px' }}>
        <p className="rotulo">A hora é agora</p>
        <h2 className="chamada-titulo">
          <span className="linha">
            <motion.span variants={linha} custom={0}>
              Pronto para o
            </motion.span>
          </span>
          <span className="linha">
            <motion.span variants={linha} custom={1}>
              <em>próximo nível?</em>
            </motion.span>
          </span>
        </h2>
        <p className="chamada-texto">Fale com a equipe, conheça o espaço e comece no seu ritmo.</p>
        <div className="chamada-acoes">
          <Botao href={contato.conversa} externo texto="Fale com a CM3" variante="luz" />
          <Botao href="#planos" texto="Ver planos" variante="translucido" />
        </div>
      </motion.div>
    </section>
  )
}
