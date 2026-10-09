import { useEffect, useRef, type CSSProperties } from 'react'
import { abrirPortal } from '../lib/portal'
import { contato, secoes, slogan } from '../dados/site'
import { Logo } from '../components/Logo'

export function Rodape() {
  const gigante = useRef<HTMLDivElement>(null)

  // as letras gigantes acendem como lâmpadas quando o rodapé aparece
  useEffect(() => {
    const el = gigante.current!
    const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add('acesa'), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <footer className="rodape">
      <div className="conteudo">
        <div className="rod-topo">
          <div className="rod-marca">
            <Logo />
            <p>
              Seu próximo nível
              <br />
              começa <em>aqui.</em>
            </p>
            <small className="rod-slogan">{slogan}</small>
          </div>
          <nav className="rod-col" aria-label="Rodapé">
            <h4>Navegação</h4>
            {secoes.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.nome}
              </a>
            ))}
          </nav>
          <div className="rod-col">
            <h4>Contato</h4>
            <a href={contato.rota} target="_blank" rel="noopener noreferrer">
              {contato.endereco}
              <br />
              Centro · Surubim, PE
            </a>
            <a href={contato.conversa} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={contato.instagram} target="_blank" rel="noopener noreferrer">
              {contato.arroba}
            </a>
          </div>
          <div className="rod-col">
            <h4>Acesso</h4>
            <button type="button" onClick={() => abrirPortal()}>
              Área do aluno
            </button>
            <a href="#planos">Matricule-se</a>
            <a href="#inicio">Voltar ao topo</a>
          </div>
        </div>

        <div className="rod-gigante" ref={gigante} aria-hidden="true">
          {['C', 'M', '3'].map((l, n) => (
            <span key={l} style={{ '--n': n } as CSSProperties}>
              {l}
            </span>
          ))}
        </div>

        <div className="rod-base">
          <span>© {new Date().getFullYear()} CM3 Academia · Surubim, PE</span>
          <span>{contato.cref}</span>
          <span>{slogan}</span>
        </div>
      </div>
    </footer>
  )
}
