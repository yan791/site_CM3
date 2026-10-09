import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/cn'
import { secaoAtiva } from '../lib/secao'
import { abrirPortal } from '../lib/portal'
import { pausarRolagem } from '../lib/scroll'
import { contato, nivel, secoes } from '../dados/site'
import { Logo } from './Logo'
import { Botao } from './Botao'
import { IconeUsuario } from './icones'

export function Cabecalho() {
  const ativa = secaoAtiva.usar()
  const [rolado, setRolado] = useState(false)
  const [oculto, setOculto] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    let ultimo = scrollY
    let raf = 0
    const ver = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = scrollY
        setRolado(y > 24)
        // some ao descer (depois da primeira tela) e volta ao subir
        if (y > ultimo + 6 && y > innerHeight * 0.85) setOculto(true)
        else if (y < ultimo - 6 || y < innerHeight * 0.5) setOculto(false)
        ultimo = y
      })
    }
    ver()
    addEventListener('scroll', ver, { passive: true })
    return () => {
      removeEventListener('scroll', ver)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    pausarRolagem(menu, 'menu')
    if (!menu) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [menu])

  return (
    <>
      <header className={cn('cab', rolado && 'rolado', oculto && !menu && 'oculto', menu && 'com-menu')}>
        <a href="#inicio" className="cab-logo" aria-label="CM3 Academia, voltar ao início" onClick={() => setMenu(false)}>
          <Logo />
        </a>

        <nav className="cab-nav" aria-label="Navegação principal">
          {secoes.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={cn(ativa === s.id && 'ativa')} aria-current={ativa === s.id ? 'true' : undefined}>
              <span className="cab-nav-texto">
                <span>{s.nome}</span>
                <span aria-hidden="true">{s.nome}</span>
              </span>
            </a>
          ))}
        </nav>

        <div className="cab-acoes">
          <button type="button" className="cab-aluno" onClick={() => abrirPortal()}>
            <IconeUsuario />
            <span>Área do aluno</span>
          </button>
          <Botao href="#planos" texto="Matricule-se" pequeno className="cab-cta" />
          <button
            type="button"
            className="cab-menu"
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }}
            animate={{ clipPath: 'polygon(-60% 0, 100% 0, 100% 160%, -60% 160%)' }}
            exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="menu-links" aria-label="Menu">
              {secoes.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMenu(false)}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.18 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <small>{nivel(s.id)}</small>
                  {s.nome}
                </motion.a>
              ))}
            </nav>
            <motion.div
              className="menu-rodape"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Botao href="#planos" texto="Matricule-se" largo onClick={() => setMenu(false)} />
              <Botao
                texto="Área do aluno"
                variante="vidro"
                largo
                onClick={() => {
                  setMenu(false)
                  abrirPortal()
                }}
              />
              <p>
                {contato.endereco} · {contato.cidade}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
