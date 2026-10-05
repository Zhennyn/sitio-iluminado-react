// Regras de negócio calculadas a partir dos dados salvos.

import { addDias, addMes, diasNoMes, diffDias, fimMes, hoje, inicioMes, mesDe } from '../lib/format'

export const STATUS = {
  pre: { label: 'Pré-reserva', cor: 'yellow' },
  aguardando_sinal: { label: 'Aguardando sinal', cor: 'orange' },
  confirmada: { label: 'Confirmada', cor: 'blue' },
  concluida: { label: 'Concluída', cor: 'gray' },
  cancelada: { label: 'Cancelada', cor: 'red' },
}

export const CONTRATO = {
  pendente: { label: 'Pendente', cor: 'gray' },
  gerado: { label: 'Gerado', cor: 'yellow' },
  enviado: { label: 'Enviado', cor: 'blue' },
  assinado: { label: 'Assinado', cor: 'green' },
}

export const METODOS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão', 'Transferência']
export const CATEGORIAS_DESPESA = ['Manutenção', 'Limpeza', 'Contas', 'Compras', 'Funcionários', 'Impostos', 'Marketing', 'Outros']

export const statusDe = (r, dia = hoje()) =>
  r.status === 'confirmada' && r.checkout < dia ? 'concluida' : r.status

export const ativa = (r) => r.status !== 'cancelada'

export const totalDe = (r) => (Number(r.valor) || 0) + (Number(r.taxaLimpeza) || 0) + (Number(r.extras) || 0)

export function financeiroDe(r, config) {
  const total = totalDe(r)
  const pago = (r.pagamentos || []).reduce((s, p) => s + (Number(p.valor) || 0), 0)
  const sinal = Math.round(total * (config.percentSinal / 100) * 100) / 100
  return {
    total,
    pago,
    saldo: Math.max(0, total - pago),
    sinal,
    sinalPago: pago >= sinal - 0.005,
    quitado: pago >= total - 0.005,
    pctPago: total > 0 ? Math.min(100, (pago / total) * 100) : 0,
  }
}

export const noites = (r) => diffDias(r.checkin, r.checkout)

// Uma reserva ocupa do dia do check-in até o dia do check-out (inclusive).
export const ocupa = (r, dia) => r.checkin <= dia && dia <= r.checkout
const sobrepoe = (aIni, aFim, bIni, bFim) => aIni <= bFim && bIni <= aFim

export function conflitosDe(estado, { imovelId, checkin, checkout, ignorarId }) {
  if (!imovelId || !checkin || !checkout) return []
  const reservas = estado.reservas.filter(
    (r) => r.id !== ignorarId && r.imovelId === imovelId && ativa(r) && sobrepoe(checkin, checkout, r.checkin, r.checkout),
  )
  const bloqueios = estado.bloqueios.filter(
    (b) => b.id !== ignorarId && b.imovelId === imovelId && sobrepoe(checkin, checkout, b.inicio, b.fim),
  )
  return [...reservas.map((r) => ({ tipo: 'reserva', item: r })), ...bloqueios.map((b) => ({ tipo: 'bloqueio', item: b }))]
}

// Dias ocupados de um imóvel (reservas ativas e bloqueios), para o calendário do site.
// Ignora os dados de exemplo do painel, que não são reservas de verdade.
export function diasOcupados(estado, imovelId) {
  const dias = new Set()
  const marcar = (ini, fim) => {
    for (let d = ini; d <= fim; d = addDias(d, 1)) dias.add(d)
  }
  for (const r of estado.reservas) {
    if (r.imovelId === imovelId && ativa(r) && !r.demo) marcar(r.checkin, r.checkout)
  }
  for (const b of estado.bloqueios) {
    if (b.imovelId === imovelId && !b.demo) marcar(b.inicio, b.fim)
  }
  return dias
}

export const indexar =(lista) => Object.fromEntries(lista.map((i) => [i.id, i]))

// Comissão da administradora sobre uma reserva. Em imóvel próprio, todo o valor fica com ela.
export function comissaoDe(r, imovel) {
  const total = totalDe(r)
  if (!imovel || imovel.proprio) return total
  return Math.round(total * ((Number(imovel.comissaoPct) || 0) / 100) * 100) / 100
}

export function resumoMes(estado, ym) {
  const ini = inicioMes(ym)
  const fim = fimMes(ym)
  const imoveis = indexar(estado.imoveis)
  const doMes = estado.reservas.filter((r) => ativa(r) && mesDe(r.checkin) === ym)
  const canceladas = estado.reservas.filter((r) => r.status === 'cancelada' && mesDe(r.checkin) === ym)

  const faturamento = doMes.reduce((s, r) => s + totalDe(r), 0)
  const comissao = doMes.reduce((s, r) => s + comissaoDe(r, imoveis[r.imovelId]), 0)
  const recebido = estado.reservas
    .flatMap((r) => r.pagamentos || [])
    .filter((p) => mesDe(p.data) === ym)
    .reduce((s, p) => s + (Number(p.valor) || 0), 0)
  const despesas = estado.despesas.filter((d) => mesDe(d.data) === ym).reduce((s, d) => s + (Number(d.valor) || 0), 0)

  // Ocupação: dias ocupados ÷ dias disponíveis dos imóveis ativos no mês.
  const ativos = estado.imoveis.filter((i) => i.ativo)
  let diasOcupados = 0
  for (const im of ativos) {
    const dias = new Set()
    for (const r of estado.reservas) {
      if (r.imovelId !== im.id || !ativa(r) || !sobrepoe(r.checkin, r.checkout, ini, fim)) continue
      for (let d = r.checkin < ini ? ini : r.checkin; d <= r.checkout && d <= fim; d = addDias(d, 1)) dias.add(d)
    }
    diasOcupados += dias.size
  }
  const diasDisponiveis = ativos.length * diasNoMes(ym)

  return {
    ym,
    reservas: doMes.length,
    canceladas: canceladas.length,
    hospedes: doMes.reduce((s, r) => s + (Number(r.hospedes) || 0), 0),
    faturamento,
    comissao,
    repasse: faturamento - comissao,
    recebido,
    despesas,
    ocupacao: diasDisponiveis ? (diasOcupados / diasDisponiveis) * 100 : 0,
  }
}

