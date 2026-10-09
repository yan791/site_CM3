import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/cn'
import { contato, duvidas } from '../dados/site'
import { Botao } from '../components/Botao'
import { IconeMais } from '../components/icones'

export function Duvidas() {
  const [aberta, setAberta] = useState<number | null>(0)
  const base = useId()
  return (
    <section id="duvidas" className="duvidas claro">
      <div className="conteudo duv-grade">
        <div className="duv-lado">
          <p className="rotulo">Antes de começar</p>
          <h2 className="titulo">
            Perguntas
            <br />
            <em>frequentes.</em>
          </h2>
          <p className="texto">Não encontrou o que procurava? Fale com a equipe.</p>
          <Botao href={contato.conversa} externo texto="Falar com a equipe" variante="escuro" />
        </div>
        <div className="duv-lista">
          {duvidas.map((d, n) => {
            const aberto = aberta === n
            return (
              <div key={d.p} className={cn('duv-item', aberto && 'aberto')}>
                <button type="button" aria-expanded={aberto} aria-controls={`${base}-${n}`} onClick={() => setAberta(aberto ? null : n)}>
                  <span className="duv-num">{String(n + 1).padStart(2, '0')}</span>
                  <span className="duv-pergunta">{d.p}</span>
                  <IconeMais className="duv-icone" />
                </button>
                <AnimatePresence initial={false}>
                  {aberto && (
                    <motion.div
                      id={`${base}-${n}`}
                      className="duv-resposta"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p>{d.r}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
