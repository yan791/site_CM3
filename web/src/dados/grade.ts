/*
  Grade semanal de aulas coletivas (segunda a sexta).
  Mesma grade que estava no app.js do site anterior. Para mudar um horário,
  troque a turma na posição do dia: [segunda, terça, quarta, quinta, sexta].
*/
export const linhasDaGrade: { hora: string; aulas: [string, string, string, string, string] }[] = [
  { hora: '06h', aulas: ['', 'Ritmos', '', 'Ritmos', ''] },
  { hora: '07h', aulas: ['Hidroginástica', 'Combo: Pilates', 'Hidroginástica', 'Combo: Pilates', 'Hidroginástica'] },
  { hora: '08h', aulas: ['Hidroginástica', 'Combo: Pilates', 'Hidroginástica', 'Combo: Pilates', 'Hidroginástica'] },
  { hora: '09h', aulas: ['Natação', '', 'Natação', '', ''] },
  { hora: '10h', aulas: ['Natação', '', 'Natação', '', ''] },
  { hora: '13h', aulas: ['Hidroterapia', '', 'Hidroterapia', '', 'Hidroterapia'] },
  { hora: '14h', aulas: ['Natação', '', 'Natação', '', ''] },
  { hora: '15h', aulas: ['Natação', '', 'Natação', '', ''] },
  { hora: '16h', aulas: ['Hidroginástica', 'Combo: Pilates', 'Hidroginástica', 'Combo: Pilates', 'Hidroginástica'] },
  { hora: '16h', aulas: ['', 'Funcional', '', 'Funcional', ''] },
  { hora: '17h', aulas: ['Hidroginástica', 'Combo: Pilates', 'Hidroginástica', 'Combo: Pilates', 'Hidroginástica'] },
  { hora: '19h', aulas: ['Ritmos', '', 'Ritmos', '', ''] },
  { hora: '19h', aulas: ['Hidroginástica', '', 'Hidroginástica', '', 'Hidroginástica'] },
]

export const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
export const diasCurtos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
export const diasDaSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

/** horas únicas, em ordem, cada uma com as turmas de cada dia (linhas repetidas se juntam) */
export const grade = (() => {
  const mapa = new Map<string, string[][]>()
  for (const l of linhasDaGrade) {
    if (!mapa.has(l.hora)) mapa.set(l.hora, [[], [], [], [], []])
    l.aulas.forEach((a, d) => a && mapa.get(l.hora)![d].push(a))
  }
  return [...mapa.entries()].map(([hora, porDia]) => ({ hora, porDia }))
})()

export const turmas = [...new Set(linhasDaGrade.flatMap((l) => l.aulas.filter(Boolean)))]
export const totalDeAulas = linhasDaGrade.reduce((n, l) => n + l.aulas.filter(Boolean).length, 0)

/** "Combo: Pilates" vira "Pilates" nos lugares com pouco espaço */
export const nomeCurto = (t: string) => t.replace(/^Combo:\s*/, '')

/** dias e horas de uma turma, agrupando horas que caem nos mesmos dias */
export function resumoDaTurma(turma: string) {
  const porHora = new Map<string, Set<number>>()
  for (const l of linhasDaGrade)
    l.aulas.forEach((a, d) => {
      if (a !== turma) return
      if (!porHora.has(l.hora)) porHora.set(l.hora, new Set())
      porHora.get(l.hora)!.add(d)
    })
  const grupos = new Map<string, string[]>()
  for (const [hora, ds] of porHora) {
    const chave = [...ds].sort().map((d) => diasCurtos[d]).join(' · ')
    grupos.set(chave, [...(grupos.get(chave) ?? []), hora])
  }
  return [...grupos.entries()].map(([dias, horas]) => ({ dias, horas }))
}

/** a próxima turma a partir de agora (hoje ou nos dias seguintes) */
export function proximaAula(agora = new Date()) {
  const hoje = (agora.getDay() + 6) % 7 // 0 = segunda
  const horaAgora = agora.getHours() + agora.getMinutes() / 60
  for (let i = 0; i < 7; i++) {
    const d = (hoje + i) % 7
    if (d > 4) continue
    for (const { hora, porDia } of grade) {
      const h = parseInt(hora, 10)
      if (i === 0 && h <= horaAgora) continue
      if (porDia[d].length) return { quando: i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : dias[d], hora, turmas: porDia[d] }
    }
  }
  return null
}
