import { addDias, diaSemana, hoje } from '../lib/format'

export const VERSAO = 2

export const TEMPLATES_PADRAO = [
  {
    id: 'confirmacao',
    nome: 'Pré-reserva / envio do sinal',
    texto:
      'Olá, {cliente}! Tudo bem?\n\nSegue o resumo da sua reserva no *{imovel}*:\n📅 Check-in: {checkin} às {horaCheckin}\n📅 Check-out: {checkout} até {horaCheckout}\n👥 {hospedes} pessoas\n💰 Valor total: {valorTotal}\n\nPara garantir a data, o sinal é de *{sinal}* via Pix ({pix}). Assim que recebermos, envio o contrato. 😉',
  },
  {
    id: 'confirmada',
    nome: 'Reserva confirmada',
    texto:
      'Oi, {cliente}! Recebemos o sinal e sua reserva no *{imovel}* está confirmada ✅\n\nCódigo: {codigo}\nCheck-in: {checkin} às {horaCheckin}\nCheck-out: {checkout} até {horaCheckout}\nSaldo restante: *{saldo}* (até 7 dias antes do check-in).\n\nQualquer dúvida estou à disposição!',
  },
  {
    id: 'saldo',
    nome: 'Lembrete do saldo',
    texto:
      'Olá, {cliente}! Passando para lembrar que o saldo da sua reserva no *{imovel}* ({checkin}) é de *{saldo}*.\n\nPix: {pix}\n\nObrigado!',
  },
  {
    id: 'checkin',
    nome: 'Instruções de check-in',
    texto:
      'Oi, {cliente}! Está chegando o dia 🌿\n\nSeu check-in no *{imovel}* é em {checkin} às {horaCheckin}. O check-out é em {checkout} até {horaCheckout}.\n\nLembretes: silêncio após a meia-noite e respeitar o número de {hospedes} pessoas combinado. Boa estadia!',
  },
  {
    id: 'agradecimento',
    nome: 'Agradecimento pós-estadia',
    texto:
      'Olá, {cliente}! Muito obrigado por escolher o *{imovel}* 💚\n\nEsperamos que tenham aproveitado. Se puder, conte como foi a experiência — e volte sempre!\n\n{responsavel} — {empresa}',
  },
]

export const CONFIG_PADRAO = {
  empresa: 'Hospeda Temporada',
  responsavel: 'Arlei',
  documento: '',
  telefone: '(11) 94194-2210',
  email: '',
  pix: '',
  cidadeForo: 'Mogi das Cruzes/SP',
  taxaLimpeza: 300,
  percentSinal: 50,
  prazoSaldoDias: 7,
  prazoSinalDias: 3,
  horaCheckin: '08:00',
  horaCheckout: '18:00',
  proximoCodigo: 1,
  templates: TEMPLATES_PADRAO,
}

// Portfólio do hospedatemporada.com.br.
export const IMOVEIS = [
  {
    id: 'sitio-iluminado', nome: 'Sítio Iluminado', cidade: 'Biritiba Mirim / Mogi das Cruzes - SP',
    quartos: 4, banheiros: 4, capacidade: 30, diaria: 0, usaTabela: true, proprio: true,
    comissaoPct: 0, proprietario: 'Arlei', foto: '/img/piscina-500.webp', cor: '#16a34a', ativo: true,
  },
  {
    id: 'sitio-das-pedras', nome: 'Sítio das Pedras', cidade: 'Guararema - SP',
    quartos: 4, banheiros: 0, capacidade: 30, diaria: 1800, usaTabela: false, proprio: false,
    comissaoPct: 20, proprietario: '', foto: '', cor: '#a16207', ativo: true,
  },
  {
    id: 'sitio-beira-rio', nome: 'Sítio Beira Rio', cidade: 'Salesópolis - SP',
    quartos: 3, banheiros: 0, capacidade: 20, diaria: 1200, usaTabela: false, proprio: false,
    comissaoPct: 20, proprietario: '', foto: '', cor: '#0284c7', ativo: true,
  },
  {
    id: 'sitio-alto-da-serra', nome: 'Sítio Alto da Serra', cidade: 'Paraibuna - SP',
    quartos: 6, banheiros: 0, capacidade: 40, diaria: 2200, usaTabela: false, proprio: false,
    comissaoPct: 20, proprietario: '', foto: '', cor: '#7c3aed', ativo: true,
  },
  // Locais com tabela de preços própria (src/data/locais.js), adicionados na versão 2.
  ...[
    ['mairinque', 'Mairinque', 'Mairinque - SP', 40, '#ea580c'],
    ['pedacinho', 'Pedacinho', '', 25, '#0d9488'],
    ['pinheiro-atibaia', 'Pinheiro Atibaia', 'Atibaia - SP', 20, '#15803d'],
    ['rancho', 'Rancho', '', 25, '#b45309'],
    ['sao-roque-lourdes', 'São Roque - Lourdes', 'São Roque - SP', 25, '#2563eb'],
    ['sao-roque-rosi', 'São Roque - Rosi', 'São Roque - SP', 20, '#db2777'],
  ].map(([id, nome, cidade, capacidade, cor]) => ({
    id, nome, cidade, quartos: 0, banheiros: 0, capacidade, diaria: 0, usaTabela: true, proprio: false,
    comissaoPct: 20, proprietario: '', foto: '', cor, ativo: true,
  })),
]

