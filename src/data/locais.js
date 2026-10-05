// Tabelas de preço de cada local do portfólio Hospeda Temporada.
// Usadas pela calculadora do site e pelo painel admin (o `id` é o mesmo do imóvel no painel).
//
// Cada pacote tem `faixas`: [máximo de pessoas, valor] ou, nos pacotes de 2 dias da tabela do
// Sítio Iluminado, [máximo, sáb-dom, sex-dom]. Nos demais locais a entrada na sexta soma
// `acrescimoSexta` ao valor de sábado-domingo.

import { addDias, diaSemana, diffDias } from '../admin/lib/format'

export const PERIODOS = {
  sab_dom: 'Sábado (08h) a Domingo (18h)',
  sex_dom: 'Sexta (18h) a Domingo (18h)',
}

// Pacotes de data fixa: a calculadora escolhe o pacote sozinha quando as datas caem neles.
const NATAL_2026 = ['2026-12-23', '2026-12-27']
const REVEILLON_2027 = ['2026-12-30', '2027-01-03']
const CARNAVAL_2027 = ['2027-02-05', '2027-02-09']

// Monta os pacotes a partir das linhas da tabela em imagem. `null` = "-" na tabela:
// essa faixa não é oferecida e o grupo cai na próxima faixa disponível.
function tabela(colunas, linhas) {
  const faixas = (valores) => colunas.map((max, i) => [max, valores[i]]).filter(([, v]) => v != null)
  const PADRAO = {
    hospedagem: { nome: 'Fim de Semana Comum (2 dias)', dias: 2, periodos: true },
    feriado_2: { nome: 'Feriado (2 dias)', dias: 2, periodos: true, feriado: true },
    locacao_3: { nome: 'Locação de 3 dias', dias: 3 },
    locacao_4: { nome: 'Locação de 4 dias', dias: 4 },
    natal_2026: { nome: 'Natal 2026', detalhe: 'Período de 23/12 a 27/12/2026.', datas: NATAL_2026 },
    reveillon_2027: { nome: 'Réveillon 2027', detalhe: 'Período de 30/12/2026 a 03/01/2027.', datas: REVEILLON_2027 },
    carnaval_2027: { nome: 'Carnaval 2027', detalhe: 'Período de 05/02 a 09/02/2027.', datas: CARNAVAL_2027 },
  }
  const pacotes = {}
  for (const [id, base] of Object.entries(PADRAO)) {
    if (linhas[id]) pacotes[id] = { ...base, faixas: faixas(linhas[id]) }
  }
  if (linhas.evento) {
    pacotes.evento = {
      nome: 'Diária para Eventos (sem pernoite)',
      detalhe: 'Horário padrão das 08h às 18h.',
      dias: 1,
      intervalos: true,
      semConvidados: true,
      faixas: linhas.evento,
    }
  }
  return pacotes
}

const PADRAO_LOCAL = { limpeza: 300, convidado: 30, acrescimoSexta: 300 }

