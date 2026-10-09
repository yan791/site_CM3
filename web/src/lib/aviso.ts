import { criarLoja } from './loja'

export const avisos = criarLoja<{ id: number; texto: string } | null>(null)
let tempo = 0

export function avisar(texto: string) {
  avisos.definir({ id: Date.now(), texto })
  clearTimeout(tempo)
  tempo = window.setTimeout(() => avisos.definir(null), 3600)
}
