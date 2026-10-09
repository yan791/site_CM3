import { useEffect } from 'react'
import { MotionConfig } from 'motion/react'
import { iniciarRolagem, rolarPara, ScrollTrigger } from './lib/scroll'
import { useObservarSecoes } from './lib/secao'
import { Ambiente } from './components/Ambiente'
import { Abertura } from './components/Abertura'
import { Cabecalho } from './components/Cabecalho'
import { Nivel } from './components/Nivel'
import { Portal } from './components/Portal'
import { Aviso } from './components/Aviso'
import { Hero } from './sections/Hero'
import { Academia } from './sections/Academia'
import { Faixas } from './sections/Faixas'
import { Modalidades } from './sections/Modalidades'
import { Forca } from './sections/Forca'
import { Planos } from './sections/Planos'
import { Horarios } from './sections/Horarios'
import { Equipe } from './sections/Equipe'
import { Chamada } from './sections/Chamada'
import { Duvidas } from './sections/Duvidas'
import { Contato } from './sections/Contato'
import { Rodape } from './sections/Rodape'

export default function App() {
  useObservarSecoes()

  useEffect(() => {
    iniciarRolagem()
    ScrollTrigger.config({ ignoreMobileResize: true })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // links internos (#planos, #contato...) com a rolagem suave
    const clique = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const id = a.getAttribute('href')!
      const alvo = id === '#inicio' || id === '#' ? 0 : document.querySelector<HTMLElement>(id)
      if (alvo === null) return
      e.preventDefault()
      rolarPara(alvo)
    }
    document.addEventListener('click', clique)

    // aba escondida: animações em pausa
    const visibilidade = () => document.body.classList.toggle('pausado', document.hidden)
    document.addEventListener('visibilitychange', visibilidade)

    // chegou por um link com âncora (ex.: /#planos)
    const ancora = location.hash
    let id = 0
    if (ancora.length > 1)
      id = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        const el = document.querySelector<HTMLElement>(ancora)
        if (el) rolarPara(el, { imediato: true })
      })

    return () => {
      document.removeEventListener('click', clique)
      document.removeEventListener('visibilitychange', visibilidade)
      cancelAnimationFrame(id)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="never">
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Ambiente />
      <Abertura />
      <Cabecalho />
      <Nivel />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Academia />
        <Faixas />
        <Modalidades />
        <Forca />
        <Planos />
        <Horarios />
        <Equipe />
        <Chamada />
        <Duvidas />
        <Contato />
      </main>
      <Rodape />
      <Portal />
      <Aviso />
    </MotionConfig>
  )
}