export const LOCAIS = {
  'sitio-iluminado': {
    ...PADRAO_LOCAL,
    nome: 'Sítio Iluminado',
    cidade: 'Biritiba Mirim / Mogi das Cruzes',
    regiao: 'Mogi das Cruzes',
    // Fonte: referencias/materiais/tabela-de-precos.jpeg
    pacotes: {
      hospedagem: {
        nome: 'Final de Semana Comum', dias: 2, periodos: true,
        faixas: [[15, 1700, 2000], [20, 2200, 2500], [25, 2300, 2500], [30, 2700, 2900]],
      },
      feriado_2: {
        nome: 'Feriado de 2 Dias', dias: 2, periodos: true, feriado: true,
        faixas: [[15, 1900, 2100], [20, 2200, 2400], [25, 2500, 2800], [30, 2900, 3200]],
      },
      feriado_3: { nome: 'Feriado de 3 Dias', dias: 3, faixas: [[15, 2500], [20, 2800], [25, 3200], [30, 3400]] },
      feriado_4: { nome: 'Feriado de 4 Dias', dias: 4, faixas: [[10, 2800], [15, 3500], [20, 3800], [25, 4200], [30, 4600]] },
      natal_2026: {
        nome: 'Natal 2026', detalhe: 'Período de 23/12 a 27/12/2026.', datas: NATAL_2026,
        faixas: [[20, 15000], [25, 18000], [30, 21000]],
      },
      ferias_2027: { nome: 'Férias de Janeiro 2027', detalhe: 'Pacote de 7 dias.', dias: 7, faixas: [[10, 5000], [15, 7000], [20, 8000]] },
      carnaval_2027: {
        nome: 'Carnaval 2027',
        detalhe: 'Pacote de 4 dias: check-in 05/02 às 18h, check-out 09/02/2027 às 12h.',
        datas: CARNAVAL_2027,
        faixas: [[20, 15000], [25, 18000], [30, 20000]],
      },
      evento: {
        nome: 'Diária para Eventos (sem pernoite)', detalhe: 'Horário padrão das 08h às 18h.',
        dias: 1, intervalos: true, semConvidados: true,
        faixas: [[50, 2000], [100, 2500], [150, 3000], [200, 4000], [250, 5500]],
      },
    },
  },

  mairinque: {
    ...PADRAO_LOCAL,
    nome: 'Mairinque',
    cidade: 'Mairinque',
    pacotes: tabela([10, 15, 20, 25, 30, 40], {
      hospedagem: [1900, 2200, 2600, 2900, 3200, 3600],
      feriado_2: [2200, 2400, 2800, 3100, 3400, 3900],
      locacao_3: [2800, 3100, 3200, 3800, 4100, 4600],
      locacao_4: [3500, 3700, 4100, 4300, 4600, 4900],
      carnaval_2027: [null, 9000, 11000, 13000, 15000, 19000],
      evento: [[50, 2500], [100, 3500]],
    }),
  },

  pedacinho: {
    ...PADRAO_LOCAL,
    nome: 'Pedacinho',
    cidade: 'Mogi das Cruzes',
    pacotes: tabela([10, 15, 20, 25], {
      hospedagem: [1900, 2100, 2300, 2500],
      feriado_2: [2100, 2300, 2500, 2700],
      locacao_3: [2300, 2600, 2700, 2900],
      locacao_4: [2900, 3100, 3300, 3700],
      carnaval_2027: [null, 10000, 12000, 15000],
      evento: [[50, 2500], [100, 3000]],
    }),
  },

  'pinheiro-atibaia': {
    ...PADRAO_LOCAL,
    nome: 'Pinheiro Atibaia',
    cidade: 'Atibaia',
    convidado: 40,
    pacotes: tabela([10, 15, 20], {
      hospedagem: [2300, 2500, 2700],
      feriado_2: [2500, 2700, 3000],
      locacao_3: [3100, 3300, 3600],
      locacao_4: [3900, 4100, 4500],
      natal_2026: [12000, 15000, 19000],
      reveillon_2027: [14000, 17000, 23000],
      carnaval_2027: [9500, 11500, 13500],
      evento: [[50, 2000], [100, 2500]],
    }),
  },

  rancho: {
    ...PADRAO_LOCAL,
    nome: 'Rancho',
    cidade: 'Mogi das Cruzes',
    pacotes: tabela([10, 15, 20, 25], {
      hospedagem: [1900, 2200, 2500, 2700],
      feriado_2: [2200, 2400, 2600, 2800],
      locacao_3: [2400, 2700, 3100, 3500],
      locacao_4: [2700, 3000, 3300, 3700],
      carnaval_2027: [null, 7500, 8500, 9500],
      evento: [[50, 2300], [100, 3000], [150, 3500]],
    }),
  },

  'sao-roque-lourdes': {
    ...PADRAO_LOCAL,
    nome: 'São Roque - Lourdes',
    cidade: 'São Roque',
    convidado: 40,
    pacotes: tabela([10, 15, 20, 25], {
      hospedagem: [1700, 1900, 2100],
      feriado_2: [1900, 2100, 2300],
      locacao_3: [2100, 2500, 2800],
      locacao_4: [2600, 3100, 3300],
      carnaval_2027: [7500, 9000, 11000, 12000],
      evento: [[40, 2000]],
    }),
  },

  'sao-roque-rosi': {
    ...PADRAO_LOCAL,
    nome: 'São Roque - Rosi',
    cidade: 'São Roque',
    convidado: 70,
    pacotes: tabela([10, 15, 20], {
      hospedagem: [2200, 2400, 2600],
      feriado_2: [2400, 2600, 2800],
      locacao_3: [2700, 3000, 3200],
      locacao_4: [3500, 3700, 4100],
      natal_2026: [null, 18000, 20000],
      reveillon_2027: [null, 17000, 20000],
      carnaval_2027: [null, 12000, 15000],
    }),
  },
}

