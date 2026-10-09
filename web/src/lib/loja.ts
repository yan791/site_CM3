import { useSyncExternalStore } from 'react'

/** estado global pequeno, sem biblioteca: valor + inscritos */
export function criarLoja<T>(inicial: T) {
  let valor = inicial
  const inscritos = new Set<() => void>()
  return {
    ler: () => valor,
    definir(novo: T | ((v: T) => T)) {
      valor = typeof novo === 'function' ? (novo as (v: T) => T)(valor) : novo
      inscritos.forEach((f) => f())
    },
    usar(): T {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSyncExternalStore(
        (f) => {
          inscritos.add(f)
          return () => inscritos.delete(f)
        },
        () => valor,
      )
    },
  }
}
