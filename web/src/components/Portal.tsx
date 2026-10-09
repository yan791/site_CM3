/*
  Área do aluno e painel administrativo (gaveta lateral).
  Usa a mesma API do Flask do site anterior: /api/login, /api/register,
  /api/me, /api/bookings e /api/admin/...
*/
import { useCallback, useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/cn'
import { api, dataBR, publico, recarregarPublico, type Eu, type Painel } from '../lib/api'
import { avisar } from '../lib/aviso'
import { fecharPortal, portal, type ModoAcesso } from '../lib/portal'
import { diasDaSemana } from '../dados/grade'
import { Logo } from './Logo'
import { Botao } from './Botao'
import { IconeFechar } from './icones'

const dadosDo = (f: HTMLFormElement) => Object.fromEntries(new FormData(f))
const isoLocal = (d: Date) => d.toLocaleDateString('en-CA')
const erro = (e: unknown) => (e instanceof Error ? e.message : 'Não foi possível concluir.')

/** próxima data (a partir de hoje) que cai no dia da semana da aula; 0 = segunda */
function proximaData(diaSemana: number) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + ((diaSemana - ((d.getDay() + 6) % 7) + 7) % 7))
  return isoLocal(d)
}

export function Portal() {
  const { aberto, modo, vez } = portal.usar()
  return <AnimatePresence>{aberto && <Gaveta key={vez} modoInicial={modo} />}</AnimatePresence>
}

type Tela = 'carregando' | 'acesso' | 'aluno' | 'admin'

function Gaveta({ modoInicial }: { modoInicial: ModoAcesso }) {
  const [tela, setTela] = useState<Tela>('carregando')
  const [modo, setModo] = useState<ModoAcesso>(modoInicial)
  const [eu, setEu] = useState<Eu | null>(null)
  const [painel, setPainel] = useState<Painel | null>(null)
  const fechar = useRef<HTMLButtonElement>(null)

  const carregar = useCallback(async () => {
    const d = await api<Eu>('/api/me')
    setEu(d)
    if (d.user.role === 'admin') {
      setPainel(await api<Painel>('/api/admin'))
      setTela('admin')
    } else setTela('aluno')
  }, [])

  useEffect(() => {
    carregar().catch(() => setTela('acesso'))
    fechar.current?.focus({ preventScroll: true })
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && fecharPortal()
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [carregar])

  async function sair() {
    try {
      await api('/api/logout', 'POST')
    } catch {
      /* a sessão já tinha acabado */
    }
    setEu(null)
    setPainel(null)
    setModo('login')
    setTela('acesso')
    avisar('Você saiu da conta.')
  }

  return (
    <div className="portal" role="dialog" aria-modal="true" aria-label="Área do aluno">
      <motion.div
        className="portal-fundo"
        onClick={fecharPortal}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      <motion.aside
        className="portal-painel"
        data-lenis-prevent
        initial={{ x: '104%' }}
        animate={{ x: 0 }}
        exit={{ x: '104%' }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="portal-topo">
          <Logo />
          <button ref={fechar} type="button" className="portal-fechar" onClick={fecharPortal} aria-label="Fechar a área do aluno">
            <IconeFechar />
          </button>
        </header>
        <div className="portal-corpo">
          <AnimatePresence mode="wait">
            <motion.div
              key={tela + (tela === 'acesso' ? modo : '')}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {tela === 'carregando' && (
                <div className="portal-carregando">
                  <span className="carregando-anel" aria-hidden="true" />
                  <span>Verificando seu acesso</span>
                </div>
              )}
              {tela === 'acesso' && <Acesso modo={modo} setModo={setModo} entrou={carregar} />}
              {tela === 'aluno' && eu && <AreaAluno eu={eu} recarregar={carregar} sair={sair} />}
              {tela === 'admin' && painel && <AreaAdmin painel={painel} setPainel={setPainel} sair={sair} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.aside>
    </div>
  )
}

/* ---------- peças de formulário ---------- */

function Campo({ rotulo, nome, ...resto }: { rotulo: string; nome: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <input name={nome} {...resto} />
    </label>
  )
}

function Escolha({ rotulo, nome, children, ...resto }: { rotulo: string; nome: string; children: ReactNode; required?: boolean; defaultValue?: string | number; value?: string | number; onChange?: (v: string) => void }) {
  const { onChange, ...props } = resto
  return (
    <label className="campo">
      <span>{rotulo}</span>
      <select name={nome} {...props} onChange={onChange ? (e) => onChange(e.target.value) : undefined}>
        {children}
      </select>
    </label>
  )
}

function Bloco({ titulo, children, className }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('portal-bloco', className)}>
      <h3>{titulo}</h3>
      {children}
    </section>
  )
}

function useEnvio() {
  const [enviando, setEnviando] = useState(false)
  const enviar = (acao: (form: HTMLFormElement) => Promise<void>) => async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setEnviando(true)
    try {
      await acao(form)
    } catch (err) {
      avisar(erro(err))
    } finally {
      setEnviando(false)
    }
  }
  return { enviando, enviar }
}

