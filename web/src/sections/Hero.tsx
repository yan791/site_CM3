import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { ScrollTrigger } from '../lib/scroll'
import { faixa, foto, misturar, saida, suave } from '../lib/midia'
import { contato, slogan } from '../dados/site'
import { Botao } from '../components/Botao'

/*
  O início: a foto real do corredor da CM3 aparece por uma janela em losango,
  a mesma forma das luzes do teto. Ao rolar, a janela abre até tomar a tela,
  a câmera caminha para dentro do corredor e as molduras de luz passam por cima,
  como andar debaixo dos LEDs. Depois a próxima seção sobe por cima do palco.

  Tudo sai de um único progresso de rolagem (p) e da cobertura final (q).
*/

const MOLDURAS_DO_TUNEL = 5
const i = (n: number) => ({ '--i': n }) as CSSProperties

const losango = (cx: number, cy: number, r: number) =>
  `M${cx.toFixed(1)} ${(cy - r).toFixed(1)}L${(cx + r).toFixed(1)} ${cy.toFixed(1)}L${cx.toFixed(1)} ${(cy + r).toFixed(1)}L${(cx - r).toFixed(1)} ${cy.toFixed(1)}Z`

export function Hero() {
  const secao = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const cena = useRef<HTMLDivElement>(null)
  const janela = useRef<HTMLDivElement>(null)
  const imagem = useRef<HTMLImageElement>(null)
  const luzes = useRef<SVGSVGElement>(null)
  const veu = useRef<HTMLDivElement>(null)
  const textoA = useRef<HTMLDivElement>(null)
  const textoB = useRef<HTMLDivElement>(null)
  const rodape = useRef<HTMLDivElement>(null)
  const cobre = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const sec = secao.current!
    const pal = palco.current!
    const img = imagem.current!
    const svg = luzes.current!
    const borda = [...svg.querySelectorAll<SVGPathElement>('.borda')]
    const ecos = [...svg.querySelectorAll<SVGPathElement>('.eco')]
    const tunel = [...svg.querySelectorAll<SVGPathElement>('.tunel')]
    const linhasB = [...textoB.current!.querySelectorAll<HTMLElement>('.hb-linha')]

    let W = 0
    let H = 0
    let celular = false
    let fx = 0 // ponto de fuga do corredor na tela
    let fy = 0
    let p = 0
    let q = 0
    const mouse = { x: 0, y: 0, ax: 0, ay: 0 }

    function medir() {
      W = pal.clientWidth
      H = pal.clientHeight
      celular = W < 860 || W / H < 1.1
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      // a foto (960x1280) cobre o palco com object-position 50% 40%; o fundo do corredor fica em 50% x 41%
      const esc = Math.max(W / 960, H / 1280)
      const fh = 1280 * esc
      fx = W / 2
      fy = (H - fh) * 0.4 + fh * 0.41
    }

    function desenhar() {
      const e = suave(faixa(p, 0, 0.55))
      const solto = 1 - e
      const r0 = celular ? Math.min(W * 0.37, H * 0.19) : Math.min(H * 0.4, W * 0.27)
      const cx0 = celular ? W * 0.5 : W * 0.655
      const cy0 = celular ? Math.max(H * 0.29, 74 + r0) : H * 0.53
      const r1 = (W + H) / 2 + 60
      const cx = misturar(cx0, W / 2, e) + mouse.ax * 16 * solto
      const cy = misturar(cy0, H / 2, e) + mouse.ay * 12 * solto
      const r = misturar(r0, r1, e)

      janela.current!.style.clipPath = `polygon(${cx}px ${cy - r}px, ${cx + r}px ${cy}px, ${cx}px ${cy + r}px, ${cx - r}px ${cy}px)`

      // a foto acompanha o centro da janela e depois a câmera caminha para o fundo do corredor
      const andar = faixa(p, 0.3, 1)
      const tx = (cx - W / 2) * 0.85 - mouse.ax * 10 * solto
      const ty = (cy - H / 2) * 0.85 - mouse.ay * 8 * solto
      const s = misturar(1.18, 1.02, e) * (1 + 0.3 * andar * andar)
      img.style.transformOrigin = `${fx}px ${fy}px`
      img.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`

      const d = losango(cx, cy, r)
      borda.forEach((b) => b.setAttribute('d', d))
      // as molduras em volta da janela, como as luzes aninhadas do teto
      const somemEcos = 1 - faixa(p, 0, 0.3)
      ecos.forEach((el, n) => {
        el.setAttribute('d', losango(cx, cy, r * (1.15 + n * 0.17)))
        el.style.opacity = String((0.4 - n * 0.16) * somemEcos)
      })
      // o túnel de luz que nasce no fundo do corredor e passa pela câmera
      const px = fx + tx
      const py = fy + ty
      const entrada = faixa(p, 0.28, 0.42) * (1 - q)
      tunel.forEach((el, n) => {
        const t = (andar * 1.6 + n / MOLDURAS_DO_TUNEL) % 1
        el.setAttribute('d', losango(px, py, 8 * Math.pow(r1 / 8, t)))
        el.style.opacity = String((Math.sin(Math.PI * t) * 0.62 * entrada).toFixed(3))
      })

      const saiA = faixa(p, 0.02, 0.2)
      const a = textoA.current!
      a.style.opacity = String(1 - saiA)
      a.style.transform = `translate3d(0,${(-saiA * 48).toFixed(1)}px,0)`
      a.style.visibility = saiA >= 1 ? 'hidden' : 'visible'
      rodape.current!.style.opacity = String(1 - faixa(p, 0, 0.1))

      linhasB.forEach((el, n) => {
        const k = saida(faixa(p, 0.5 + n * 0.055, 0.66 + n * 0.055))
        el.style.opacity = String(k.toFixed(3))
        el.style.transform = `translate3d(0,${((1 - k) * 34).toFixed(1)}px,0) scale(${(0.86 + 0.14 * k).toFixed(4)})`
      })

      veu.current!.style.opacity = String(0.18 + 0.52 * faixa(p, 0.42, 0.62))
      cena.current!.style.transform = q > 0 ? `scale(${(1 - 0.07 * q).toFixed(4)})` : ''
      cobre.current!.style.opacity = String((q * 0.8).toFixed(3))
    }

    medir()
    desenhar()

    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: () => `+=${pal.clientHeight * 2}`,
      onUpdate: (s) => {
        p = s.progress
        desenhar()
      },
      onRefresh: (s) => {
        medir()
        p = s.progress
        desenhar()
      },
    })
    const st2 = ScrollTrigger.create({
      trigger: sec,
      start: () => `top+=${pal.clientHeight * 2} top`,
      end: () => `+=${pal.clientHeight}`,
      onUpdate: (s) => {
        q = s.progress
        desenhar()
      },
    })

    // o mouse inclina a janela de leve (só no começo, antes de abrir)
    let raf = 0
    const seguir = () => {
      mouse.ax += (mouse.x - mouse.ax) * 0.08
      mouse.ay += (mouse.y - mouse.ay) * 0.08
      if (p < 0.55) desenhar()
      raf = Math.abs(mouse.x - mouse.ax) + Math.abs(mouse.y - mouse.ay) > 0.002 ? requestAnimationFrame(seguir) : 0
    }
    const mover = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return
      mouse.x = (ev.clientX / W) * 2 - 1
      mouse.y = (ev.clientY / H) * 2 - 1
      if (!raf) raf = requestAnimationFrame(seguir)
    }
    const redimensionar = () => {
      medir()
      desenhar()
    }
    addEventListener('pointermove', mover, { passive: true })
    addEventListener('resize', redimensionar)

    return () => {
      st.kill()
      st2.kill()
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', mover)
      removeEventListener('resize', redimensionar)
    }
  }, [])

  return (
    <section id="inicio" className="hero" ref={secao} aria-label="Início">
      <div className="hero-palco" ref={palco}>
        <div className="hero-cena" ref={cena}>
          <div className="hero-janela" ref={janela}>
            <img
              ref={imagem}
              className="hero-foto"
              src={foto('corredor-1440.webp')}
              srcSet={`${foto('corredor-960.webp')} 960w, ${foto('corredor-1440.webp')} 1440w`}
              sizes="100vw"
              alt="Corredor da CM3 com os aparelhos de musculação e as luzes de LED em losango no teto"
              fetchPriority="high"
            />
            <div className="hero-sombra" />
            <div className="hero-veu" ref={veu} />
          </div>

          <svg className="hero-luzes" ref={luzes} aria-hidden="true">
            <path className="eco led-brilho" />
            <path className="eco led-brilho" />
            {Array.from({ length: MOLDURAS_DO_TUNEL }, (_, n) => (
              <path key={n} className="tunel led-nucleo" />
            ))}
            <path className="borda led-halo" />
            <path className="borda led-brilho" />
            <path className="borda led-nucleo" />
          </svg>

          <div className="hero-texto" ref={textoA}>
            <p className="rotulo hero-entra" style={i(0)}>
              {slogan}
            </p>
            <h1 className="hero-titulo">
              <span className="linha">
                <span className="hero-entra" style={i(1)}>
                  Seu próximo
                </span>
              </span>
              <span className="linha">
                <span className="hero-entra" style={i(2)}>
                  <em>nível</em> começa
                </span>
              </span>
              <span className="linha">
                <span className="hero-entra" style={i(3)}>
                  aqui.
                </span>
              </span>
            </h1>
            <p className="hero-sub hero-entra" style={i(4)}>
              Treinos personalizados, musculação, funcional, piscina e aulas coletivas, com acompanhamento de perto para você evoluir
              no seu ritmo.
            </p>
            <div className="hero-acoes hero-entra" style={i(5)}>
              <Botao href="#planos" texto="Ver planos" />
              <Botao href="#academia" texto="Conheça a CM3" variante="vidro" />
            </div>
          </div>

          <div className="hero-segundo" ref={textoB} aria-hidden="true">
            <p className="rotulo hb-linha">A CM3 por dentro</p>
            <p className="hb-titulo">
              <span className="hb-linha">Estrutura para treinar.</span>
              <span className="hb-linha">
                Gente para <em>acompanhar.</em>
              </span>
            </p>
            <p className="hb-linha hb-lista">Musculação · Funcional · Natação · Hidroginástica · Hidroterapia · Pilates · Ritmos</p>
          </div>

          <div className="hero-rodape" ref={rodape}>
            <div className="hero-rodape-linha hero-entra" style={i(6)}>
              <span>{contato.cref}</span>
              <span className="hero-role">
                <i />
                Role para entrar
              </span>
              <span className="hero-endereco">Seg a sex · 5h30 às 22h</span>
            </div>
          </div>
        </div>
        <div className="hero-cobre" ref={cobre} />
      </div>
    </section>
  )
}