const CLIENTES = [
  ['Mariana Souza', '11900000001', 'Mogi das Cruzes'],
  ['Carlos Pereira', '11900000002', 'São Paulo'],
  ['Juliana Santos', '11900000003', 'Suzano'],
  ['Roberto Lima', '11900000004', 'Guarulhos'],
  ['Fernanda Alves', '11900000005', 'São Paulo'],
  ['Igreja Comunidade Viva', '11900000006', 'Mogi das Cruzes'],
  ['Patrícia Gomes', '11900000007', 'Santo André'],
  ['Empresa Alfa Ltda.', '11900000008', 'São Paulo'],
  ['Lucas Oliveira', '11900000009', 'Itaquaquecetuba'],
  ['Ana Paula Rocha', '11900000010', 'Arujá'],
]

export function criarSeed({ vazio = false } = {}) {
  const base = {
    versao: VERSAO,
    config: { ...CONFIG_PADRAO },
    imoveis: IMOVEIS.map((i) => ({ ...i, criadoEm: new Date().toISOString() })),
    clientes: [],
    reservas: [],
    bloqueios: [],
    despesas: [],
    repasses: [],
  }
  if (vazio) return base
  return { ...base, ...exemplos(base.config) }
}

// Reservas de exemplo em torno da data de hoje, para o painel não começar vazio.
function exemplos(config) {
  const t = hoje()
  const ate = (6 - diaSemana(t) + 7) % 7
  const sab = (k) => addDias(t, ate + k * 7)
  const criado = (iso) => new Date(`${iso}T12:00:00`).toISOString()

  const clientes = CLIENTES.map(([nome, telefone, cidade], i) => ({
    id: `demo-cli-${i}`, nome, telefone, email: '', documento: '', cidade, obs: '', demo: true,
    criadoEm: criado(addDias(t, -150 + i)),
  }))

  // [imóvel, cliente, check-in, noites, hóspedes, status, % pago, título, valor da hospedagem]
  const linhas = [
    ['sitio-iluminado', 0, sab(-17), 1, 15, 'confirmada', 100, '', 1700],
    ['sitio-das-pedras', 1, sab(-16), 1, 25, 'confirmada', 100, '', 3600],
    ['sitio-iluminado', 2, sab(-14), 1, 20, 'confirmada', 100, '', 2200],
    ['sitio-alto-da-serra', 7, sab(-13), 0, 120, 'confirmada', 100, 'Confraternização', 2200],
    ['sitio-beira-rio', 3, sab(-12), 1, 12, 'confirmada', 100, '', 2400],
    ['sitio-iluminado', 4, addDias(sab(-11), -1), 2, 25, 'confirmada', 100, '', 2500],
    ['sitio-das-pedras', 5, sab(-10), 1, 30, 'confirmada', 100, 'Retiro', 3600],
    ['sitio-iluminado', 6, sab(-9), 1, 18, 'cancelada', 0, '', 2200],
    ['sitio-iluminado', 8, sab(-8), 1, 15, 'confirmada', 100, '', 1700],
    ['sitio-alto-da-serra', 9, sab(-7), 1, 35, 'confirmada', 100, '', 4400],
    ['sitio-beira-rio', 1, sab(-6), 1, 18, 'confirmada', 100, '', 2400],
    ['sitio-iluminado', 3, sab(-5), 1, 30, 'confirmada', 100, '', 2700],
    ['sitio-das-pedras', 2, sab(-4), 1, 20, 'confirmada', 100, '', 3600],
    ['sitio-iluminado', 7, sab(-3), 0, 80, 'confirmada', 100, 'Evento corporativo', 2500],
    ['sitio-iluminado', 0, sab(-2), 1, 20, 'confirmada', 100, '', 2200],
    ['sitio-alto-da-serra', 4, sab(-2), 1, 30, 'confirmada', 100, '', 4400],
    ['sitio-beira-rio', 6, sab(-1), 1, 15, 'confirmada', 100, '', 2400],
    ['sitio-das-pedras', 8, addDias(t, -2), 2, 22, 'confirmada', 100, '', 5400],
    ['sitio-iluminado', 9, t, 2, 20, 'confirmada', 50, 'Aniversário', 2500],
    ['sitio-beira-rio', 5, addDias(t, 1), 2, 18, 'confirmada', 50, '', 3600],
    ['sitio-alto-da-serra', 2, sab(1), 1, 28, 'aguardando_sinal', 0, '', 4400],
    ['sitio-iluminado', 1, sab(1), 1, 15, 'pre', 0, '', 1700],
    ['sitio-das-pedras', 3, sab(2), 1, 30, 'confirmada', 50, 'Casamento', 3600],
    ['sitio-iluminado', 6, addDias(sab(2), -1), 2, 25, 'aguardando_sinal', 0, '', 2500],
    ['sitio-beira-rio', 0, sab(3), 1, 20, 'pre', 0, '', 2400],
    ['sitio-iluminado', 5, sab(4), 0, 150, 'confirmada', 50, 'Encontro de jovens', 3000],
    ['sitio-alto-da-serra', 9, sab(5), 1, 40, 'cancelada', 0, '', 4400],
  ]

  const reservas = linhas.map(([imovelId, cli, checkin, noites, hospedes, status, pagoPct, titulo, valor], i) => {
    const checkout = addDias(checkin, noites)
    const taxaLimpeza = config.taxaLimpeza
    const total = valor + taxaLimpeza
    const criadoEm = criado(addDias(checkin, status === 'aguardando_sinal' && i % 2 ? -12 : -25))
    const pagamentos = []
    if (pagoPct >= 50) {
      pagamentos.push({ id: `demo-pg-${i}-1`, data: addDias(checkin, -24), valor: total / 2, metodo: 'Pix', descricao: 'Sinal' })
    }
    if (pagoPct >= 100) {
      pagamentos.push({ id: `demo-pg-${i}-2`, data: addDias(checkin, -7), valor: total / 2, metodo: 'Pix', descricao: 'Saldo' })
    }
    const passada = checkout < t
    return {
      id: `demo-res-${i}`,
      codigo: `R-${String(i + 1).padStart(4, '0')}`,
      imovelId,
      clienteId: `demo-cli-${cli}`,
      titulo,
      pacote: '',
      checkin,
      horaCheckin: config.horaCheckin,
      checkout,
      horaCheckout: config.horaCheckout,
      hospedes,
      convidados: 0,
      valor,
      taxaLimpeza,
      extras: 0,
      status,
      contrato: status === 'cancelada' ? 'pendente' : passada || pagoPct >= 50 ? 'assinado' : status === 'aguardando_sinal' ? 'gerado' : 'pendente',
      pagamentos,
      obs: '',
      motivoCancelamento: status === 'cancelada' ? 'Desistência do cliente' : '',
      demo: true,
      criadoEm,
    }
  })

  const despesas = []
  for (let k = 0; k < 5; k++) {
    const d = addDias(t, -k * 30 - 5)
    despesas.push(
      { id: `demo-desp-${k}-1`, data: d, imovelId: 'sitio-iluminado', categoria: 'Manutenção', descricao: 'Manutenção da piscina', valor: 350, demo: true },
      { id: `demo-desp-${k}-2`, data: addDias(d, 2), imovelId: 'sitio-iluminado', categoria: 'Contas', descricao: 'Energia elétrica', valor: 420 + k * 15, demo: true },
      { id: `demo-desp-${k}-3`, data: addDias(d, 3), imovelId: '', categoria: 'Marketing', descricao: 'Anúncios', valor: 150, demo: true },
    )
  }

  const bloqueios = [
    { id: 'demo-bloq-1', imovelId: 'sitio-alto-da-serra', inicio: addDias(t, 3), fim: addDias(t, 4), motivo: 'Manutenção', demo: true },
  ]

  return {
    config: { ...config, proximoCodigo: reservas.length + 1 },
    clientes,
    reservas,
    bloqueios,
    despesas,
  }
}
