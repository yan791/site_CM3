/*
  Textos e dados fixos do site da CM3.
  Planos e equipe vêm da API (painel administrativo); a grade fica em grade.ts.
*/
import { foto } from '../lib/midia'

export const contato = {
  // link do Linktree que a academia já usa (WhatsApp e demais canais)
  conversa: 'https://linktr.ee/cm3academia?utm_source=linktree_profile_share&ltsid=2ec640fb-0fb7-4349-ab98-fbd7cdc383a9',
  instagram: 'https://www.instagram.com/academiacm3/',
  arroba: '@academiacm3',
  endereco: 'Praça Dídimo Carneiro',
  cidade: 'Centro · Surubim, PE · CEP 55750-000',
  mapa: 'https://www.google.com/maps?q=Pra%C3%A7a+D%C3%ADdimo+Carneiro,+Centro,+Surubim,+PE,+55750-000&output=embed',
  rota: 'https://www.google.com/maps/search/?api=1&query=Pra%C3%A7a+D%C3%ADdimo+Carneiro,+Centro,+Surubim,+PE,+55750-000',
  cref: 'CREF 000835 PJ',
}

/** as seções numeradas: viram o menu e os "níveis" do marcador lateral */
export const secoes = [
  { id: 'academia', nome: 'A academia' },
  { id: 'modalidades', nome: 'Modalidades' },
  { id: 'planos', nome: 'Planos' },
  { id: 'horarios', nome: 'Horários' },
  { id: 'equipe', nome: 'Equipe' },
  { id: 'contato', nome: 'Contato' },
] as const

export type IdSecao = (typeof secoes)[number]['id']
export const nivel = (id: IdSecao) => String(secoes.findIndex((s) => s.id === id) + 1).padStart(2, '0')

export type Modalidade = {
  slug: string
  nome: string
  linha: string
  /** nome da turma na grade de horários (para listar dias e horas) */
  grade?: string
  /** quando não há turma na grade */
  nota?: string
  foto: { src: string; pos: string; credito: string }
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=720&q=75&auto=format&fit=crop`
const daCM3 = 'Foto: CM3 Academia'
// as duas abaixo são ilustrativas: troque pelas fotos das turmas da CM3 quando chegarem
const ilustrativa = 'Foto ilustrativa · Unsplash'

export const modalidades: Modalidade[] = [
  {
    slug: 'musculacao',
    nome: 'Musculação',
    linha: 'Força, postura e disposição para o dia a dia, com treino personalizado e orientação em cada etapa.',
    nota: 'Avaliação inicial e acompanhamento',
    foto: { src: foto('musculacao-960.webp'), pos: '42% 40%', credito: daCM3 },
  },
  {
    slug: 'funcional',
    nome: 'Funcional',
    linha: 'Movimentos completos para ganhar força, equilíbrio e fôlego.',
    grade: 'Funcional',
    foto: { src: foto('funcional-960.webp'), pos: '40% 55%', credito: daCM3 },
  },
  {
    slug: 'ritmos',
    nome: 'Ritmos',
    linha: 'Música, coreografia e muita energia. Um treino que passa voando.',
    grade: 'Ritmos',
    foto: { src: unsplash('1524594152303-9fd13543fe6e'), pos: '55% 50%', credito: ilustrativa },
  },
  {
    slug: 'natacao',
    nome: 'Natação',
    linha: 'Confiança, técnica e diversão dentro da água, com turmas para crianças.',
    grade: 'Natação',
    foto: { src: foto('natacao-900.webp'), pos: '30% 55%', credito: daCM3 },
  },
  {
    slug: 'hidroginastica',
    nome: 'Hidroginástica',
    linha: 'Exercício na água, com baixo impacto nas articulações e muito bem-estar.',
    grade: 'Hidroginástica',
    foto: { src: foto('hidroginastica-597.webp'), pos: '50% 28%', credito: daCM3 },
  },
  {
    slug: 'hidroterapia',
    nome: 'Hidroterapia',
    linha: 'Movimento terapêutico na água, com cuidado em cada exercício.',
    grade: 'Hidroterapia',
    foto: { src: foto('hidroterapia-597.webp'), pos: '50% 30%', credito: daCM3 },
  },
  {
    slug: 'pilates',
    nome: 'Pilates',
    linha: 'Controle, respiração e fortalecimento do centro do corpo.',
    grade: 'Combo: Pilates',
    foto: { src: unsplash('1518611012118-696072aa579a'), pos: '30% 60%', credito: ilustrativa },
  },
]

export const pilares = [
  {
    icone: 'avaliacao',
    titulo: 'Treino personalizado',
    texto: 'Avaliação física e um treino montado para o seu objetivo, com orientação da equipe em cada etapa.',
  },
  {
    icone: 'estrutura',
    titulo: 'Estrutura completa',
    texto: 'Musculação, funcional, piscina e aulas coletivas no mesmo endereço, no Centro de Surubim.',
  },
  {
    icone: 'acolhimento',
    titulo: 'Ambiente acolhedor',
    texto: 'Um lugar para se sentir bem do primeiro ao último treino, com gente que torce pela sua evolução.',
  },
] as const

/** horário de funcionamento da musculação, como no perfil da academia no Instagram */
export const funcionamento = [
  { dia: 'Segunda a sexta', hora: '5h30 às 22h' },
  { dia: 'Sábado', hora: '8h às 12h' },
  { dia: 'Domingo', hora: 'Fechado' },
  { dia: 'Feriados', hora: '8h às 12h' },
]

export const slogan = 'Mais movimento, mais vida.'

/** objeções reais de quem pensa em começar, respondidas sem enrolação */
export const duvidas = [
  {
    p: 'Nunca treinei. Vou conseguir acompanhar?',
    r: 'Vai, sim. O treino começa pelo seu momento atual, com avaliação inicial e orientação da equipe para você aprender os movimentos com segurança.',
  },
  {
    p: 'Como faço minha matrícula?',
    r: 'Escolha um plano e fale com a equipe para confirmar valores, documentos e concluir a matrícula. Se preferir, crie sua conta na Área do aluno e a equipe confirma o plano com você.',
  },
  {
    p: 'Tem aula para crianças e para quem tem mais idade?',
    r: 'Tem. A natação tem turmas para crianças, e a hidroginástica e a hidroterapia são opções de baixo impacto para quem busca bem-estar e mobilidade.',
  },
  {
    p: 'Como reservo uma aula?',
    r: 'Crie sua conta na Área do aluno, entre e escolha a aula e uma data disponível nos próximos 14 dias.',
  },
  {
    p: 'Posso cancelar meu plano?',
    r: 'As condições de cancelamento dependem do plano contratado. Consulte a recepção e o contrato antes de aderir.',
  },
  {
    p: 'Qual é o horário de funcionamento?',
    r: 'A musculação funciona de segunda a sexta, das 5h30 às 22h, e aos sábados e feriados, das 8h às 12h. Aos domingos a academia fecha. As aulas coletivas seguem a grade desta página.',
  },
  {
    p: 'Quais formas de pagamento são aceitas?',
    r: 'Consulte a recepção para conhecer as formas de pagamento e as condições atuais.',
  },
]

export const faixas = {
  turquesa: ['Mais movimento, mais vida', 'Seu próximo nível começa aqui', 'Treinos personalizados'],
  escura: ['Musculação', 'Funcional', 'Natação', 'Hidroginástica', 'Hidroterapia', 'Pilates', 'Ritmos'],
}
