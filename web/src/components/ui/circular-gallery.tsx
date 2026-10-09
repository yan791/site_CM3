/*
  CircularGallery (21st.dev), adaptado ao site da CM3.
  Mantém a mesma ideia e as mesmas props do original (items, radius,
  autoRotateSpeed) e acrescenta:
  - itemWidth / itemHeight: tamanho dos cartões (padrão 300x400, como o original);
  - getRotation: quando informado, a rotação vem de fora (a rolagem da seção);
  - onActiveChange: avisa qual cartão está de frente.
  O giro é escrito direto no DOM a cada quadro (sem re-render do React) e
  para quando a galeria sai da tela.
*/
import React, { useEffect, useImperativeHandle, useRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface GalleryItem {
  common: string
  binomial: string
  photo: {
    url: string
    text: string
    pos?: string
    by: string
  }
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[]
  /** Distância dos cartões até o centro. */
  radius?: number
  /** Velocidade do giro automático quando a página não está rolando (modo original). */
  autoRotateSpeed?: number
  itemWidth?: number
  itemHeight?: number
  /** Rotação em graus controlada de fora; desliga o giro pela rolagem da página e o automático. */
  getRotation?: () => number
  onActiveChange?: (index: number) => void
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    { items, className, radius = 600, autoRotateSpeed = 0.02, itemWidth = 300, itemHeight = 400, getRotation, onActiveChange, ...props },
    ref,
  ) => {
    const raiz = useRef<HTMLDivElement>(null)
    const anel = useRef<HTMLDivElement>(null)
    const cartoes = useRef<(HTMLDivElement | null)[]>([])
    const legendas = useRef<(HTMLDivElement | null)[]>([])
    const externo = useRef(getRotation)
    const aviso = useRef(onActiveChange)
    externo.current = getRotation
    aviso.current = onActiveChange
    useImperativeHandle(ref, () => raiz.current!)

    const anglePerItem = 360 / items.length

    useEffect(() => {
      let atual = externo.current ? externo.current() : 0
      let rolagem = 0
      let automatico = 0
      let ultimaRolagem = 0
      let frente = -1
      let raf = 0

      // modo original: a rolagem da página inteira gira a galeria
      const aoRolar = () => {
        if (externo.current) return
        const altura = document.documentElement.scrollHeight - window.innerHeight
        rolagem = altura > 0 ? (window.scrollY / altura) * 360 : 0
        ultimaRolagem = performance.now()
      }

      const quadro = (agora: number) => {
        let alvo: number
        if (externo.current) alvo = externo.current()
        else {
          if (agora - ultimaRolagem > 150) automatico += autoRotateSpeed
          alvo = rolagem + automatico
        }
        atual += (alvo - atual) * 0.12
        if (Math.abs(alvo - atual) < 0.005) atual = alvo
        if (anel.current) anel.current.style.transform = `rotateY(${atual.toFixed(3)}deg)`

        cartoes.current.forEach((el, i) => {
          if (!el) return
          const relativo = (((i * anglePerItem + atual) % 360) + 360) % 360
          const normal = relativo > 180 ? 360 - relativo : relativo
          el.style.opacity = String(Math.max(0.3, 1 - normal / 180).toFixed(3))
          const legenda = legendas.current[i]
          if (legenda) legenda.style.opacity = normal > 80 ? '0' : '1'
        })

        const i = (((Math.round(-atual / anglePerItem) % items.length) + items.length) % items.length)
        if (i !== frente) {
          frente = i
          aviso.current?.(i)
        }
        raf = requestAnimationFrame(quadro)
      }

      const io = new IntersectionObserver(([e]) => {
        cancelAnimationFrame(raf)
        raf = e.isIntersecting ? requestAnimationFrame(quadro) : 0
      })
      if (raiz.current) io.observe(raiz.current)
      window.addEventListener('scroll', aoRolar, { passive: true })
      return () => {
        io.disconnect()
        cancelAnimationFrame(raf)
        window.removeEventListener('scroll', aoRolar)
      }
    }, [items.length, anglePerItem, autoRotateSpeed])

    return (
      <div
        ref={raiz}
        role="region"
        aria-label="Galeria circular"
        className={cn('relative w-full h-full flex items-center justify-center', className)}
        style={{ perspective: '2000px' }}
        {...props}
      >
        <div ref={anel} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => (
            <div
              key={item.photo.url + i}
              ref={(el) => void (cartoes.current[i] = el)}
              role="group"
              aria-label={item.common}
              className="absolute"
              style={{
                width: itemWidth,
                height: itemHeight,
                transform: `rotateY(${i * anglePerItem}deg) translateZ(${radius}px)`,
                left: '50%',
                top: '50%',
                marginLeft: -itemWidth / 2,
                marginTop: -itemHeight / 2,
              }}
            >
              <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group border border-border bg-card/70 backdrop-blur-lg">
                <img
                  src={item.photo.url}
                  alt={item.photo.text}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: item.photo.pos || 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101719] via-[#101719]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-tr from-[#009B98]/45 to-transparent mix-blend-screen" />
                <div ref={(el) => void (legendas.current[i] = el)} className="absolute bottom-0 left-0 w-full p-4 text-white transition-opacity duration-300">
                  <h2 className="text-xl font-extrabold leading-tight">{item.common}</h2>
                  <em className="block text-sm not-italic opacity-85">{item.binomial}</em>
                  <p className="text-[0.65rem] mt-2 opacity-60 uppercase tracking-wider">{item.photo.by}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
)

CircularGallery.displayName = 'CircularGallery'

export { CircularGallery }
