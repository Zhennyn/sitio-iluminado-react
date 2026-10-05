// Datas são guardadas como texto "AAAA-MM-DD" (sem fuso horário) e meses como "AAAA-MM".

const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const hoje = () => toISO(new Date())
export const addDias = (iso, n) => {
  const d = parseISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
export const diffDias = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000)
export const diaSemana = (iso) => parseISO(iso).getDay()

export const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const fmtData = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—')
export const fmtDataCurta = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '—')
export const fmtHora = (h) => (h ? h.replace(':00', 'h').replace(':', 'h') : '')

export const mesDe = (iso) => iso.slice(0, 7)
export const mesAtual = () => hoje().slice(0, 7)
export const addMes = (ym, n) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}
export const fmtMes = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES[m - 1]} de ${y}`
}
export const fmtMesCurto = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MESES[m - 1].slice(0, 3)}/${String(y).slice(2)}`
}
export const diasNoMes = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
export const inicioMes = (ym) => `${ym}-01`
export const fimMes = (ym) => `${ym}-${pad(diasNoMes(ym))}`

export const brl = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const num = (v) => (Number(v) || 0).toLocaleString('pt-BR')
export const pct = (v) => `${Math.round(v)}%`

export const soDigitos = (s) => String(s ?? '').replace(/\D/g, '')

export const fmtTelefone = (tel) => {
  const d = soDigitos(tel)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel || ''
}

export const whatsappDe = (tel, texto = '') => {
  let d = soDigitos(tel)
  if (!d) return null
  if (d.length <= 11) d = `55${d}`
  return `https://wa.me/${d}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
}

export const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'

export const normalizar = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