// Locais sem tabela nas imagens enviadas. Montanha Atibaia e Cotia usam a tabela cadastrada no site
// antigo (hospeda-temporada.arislan10.chatgpt.site); os demais ficam com valores sob consulta.
Object.assign(LOCAIS, {
  'montanha-atibaia': {
    ...PADRAO_LOCAL,
    nome: 'Montanha Atibaia',
    cidade: 'Atibaia',
    capacidade: 25,
    convidado: 40,
    pacotes: {
      hospedagem: { nome: 'Fim de Semana Comum (2 dias)', dias: 2, periodos: true, faixas: [[15, 2100, 2300], [22, 2300, 2500], [30, 2600, 2900]] },
      feriado_2: { nome: 'Feriado (2 dias)', dias: 2, periodos: true, feriado: true, faixas: [[15, 2100, 2300], [22, 2300, 2500], [30, 2600, 2900]] },
      natal_2026: { nome: 'Natal 2026', detalhe: 'Período de 23/12 a 27/12/2026.', datas: NATAL_2026, faixas: [[22, 15000], [30, 18000]] },
      carnaval_2027: { nome: 'Carnaval 2027', detalhe: 'Período de 05/02 a 09/02/2027.', datas: CARNAVAL_2027, faixas: [[20, 12000], [30, 16000]] },
      evento: {
        nome: 'Diária para Eventos (sem pernoite)', detalhe: 'Horário padrão das 08h às 18h.',
        dias: 1, intervalos: true, semConvidados: true, faixas: [[50, 2000]],
      },
    },
  },
  cotia: {
    ...PADRAO_LOCAL,
    nome: 'Cotia',
    cidade: 'Cotia',
    capacidade: 20,
    pacotes: tabela([10], { hospedagem: [1600] }),
  },
  'esperanca-atibaia': { ...PADRAO_LOCAL, nome: 'Esperança Atibaia', cidade: 'Atibaia', capacidade: 30, pacotes: {} },
  ibiuna: { ...PADRAO_LOCAL, nome: 'Ibiúna', cidade: 'Ibiúna', capacidade: 18, pacotes: {} },
  sorocaba: { ...PADRAO_LOCAL, nome: 'Sorocaba', cidade: 'Sorocaba', capacidade: 20, pacotes: {} },
  suzano: { ...PADRAO_LOCAL, nome: 'Suzano', cidade: 'Suzano', capacidade: 20, pacotes: {} },
  mairipora: { ...PADRAO_LOCAL, nome: 'Mairiporã', cidade: 'Mairiporã', capacidade: 25, pacotes: {} },
})

export const LOCAL_PADRAO = 'sitio-iluminado'

export const temTabela = (local) => Object.keys(local.pacotes).length > 0

// Maior grupo com pernoite que o local recebe (pela tabela).
export const capacidadeDe = (local) =>
  local.capacidade ??
  Math.max(...Object.values(local.pacotes).filter((p) => !p.semConvidados).map((p) => p.faixas.at(-1)[0]))

// Menor valor de fim de semana da tabela, para o "a partir de" dos cards.
export const aPartirDe = (local) => local.pacotes.hospedagem?.faixas[0][1] ?? null

