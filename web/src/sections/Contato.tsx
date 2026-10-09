import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { contato, nivel } from '../dados/site'
import { IconeConversa, IconeInstagram, IconeLocal } from '../components/icones'

function Canal({ href, icone, rotulo, titulo, texto, n }: { href: string; icone: ReactNode; rotulo: string; titulo: string; texto: string; n: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, delay: n * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <span className="canal-icone">{icone}</span>
        <span className="canal-texto">
          <small>{rotulo}</small>
          <strong>{titulo}</strong>
          <em>{texto}</em>
        </span>
      </a>
    </motion.li>
  )
}

export function Contato() {
  return (
    <section id="contato" className="contato escuro">
      <div className="conteudo cont-grade">
        <div className="cont-lado">
          <p className="rotulo">Nível {nivel('contato')} · Contato</p>
          <h2 className="titulo">
            O próximo passo
            <br />
            <em>é seu.</em>
          </h2>
          <p className="texto">
            Estamos na {contato.endereco}, no Centro de Surubim. Fale com a equipe para conhecer os horários e agendar sua visita.
          </p>
          <ul className="canais">
            <Canal n={0} href={contato.rota} icone={<IconeLocal />} rotulo="Localização" titulo={contato.endereco} texto={contato.cidade} />
            <Canal n={1} href={contato.conversa} icone={<IconeConversa />} rotulo="WhatsApp" titulo="Converse com a CM3" texto="Toque para iniciar uma conversa." />
            <Canal n={2} href={contato.instagram} icone={<IconeInstagram />} rotulo="Instagram" titulo={contato.arroba} texto="Acompanhe as novidades da academia." />
          </ul>
        </div>
        <motion.div
          className="cont-mapa"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <iframe title="Mapa da Praça Dídimo Carneiro, Centro, Surubim" src={contato.mapa} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a className="cont-rota" href={contato.rota} target="_blank" rel="noopener noreferrer">
            <span className="icone-circulo">
              <IconeLocal />
            </span>
            <span>
              <strong>Como chegar</strong>
              <small>Abrir no Google Maps</small>
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
