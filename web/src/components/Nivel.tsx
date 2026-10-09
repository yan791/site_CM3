import { cn } from '../lib/cn'
import { secaoAtiva } from '../lib/secao'
import { portal } from '../lib/portal'
import { nivel, secoes, type IdSecao } from '../dados/site'

/*
  O marcador de nível, no canto: a página é uma subida de "níveis",
  como o slogan da academia. Cada losango acende quando a seção chega.
*/
export function Nivel() {
  const ativa = secaoAtiva.usar()
  const { aberto } = portal.usar()
  const indice = secoes.findIndex((s) => s.id === ativa)
  const visivel = indice >= 0 && !aberto

  return (
    <div className={cn('nivel', visivel && 'visivel')} aria-hidden="true">
      <span className="nivel-rotulo">Nível</span>
      <span className="nivel-numero">{indice >= 0 ? nivel(ativa as IdSecao) : '01'}</span>
      <span className="nivel-pips">
        {secoes.map((s, i) => (
          <i key={s.id} className={cn(i <= indice && 'aceso', i === indice && 'atual')} />
        ))}
      </span>
      <span className="nivel-nome">{indice >= 0 ? secoes[indice].nome : ''}</span>
    </div>
  )
}