// Feriados nacionais (e 9 de julho, estadual de SP) que mudam o pacote para "Feriado".
export const FERIADOS = {
  '2026-01-01': 'Ano Novo', '2026-02-16': 'Carnaval', '2026-02-17': 'Carnaval', '2026-04-03': 'Sexta-feira Santa',
  '2026-04-05': 'Páscoa', '2026-04-21': 'Tiradentes', '2026-05-01': 'Dia do Trabalhador', '2026-06-04': 'Corpus Christi',
  '2026-07-09': 'Revolução Constitucionalista', '2026-09-07': 'Independência', '2026-10-12': 'N. Sra. Aparecida',
  '2026-11-02': 'Finados', '2026-11-15': 'Proclamação da República', '2026-11-20': 'Consciência Negra',
  '2026-12-25': 'Natal',
  '2027-01-01': 'Ano Novo', '2027-02-08': 'Carnaval', '2027-02-09': 'Carnaval', '2027-03-26': 'Sexta-feira Santa',
  '2027-03-28': 'Páscoa', '2027-04-21': 'Tiradentes', '2027-05-01': 'Dia do Trabalhador', '2027-05-27': 'Corpus Christi',
  '2027-07-09': 'Revolução Constitucionalista', '2027-09-07': 'Independência', '2027-10-12': 'N. Sra. Aparecida',
  '2027-11-02': 'Finados', '2027-11-15': 'Proclamação da República', '2027-11-20': 'Consciência Negra',
  '2027-12-25': 'Natal',
}

// Escolhe o pacote e o período que combinam com as datas escolhidas no calendário.
// Retorna null quando nenhum pacote do local cobre aquela estadia.
export function sugerirPacote(local, checkin, checkout) {
  const pacotes = Object.entries(local.pacotes)
  const especial = pacotes.find(([, p]) => p.datas && checkin <= p.datas[1] && p.datas[0] <= checkout)
  if (especial) return { pacote: especial[0], periodo: 'sab_dom' }

  const noites = diffDias(checkin, checkout)
  const sexta = noites === 2 && diaSemana(checkin) === 5
  const dias = sexta ? 2 : noites + 1
  const candidatos = pacotes.filter(([, p]) => p.dias === dias && !p.datas)
  if (!candidatos.length) return null

  // Feriado no período ou colado nele (sexta ou segunda) conta como fim de semana de feriado.
  const temFeriado = Array.from({ length: noites + 3 }, (_, i) => addDias(checkin, i - 1)).some((d) => FERIADOS[d])
  const escolhido = candidatos.find(([, p]) => !!p.feriado === temFeriado) || candidatos[0]
  return { pacote: escolhido[0], periodo: sexta ? 'sex_dom' : 'sab_dom' }
}

export const formatBRL = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Calcula o orçamento pela tabela do local. Também usado pelo painel admin.
export function calcularOrcamento(localId, tipo, periodo, pessoas, convidados) {
  const local = LOCAIS[localId]
  const pacote = local?.pacotes[tipo]
  if (!pacote) return { sobConsulta: true, maxPessoas: 0 }

  const faixas = pacote.faixas
  const idx = faixas.findIndex(([max]) => pessoas <= max)
  const maxPessoas = faixas[faixas.length - 1][0]

  if (idx === -1) return { sobConsulta: true, maxPessoas }

  const [max, ...valores] = faixas[idx]
  const sexta = pacote.periodos && periodo === 'sex_dom'
  const valBase = sexta && valores[1] != null ? valores[1] : valores[0]
  const valSexta = sexta && valores[1] == null ? local.acrescimoSexta : 0
  const min = idx > 0 ? faixas[idx - 1][0] + 1 : 1
  const faixa = pacote.intervalos && idx > 0 ? `${min} a ${max} pessoas` : `até ${max} pessoas`
  const valConvidados = pacote.semConvidados ? 0 : convidados * local.convidado

  return {
    sobConsulta: false,
    faixa,
    valBase,
    valSexta,
    valConvidados,
    limpeza: local.limpeza,
    total: valBase + valSexta + valConvidados + local.limpeza,
  }
}
