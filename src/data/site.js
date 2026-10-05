// Dados de contato e conteúdo compartilhados pelo site.

export const WHATSAPP_NUMBER = '5511941942210'
export const WHATSAPP_DISPLAY = '(11) 94194-2210'
export const INSTAGRAM_URL = 'https://www.instagram.com/sitioiluminadotemporada/'
export const INSTAGRAM_HANDLE = '@sitioiluminadotemporada'
export const VIDEO_URL = 'https://www.youtube.com/shorts/ZM-ybTJY4qA'
export const PROPRIETARIO = 'Arlei'

export const whatsappLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`

// Fotos otimizadas em public/img (variações de 500px e 1000px de largura).
export const foto = (nome, largura = 1000) => `/img/${nome}-${largura}.webp`
export const fotoSrcSet = (nome) => `${foto(nome, 500)} 500w, ${foto(nome, 1000)} 1000w`

export const TAXA_LIMPEZA = 300
export const VALOR_CONVIDADO = 30

// Tabela de preços (fonte: referencias/materiais/tabela-de-precos.jpeg).
// Cada faixa: [máximo de pessoas, valor] ou, com `periodos`, [máximo, sáb-dom, sex-dom].
export const PACOTES = {
  hospedagem: {
    nome: 'Final de Semana Comum',
    periodos: true,
    faixas: [[15, 1700, 2000], [20, 2200, 2500], [25, 2300, 2500], [30, 2700, 2900]],
  },
  feriado_2: {
    nome: 'Feriado de 2 Dias',
    periodos: true,
    faixas: [[15, 1900, 2100], [20, 2200, 2400], [25, 2500, 2800], [30, 2900, 3200]],
  },
  feriado_3: {
    nome: 'Feriado de 3 Dias',
    faixas: [[15, 2500], [20, 2800], [25, 3200], [30, 3400]],
  },
  feriado_4: {
    nome: 'Feriado de 4 Dias',
    faixas: [[10, 2800], [15, 3500], [20, 3800], [25, 4200], [30, 4600]],
  },
  natal_2026: {
    nome: 'Natal 2026',
    detalhe: 'Período de 23/12 a 27/12/2026.',
    faixas: [[20, 15000], [25, 18000], [30, 21000]],
  },
  ferias_2027: {
    nome: 'Férias de Janeiro 2027',
    detalhe: 'Pacote de 7 dias.',
    faixas: [[10, 5000], [15, 7000], [20, 8000]],
  },
  carnaval_2027: {
    nome: 'Carnaval 2027',
    detalhe: 'Pacote de 4 dias: check-in 05/02 às 18h, check-out 09/02/2027 às 12h.',
    faixas: [[20, 15000], [25, 18000], [30, 20000]],
  },
  evento: {
    nome: 'Diária para Eventos (sem pernoite)',
    detalhe: 'Horário padrão das 08h às 18h.',
    intervalos: true,
    semConvidados: true,
    faixas: [[50, 2000], [100, 2500], [150, 3000], [200, 4000], [250, 5500]],
  },
}

export const PERIODOS = {
  sab_dom: 'Sábado (08h) a Domingo (18h)',
  sex_dom: 'Sexta (18h) a Domingo (18h)',
}

export const formatBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Calcula o orçamento pela tabela. Também usado pelo painel admin.
export function calcularOrcamento(tipo, periodo, pessoas, convidados) {
  const pacote = PACOTES[tipo]
  const faixas = pacote.faixas
  const idx = faixas.findIndex(([max]) => pessoas <= max)
  const maxPessoas = faixas[faixas.length - 1][0]

  if (idx === -1) return { sobConsulta: true, maxPessoas }

  const [max, ...valores] = faixas[idx]
  const valBase = pacote.periodos && periodo === 'sex_dom' ? valores[1] : valores[0]
  const min = idx > 0 ? faixas[idx - 1][0] + 1 : 1
  const faixa = pacote.intervalos && idx > 0 ? `${min} a ${max} pessoas` : `até ${max} pessoas`
  const valConvidados = pacote.semConvidados ? 0 : convidados * VALOR_CONVIDADO

  return {
    sobConsulta: false,
    faixa,
    valBase,
    valConvidados,
    total: valBase + valConvidados + TAXA_LIMPEZA,
  }
}
