import { criarLoja } from './loja'
import { pausarRolagem } from './scroll'

export type ModoAcesso = 'login' | 'register'
export const portal = criarLoja<{ aberto: boolean; modo: ModoAcesso; vez: number }>({ aberto: false, modo: 'login', vez: 0 })

export function abrirPortal(modo: ModoAcesso = 'login') {
  portal.definir((p) => ({ aberto: true, modo, vez: p.vez + 1 }))
  pausarRolagem(true, 'portal')
}

export function fecharPortal() {
  portal.definir((p) => ({ ...p, aberto: false }))
  pausarRolagem(false, 'portal')
}