/** excluir pede um segundo toque para confirmar */
function Excluir({ onConfirmar }: { onConfirmar: () => void }) {
  const [certeza, setCerteza] = useState(false)
  useEffect(() => {
    if (!certeza) return
    const t = setTimeout(() => setCerteza(false), 3200)
    return () => clearTimeout(t)
  }, [certeza])
  return (
    <button type="button" className={cn('linha-acao', certeza && 'perigo')} onClick={() => (certeza ? onConfirmar() : setCerteza(true))}>
      {certeza ? 'Confirmar exclusão' : 'Excluir'}
    </button>
  )
}

/* ---------- entrar / criar conta ---------- */

function Acesso({ modo, setModo, entrou }: { modo: ModoAcesso; setModo: (m: ModoAcesso) => void; entrou: () => Promise<void> }) {
  const { enviando, enviar } = useEnvio()
  const cadastro = modo === 'register'

  const aoEnviar = enviar(async (form) => {
    await api(`/api/${cadastro ? 'register' : 'login'}`, 'POST', dadosDo(form))
    await entrou()
    avisar(cadastro ? 'Conta criada com sucesso.' : 'Bem-vindo à CM3!')
  })

  return (
    <>
      <p className="rotulo">Área do aluno</p>
      <h2 className="portal-titulo">{cadastro ? 'Crie sua conta.' : 'Bem-vindo de volta.'}</h2>
      <div className="abas" role="tablist" aria-label="Tipo de acesso">
        {(
          [
            ['login', 'Entrar'],
            ['register', 'Criar conta'],
          ] as const
        ).map(([k, v]) => (
          <button key={k} type="button" role="tab" aria-selected={modo === k} className={cn(modo === k && 'ativa')} onClick={() => setModo(k)}>
            {modo === k && <motion.span layoutId="aba-acesso" className="aba-marca" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
            <span>{v}</span>
          </button>
        ))}
      </div>
      <form className="formulario" onSubmit={aoEnviar}>
        {cadastro && (
          <>
            <Campo rotulo="Nome completo" nome="name" required minLength={2} autoComplete="name" />
            <Campo rotulo="Telefone" nome="phone" type="tel" autoComplete="tel" />
          </>
        )}
        <Campo rotulo="E-mail" nome="email" type="email" required autoComplete="email" />
        <Campo
          rotulo="Senha"
          nome="password"
          type="password"
          required
          minLength={8}
          autoComplete={cadastro ? 'new-password' : 'current-password'}
        />
        <Botao tipo="submit" texto={enviando ? 'Aguarde' : cadastro ? 'Criar conta' : 'Entrar'} largo desativado={enviando} />
      </form>
      <p className="portal-dica">
        {cadastro
          ? 'A conta permite reservar aulas. A contratação do plano é confirmada pela equipe.'
          : 'Funcionários entram com o acesso criado pelo administrador.'}
      </p>
    </>
  )
}

/* ---------- área do aluno ---------- */

function Cabeca({ rotulo, titulo, sair }: { rotulo: string; titulo: string; sair: () => void }) {
  return (
    <div className="portal-cabeca">
      <div>
        <p className="rotulo">{rotulo}</p>
        <h2 className="portal-titulo">{titulo}</h2>
      </div>
      <button type="button" className="linha-acao" onClick={sair}>
        Sair
      </button>
    </div>
  )
}

function AreaAluno({ eu, recarregar, sair }: { eu: Eu; recarregar: () => Promise<void>; sair: () => void }) {
  const { classes } = publico.usar()
  const u = eu.user
  const [aula, setAula] = useState<number>(classes[0]?.id ?? 0)
  const [data, setData] = useState(() => proximaData(classes[0]?.weekday ?? 0))
  const { enviando, enviar } = useEnvio()

  useEffect(() => {
    const c = classes.find((x) => x.id === aula) ?? classes[0]
    if (!c) return
    if (c.id !== aula) setAula(c.id)
    setData(proximaData(c.weekday))
  }, [aula, classes])

  const hoje = new Date()
  const limite = new Date()
  limite.setDate(limite.getDate() + 14)

  const reservar = enviar(async (form) => {
    await api('/api/bookings', 'POST', dadosDo(form))
    await recarregar()
    avisar('Aula reservada!')
  })

  async function cancelar(id: number) {
    try {
      await api(`/api/bookings/${id}`, 'DELETE')
      await recarregar()
      avisar('Reserva cancelada.')
    } catch (e) {
      avisar(erro(e))
    }
  }

  const numeros = [
    ['Meu plano', u.plan || 'A definir'],
    ['Vencimento', u.due_date ? dataBR(u.due_date) : 'A definir'],
    ['Frequência registrada', `${eu.attendance} ${eu.attendance === 1 ? 'dia' : 'dias'}`],
    ['Próximas reservas', String(eu.bookings.length)],
  ]

  return (
    <>
      <Cabeca rotulo="Área do aluno" titulo={`Olá, ${u.name.split(' ')[0]}.`} sair={sair} />
      <div className="portal-numeros">
        {numeros.map(([k, v]) => (
          <div key={k}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      <Bloco titulo="Meus treinos">
        {eu.workouts.length ? (
          eu.workouts.map((w, i) => (
            <div className="portal-linha" key={i}>
              <div>
                <strong>{w.title}</strong>
                <small className="quebra">{w.details}</small>
              </div>
            </div>
          ))
        ) : (
          <p className="vazio">Seu treino ainda não foi cadastrado pela equipe.</p>
        )}
      </Bloco>

      <Bloco titulo="Reservar aula">
        {classes.length ? (
          <form className="formulario" onSubmit={reservar}>
            <Escolha rotulo="Modalidade e horário" nome="class_id" required value={aula} onChange={(v) => setAula(Number(v))}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} · {diasDaSemana[c.weekday]} {c.time}
                </option>
              ))}
            </Escolha>
            <Campo
              rotulo="Data"
              nome="date"
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={isoLocal(hoje)}
              max={isoLocal(limite)}
            />
            <Botao tipo="submit" texto={enviando ? 'Aguarde' : 'Reservar vaga'} largo desativado={enviando} />
          </form>
        ) : (
          <p className="vazio">Nenhuma aula disponível para reserva no momento.</p>
        )}
        <p className="portal-dica">Reservas disponíveis para os próximos 14 dias, sujeitas à lotação da turma.</p>
      </Bloco>

      <Bloco titulo="Minhas reservas">
        {eu.bookings.length ? (
          eu.bookings.map((b) => (
            <div className="portal-linha" key={b.id}>
              <div>
                <strong>
                  {b.title} · {b.time}
                </strong>
                <small>{dataBR(b.class_date)}</small>
              </div>
              <button type="button" className="linha-acao" onClick={() => cancelar(b.id)}>
                Cancelar
              </button>
            </div>
          ))
        ) : (
          <p className="vazio">Nenhuma aula reservada.</p>
        )}
      </Bloco>

      <Bloco titulo="Meus dados">
        <div className="portal-linha">
          <div>
            <strong>{u.name}</strong>
            <small>
              {u.email} · {u.phone || 'Telefone não informado'}
            </small>
          </div>
        </div>
      </Bloco>
    </>
  )
}

