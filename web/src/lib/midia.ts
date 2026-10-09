import { useEffect, useState } from 'react'

/** celular ou tablet em pé: mesma regra usada no CSS */
export const CONSULTA_CELULAR = '(max-width: 860px), (max-aspect-ratio: 11/10)'

export function useConsulta(q: string) {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const f = () => setV(m.matches)
    f()
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [q])
  return v
}

export const useCelular = () => useConsulta(CONSULTA_CELULAR)
export const ehCelular = () => window.matchMedia(CONSULTA_CELULAR).matches

export const foto = (nome: string) => `${import.meta.env.BASE_URL}fotos/${nome}`

export const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const faixa = (v: number, a: number, b: number) => limitar((v - a) / (b - a))
export const misturar = (a: number, b: number, t: number) => a + (b - a) * t
export const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const saida = (t: number) => 1 - Math.pow(1 - t, 3)
