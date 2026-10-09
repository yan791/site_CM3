import { useEffect } from 'react'
import { criarLoja } from './loja'
import { ScrollTrigger } from './scroll'

export type Plano = { id: number; name: string; price: number; period: string; description: string }
export type Professor = { id: number; name: string; specialty: string; photo: string }
export type Aula = { id: number; title: string; teacher_id: number; weekday: number; time: string; capacity: number; teacher?: string }
export type Publico = { plans: Plano[]; teachers: Professor[]; classes: Aula[] }

export type Usuario = { id: number; name: string; email: string; phone: string; role: 'student' | 'admin'; due_date: string | null; plan: string | null; price: number | null }
export type Eu = {
  user: Usuario
  workouts: { title: string; details: string }[]
  attendance: number
  bookings: { id: number; class_date: string; title: string; time: string }[]
}
export type Aluno = { id: number; name: string; email: string; phone: string; plan_id: number | null; due_date: string | null; plan: string | null }
export type Painel = { students: Aluno[]; plans: Plano[]; teachers: Professor[]; classes: Aula[] }

export async function api<T = { ok: boolean }>(caminho: string, metodo = 'GET', corpo?: unknown): Promise<T> {
  const r = await fetch(caminho, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
    credentials: 'same-origin',
  })
  const d = await r.json().catch(() => ({ error: 'Resposta inválida do servidor.' }))
  if (!r.ok) throw new Error(d.error || 'Não foi possível concluir.')
  return d as T
}

/*
  Os mesmos dados iniciais do app.py. Aparecem enquanto a API responde
  (ou se o site for aberto sem o Flask), para a página nunca ficar vazia.
*/
const reserva: Publico = {
  plans: [
    { id: 1, name: 'Mensal', price: 119.9, period: 'mês', description: 'Musculação • avaliação inicial • acompanhamento' },
    { id: 2, name: 'Trimestral', price: 99.9, period: 'mês', description: 'Musculação • aulas coletivas • fidelidade de 3 meses' },
    { id: 3, name: 'Anual', price: 89.9, period: 'mês', description: 'Acesso completo • aulas coletivas • fidelidade de 12 meses' },
  ],
  teachers: [
    { id: 1, name: 'Equipe CM3', specialty: 'Musculação e acompanhamento', photo: '' },
    { id: 2, name: 'Instrutor(a) de funcional', specialty: 'Treinamento funcional', photo: '' },
    { id: 3, name: 'Instrutor(a) aquático(a)', specialty: 'Natação e hidroginástica', photo: '' },
  ],
  classes: [],
}

export const publico = criarLoja<Publico & { carregado: boolean }>({ ...reserva, carregado: false })

export async function recarregarPublico() {
  try {
    const d = await api<Publico>('/api/public')
    publico.definir({ ...d, carregado: true })
  } catch {
    publico.definir((p) => ({ ...p, carregado: true }))
  }
  requestAnimationFrame(() => ScrollTrigger.refresh())
}

let pedido = false
export function usePublico() {
  useEffect(() => {
    if (pedido) return
    pedido = true
    recarregarPublico()
  }, [])
  return publico.usar()
}

export const dinheiro = (n: number) => Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const dataBR = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR')