/* ---------- painel administrativo ---------- */

type Entidade = 'students' | 'plans' | 'teachers' | 'classes'
type TipoCampo = 'text' | 'email' | 'tel' | 'password' | 'number' | 'url' | 'date' | 'time' | 'plans' | 'teachers' | 'weekdays'

const campos: Record<Entidade, [string, string, TipoCampo][]> = {
  students: [
    ['name', 'Nome', 'text'],
    ['email', 'E-mail', 'email'],
    ['phone', 'Telefone', 'tel'],
    ['password', 'Senha inicial', 'password'],
    ['plan_id', 'Plano', 'plans'],
    ['due_date', 'Vencimento', 'date'],
  ],
  plans: [
    ['name', 'Nome', 'text'],
    ['price', 'Valor mensal (R$)', 'number'],
    ['period', 'Período', 'text'],
    ['description', 'Benefícios (separe com •)', 'text'],
  ],
  teachers: [
    ['name', 'Nome', 'text'],
    ['specialty', 'Especialidade', 'text'],
    ['photo', 'URL da foto', 'url'],
  ],
  classes: [
    ['title', 'Modalidade', 'text'],
    ['teacher_id', 'Professor', 'teachers'],
    ['weekday', 'Dia da semana', 'weekdays'],
    ['time', 'Horário', 'time'],
    ['capacity', 'Vagas', 'number'],
  ],
}
const nomes: Record<Entidade, string> = { students: 'Alunos', plans: 'Planos', teachers: 'Professores', classes: 'Aulas' }
const opcionais = ['phone', 'photo', 'due_date']

