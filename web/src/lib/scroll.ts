/*
  Rolagem suave (Lenis) ligada ao GSAP ScrollTrigger.
  Por decisão do projeto, a animação fica sempre ligada.
*/
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
/** quem pediu para parar a rolagem (menu, área do aluno, abertura). Só volta quando todos soltam. */
const travas = new Set<string>()

export function iniciarRolagem() {
  if (lenis) return lenis
  lenis = new Lenis({ duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3.4), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  if (travas.size) lenis.stop()
  return lenis
}

/** velocidade atual da rolagem (px por quadro), usada pelas faixas que aceleram */
export const velocidade = () => lenis?.velocity ?? 0

export function rolarPara(alvo: string | number | HTMLElement, o: { imediato?: boolean; deslocamento?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(alvo, { immediate: o.imediato, offset: o.deslocamento ?? 0, duration: 1.6, force: true })
    return
  }
  const el = typeof alvo === 'string' ? document.querySelector(alvo) : typeof alvo === 'number' ? null : alvo
  const y = typeof alvo === 'number' ? alvo : (el?.getBoundingClientRect().top ?? 0) + scrollY + (o.deslocamento ?? 0)
  window.scrollTo({ top: y, behavior: o.imediato ? 'auto' : 'smooth' })
}

export function pausarRolagem(p: boolean, quem = 'geral') {
  if (p) travas.add(quem)
  else travas.delete(quem)
  document.documentElement.classList.toggle('travado', travas.size > 0)
  if (!lenis) return
  if (travas.size) lenis.stop()
  else lenis.start()
}

export { gsap, ScrollTrigger }
