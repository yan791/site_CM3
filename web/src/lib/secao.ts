import { useEffect } from 'react'
import { criarLoja } from './loja'
import { secoes } from '../dados/site'

/** seção que está no meio da tela agora ('inicio' no topo) */
export const secaoAtiva = criarLoja<string>('inicio')

export function useObservarSecoes() {
  useEffect(() => {
    const ids = ['inicio', ...secoes.map((s) => s.id)]
    const visiveis = new Set<string>()
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visiveis.add(e.target.id)
          else visiveis.delete(e.target.id)
        }
        // a última da ordem da página que cruza a faixa central vence
        const atual = [...ids].reverse().find((id) => visiveis.has(id))
        if (atual) secaoAtiva.definir(atual)
      },
      { rootMargin: '-48% 0px -48% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
}
