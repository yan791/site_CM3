import { useLayoutEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { pausarRolagem } from '../lib/scroll'
import { slogan } from '../dados/site'
import { MarcaCM3 } from './Logo'

const CHAVE = 'cm3-abertura'

/*
  Primeira visita da sessão: o anel turquesa se desenha em volta do símbolo
  da CM3, o nome sobe e o anel cresce passando pela câmera, revelando o site.
*/
export function Abertura() {
  const [ativa, setAtiva] = useState(() => {
    try {
      return !sessionStorage.getItem(CHAVE)
    } catch {
      return true
    }
  })

  useLayoutEffect(() => {
    // o início do site espera a abertura terminar para entrar
    document.documentElement.style.setProperty('--atraso', ativa ? '2.05s' : '0.15s')
    if (!ativa) return
    try {
      sessionStorage.setItem(CHAVE, '1')
    } catch {
      /* navegação privada: a abertura só repete */
    }
    window.scrollTo(0, 0)
    pausarRolagem(true, 'abertura')
    const t = window.setTimeout(() => {
      setAtiva(false)
      pausarRolagem(false, 'abertura')
    }, 2050)
    return () => {
      clearTimeout(t)
      pausarRolagem(false, 'abertura')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AnimatePresence>
      {ativa && (
        <motion.div
          className="abertura"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.div
            className="abertura-luz"
            exit={{ scale: 7, opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.7, 0, 0.84, 0] }}
          >
            <svg className="abertura-anel" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="56" pathLength={1} />
            </svg>
            <MarcaCM3 className="abertura-simbolo" />
          </motion.div>
          <div className="abertura-marca">
            <span>CM3</span>
            <small>Academia</small>
          </div>
          <p className="abertura-linha">{slogan}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
