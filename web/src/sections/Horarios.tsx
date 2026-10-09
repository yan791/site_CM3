import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/cn'
import { abrirPortal } from '../lib/portal'
import { Clock } from 'lucide-react'
import { funcionamento, nivel } from '../dados/site'
import { dias, diasCurtos, grade, nomeCurto, proximaAula, totalDeAulas, turmas } from '../dados/grade'
import { Botao } from '../components/Botao'

/*
  Nível 04. A grade real da semana. Filtrar (ou passar o mouse numa aula)
  acende a mesma turma em todos os dias. No celular, um dia por vez.
*/
export function Horarios() {
  const hoje = (new Date().getDay() + 6) % 7
  const [filtro, setFiltro] = useState<string | null>(null)
  const [foco, setFoco] = useState<string | null>(null)
  const [dia, setDia] = useState(hoje < 5 ? hoje : 0)
  const proxima = useMemo(() => proximaAula(), [])

  const alvo = foco ?? filtro
  const estado = (t: string) => (alvo ? (t === alvo ? 'acesa' : 'apagada') : '')
  const doDia = grade.flatMap(({ hora, porDia }) => porDia[dia].map((t) => ({ hora, t })))

  return (
    <section id="horarios" className="horarios escuro">
      <div className="conteudo">
        <header className="hor-topo">
          <div>
            <p className="rotulo">Nível {nivel('horarios')} · Horários</p>
            <h2 className="titulo">
              O melhor horário
              <br />
              <em>é o seu.</em>
            </h2>
          </div>
          <div className="hor-dados">
            <div className="hor-numero">
              <strong>{totalDeAulas}</strong>
              <span>
                aulas coletivas
                <br />
                por semana
              </span>
            </div>
            {proxima && (
              <div className="hor-proxima">
                <span className="hor-proxima-rotulo">
                  <i className="pulso" aria-hidden="true" />
                  Próxima aula
                </span>
                <strong>
                  {proxima.quando}, {proxima.hora}
                </strong>
                <small>{proxima.turmas.map(nomeCurto).join(' e ')}</small>
              </div>
            )}
          </div>
        </header>

        <div className="hor-funcionamento">
          <p className="hor-funcionamento-titulo">Funcionamento da musculação</p>
          <ul>
            {funcionamento.map((f) => (
              <li key={f.dia} className={cn(f.hora === 'Fechado' && 'fechado')}>
                <span className="icone-quadrado">
                  <Clock strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span>
                  <b>{f.dia}</b>
                  <small>{f.hora}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hor-filtros" role="group" aria-label="Filtrar por modalidade">
          <button type="button" className={cn('filtro', !filtro && 'ativo')} aria-pressed={!filtro} onClick={() => setFiltro(null)}>
            Todas
          </button>
          {turmas.map((t) => (
            <button key={t} type="button" className={cn('filtro', filtro === t && 'ativo')} aria-pressed={filtro === t} onClick={() => setFiltro(filtro === t ? null : t)}>
              {nomeCurto(t)}
            </button>
          ))}
        </div>

        <div className="hor-tabela" role="table" aria-label="Grade semanal de aulas coletivas">
          <div className="hor-linha hor-cabeca" role="row">
            <span className="hor-hora" role="columnheader">
              Hora
            </span>
            {dias.map((d, n) => (
              <span key={d} role="columnheader" className={cn('hor-dia', n === hoje && 'hoje')}>
                {d}
                {n === hoje && <em>Hoje</em>}
              </span>
            ))}
          </div>
          {grade.map(({ hora, porDia }) => (
            <div className="hor-linha" role="row" key={hora}>
              <span className="hor-hora" role="rowheader">
                {hora}
              </span>
              {porDia.map((aulas, d) => (
                <div key={d} role="cell" className={cn('hor-celula', d === hoje && 'hoje')}>
                  {aulas.map((t) => (
                    <span key={t} className={cn('aula', estado(t))} onPointerEnter={() => setFoco(t)} onPointerLeave={() => setFoco(null)}>
                      {nomeCurto(t)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="hor-celular">
          <div className="abas abas-dias" role="tablist" aria-label="Dia da semana">
            {diasCurtos.map((d, n) => (
              <button key={d} type="button" role="tab" aria-selected={dia === n} className={cn(dia === n && 'ativa')} onClick={() => setDia(n)}>
                {dia === n && <motion.span layoutId="aba-dia" className="aba-marca" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <span>{d}</span>
                {n === hoje && <i className="hoje-ponto" aria-label="hoje" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={dia}
              className="hor-lista"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {doDia.map(({ hora, t }) => (
                <li key={hora + t} className={cn(estado(t))}>
                  <time>{hora}</time>
                  <span>{nomeCurto(t)}</span>
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>

        <footer className="hor-rodape">
          <p>Grade das aulas coletivas sujeita a alterações. Confirme vagas e horários em feriados com a recepção.</p>
          <Botao texto="Reservar uma aula" variante="vidro" onClick={() => abrirPortal('login')} />
        </footer>
      </div>
    </section>
  )
}