export const serieMeses = (estado, ym, n = 6) =>
  Array.from({ length: n }, (_, i) => resumoMes(estado, addMes(ym, i - n + 1)))

export function repasseMes(estado, ym, imovel) {
  const reservas = estado.reservas.filter((r) => r.imovelId === imovel.id && ativa(r) && mesDe(r.checkin) === ym)
  const bruto = reservas.reduce((s, r) => s + totalDe(r), 0)
  const comissao = reservas.reduce((s, r) => s + comissaoDe(r, imovel), 0)
  const despesas = estado.despesas
    .filter((d) => d.imovelId === imovel.id && mesDe(d.data) === ym)
    .reduce((s, d) => s + (Number(d.valor) || 0), 0)
  const registro = estado.repasses.find((p) => p.imovelId === imovel.id && p.mes === ym)
  return { reservas, bruto, comissao, despesas, liquido: Math.max(0, bruto - comissao - despesas), registro }
}

export function tarefasDe(estado, dia = hoje()) {
  const { config } = estado
  const ativas = estado.reservas.filter(ativa)
  const fin = (r) => financeiroDe(r, config)
  const amanha = addDias(dia, 1)

  const aguardando = ativas.filter((r) => r.status === 'aguardando_sinal')
  const sinaisVencidos = aguardando.filter((r) => diffDias(r.criadoEm.slice(0, 10), dia) > config.prazoSinalDias)
  const saldosVencendo = ativas.filter(
    (r) => r.status === 'confirmada' && r.checkout >= dia && fin(r).saldo > 0 && diffDias(dia, r.checkin) <= config.prazoSaldoDias,
  )
  const contratos = ativas.filter((r) => r.status !== 'pre' && r.checkout >= dia && r.contrato !== 'assinado')
  const preReservas = ativas.filter((r) => r.status === 'pre' && r.checkout >= dia)

  return [
    { id: 'sinal', label: 'Reservas aguardando sinal', itens: aguardando, cor: 'orange', filtro: 'aguardando_sinal' },
    { id: 'sinal-vencido', label: `Sinais vencidos (+${config.prazoSinalDias} dias)`, itens: sinaisVencidos, cor: 'red', filtro: 'aguardando_sinal' },
    { id: 'saldo', label: `Saldos a receber (check-in em até ${config.prazoSaldoDias} dias)`, itens: saldosVencendo, cor: 'red', filtro: 'confirmada' },
    { id: 'contrato', label: 'Contratos não assinados', itens: contratos, cor: 'yellow', rota: '/admin/contratos' },
    { id: 'pre', label: 'Pré-reservas em aberto', itens: preReservas, cor: 'yellow', filtro: 'pre' },
    { id: 'checkin-amanha', label: 'Check-ins amanhã', itens: ativas.filter((r) => r.status !== 'pre' && r.checkin === amanha), cor: 'blue' },
    { id: 'checkout-amanha', label: 'Check-outs amanhã', itens: ativas.filter((r) => r.status !== 'pre' && r.checkout === amanha), cor: 'green' },
  ]
}

// Substitui {variaveis} de um modelo de mensagem pelos dados da reserva.
export function preencherTemplate(texto, { reserva, cliente, imovel, config }) {
  const f = financeiroDe(reserva, config)
  const br = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const data = (iso) => iso.split('-').reverse().join('/')
  const hora = (h) => (h || '').replace(':00', 'h').replace(':', 'h')
  const vars = {
    cliente: (cliente?.nome || '').split(' ')[0],
    clienteCompleto: cliente?.nome || '',
    imovel: imovel?.nome || '',
    codigo: reserva.codigo,
    checkin: data(reserva.checkin),
    checkout: data(reserva.checkout),
    horaCheckin: hora(reserva.horaCheckin),
    horaCheckout: hora(reserva.horaCheckout),
    hospedes: reserva.hospedes,
    valorTotal: br(f.total),
    sinal: br(f.sinal),
    saldo: br(f.saldo),
    pago: br(f.pago),
    pix: config.pix || 'chave Pix a informar',
    empresa: config.empresa,
    responsavel: config.responsavel,
  }
  return texto.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export const VARIAVEIS_TEMPLATE = [
  'cliente', 'clienteCompleto', 'imovel', 'codigo', 'checkin', 'checkout', 'horaCheckin', 'horaCheckout',
  'hospedes', 'valorTotal', 'sinal', 'saldo', 'pago', 'pix', 'empresa', 'responsavel',
]