function AreaAdmin({ painel, setPainel, sair }: { painel: Painel; setPainel: (p: Painel) => void; sair: () => void }) {
  const [aba, setAba] = useState<Entidade>('students')
  const [editando, setEditando] = useState<number | null>(null)
  const { enviando, enviar } = useEnvio()

  const atualizar = async () => {
    setPainel(await api<Painel>('/api/admin'))
    recarregarPublico()
  }

  const cadastrar = enviar(async (form) => {
    await api(`/api/admin/${aba}`, 'POST', dadosDo(form))
    await atualizar()
    form.reset()
    avisar('Cadastro realizado.')
  })

  const extra = (entidade: 'workouts' | 'attendance') =>
    enviar(async (form) => {
      await api(`/api/admin/${entidade}`, 'POST', dadosDo(form))
      form.reset()
      avisar(entidade === 'workouts' ? 'Treino cadastrado.' : 'Frequência registrada.')
    })

  const atualizarAluno = (id: number) =>
    enviar(async (form) => {
      await api(`/api/admin/students/${id}`, 'PATCH', dadosDo(form))
      await atualizar()
      setEditando(null)
      avisar('Plano atualizado.')
    })

  async function excluir(id: number) {
    try {
      await api(`/api/admin/${aba}/${id}`, 'DELETE')
      await atualizar()
      avisar('Item excluído.')
    } catch (e) {
      avisar(erro(e))
    }
  }

  function controle([nome, rotulo, tipo]: [string, string, TipoCampo]) {
    if (tipo === 'plans')
      return (
        <Escolha key={nome} rotulo={rotulo} nome={nome}>
          <option value="">Sem plano</option>
          {painel.plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Escolha>
      )
    if (tipo === 'teachers')
      return (
        <Escolha key={nome} rotulo={rotulo} nome={nome} required>
          {painel.teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Escolha>
      )
    if (tipo === 'weekdays')
      return (
        <Escolha key={nome} rotulo={rotulo} nome={nome}>
          {diasDaSemana.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </Escolha>
      )
    return (
      <Campo
        key={nome}
        rotulo={rotulo}
        nome={nome}
        type={tipo}
        required={!opcionais.includes(nome)}
        {...(nome === 'price' ? { step: '0.01', min: '0' } : {})}
        {...(nome === 'capacity' ? { min: '1' } : {})}
        {...(nome === 'password' ? { minLength: 8, autoComplete: 'new-password' } : {})}
      />
    )
  }

  const lista = aba === 'students' ? [] : (painel[aba] as { id: number; name?: string; title?: string; specialty?: string; description?: string; teacher?: string }[])

  return (
    <>
      <Cabeca rotulo="Painel CM3" titulo="Administração." sair={sair} />
      <div className="abas abas-admin" role="tablist" aria-label="Cadastros">
        {(Object.keys(nomes) as Entidade[]).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={aba === k}
            className={cn(aba === k && 'ativa')}
            onClick={() => {
              setAba(k)
              setEditando(null)
            }}
          >
            {aba === k && <motion.span layoutId="aba-admin" className="aba-marca" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
            <span>{nomes[k]}</span>
          </button>
        ))}
      </div>

      <Bloco titulo={`Cadastrar ${nomes[aba].toLowerCase()}`}>
        <form className="formulario" onSubmit={cadastrar} key={aba}>
          {campos[aba].map(controle)}
          <Botao tipo="submit" texto={enviando ? 'Aguarde' : 'Salvar'} largo desativado={enviando} />
        </form>
      </Bloco>

      <Bloco titulo={`${nomes[aba]} cadastrados`}>
        {aba === 'students' ? (
          painel.students.length ? (
            painel.students.map((s) => (
              <div key={s.id} className="portal-item">
                <div className="portal-linha">
                  <div>
                    <strong>{s.name}</strong>
                    <small>
                      {s.email} · {s.plan ?? 'Sem plano'}
                      {s.due_date ? ` · vence ${dataBR(s.due_date)}` : ''}
                    </small>
                  </div>
                  <button type="button" className="linha-acao" onClick={() => setEditando(editando === s.id ? null : s.id)}>
                    {editando === s.id ? 'Fechar' : 'Plano e vencimento'}
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {editando === s.id && (
                    <motion.form
                      className="formulario portal-edicao"
                      onSubmit={atualizarAluno(s.id)}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Escolha rotulo="Plano" nome="plan_id" defaultValue={s.plan_id ?? ''}>
                        <option value="">Sem plano</option>
                        {painel.plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </Escolha>
                      <Campo rotulo="Vencimento" nome="due_date" type="date" defaultValue={s.due_date ?? ''} />
                      <Botao tipo="submit" texto="Atualizar" largo desativado={enviando} />
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            ))
          ) : (
            <p className="vazio">Nenhum aluno cadastrado.</p>
          )
        ) : lista.length ? (
          lista.map((x) => (
            <div key={x.id} className="portal-linha">
              <div>
                <strong>{x.name || x.title}</strong>
                <small>{x.specialty || x.description || x.teacher || ''}</small>
              </div>
              <Excluir onConfirmar={() => excluir(x.id)} />
            </div>
          ))
        ) : (
          <p className="vazio">Nenhum item cadastrado.</p>
        )}
      </Bloco>

      {aba === 'students' && (
        <Bloco titulo="Treinos e frequência">
          {painel.students.length ? (
            <>
              <form className="formulario" onSubmit={extra('workouts')}>
                <Escolha rotulo="Aluno" nome="user_id">
                  {painel.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Escolha>
                <Campo rotulo="Título do treino" nome="title" required />
                <label className="campo">
                  <span>Exercícios e orientações</span>
                  <textarea name="details" required rows={4} />
                </label>
                <Botao tipo="submit" texto="Cadastrar treino" largo desativado={enviando} />
              </form>
              <form className="formulario separado" onSubmit={extra('attendance')}>
                <Escolha rotulo="Registrar presença" nome="user_id">
                  {painel.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Escolha>
                <Campo rotulo="Data" nome="day" type="date" defaultValue={isoLocal(new Date())} />
                <Botao tipo="submit" texto="Registrar frequência" largo desativado={enviando} />
              </form>
            </>
          ) : (
            <p className="vazio">Cadastre um aluno para lançar treinos e frequência.</p>
          )}
        </Bloco>
      )}
    </>
  )
}
