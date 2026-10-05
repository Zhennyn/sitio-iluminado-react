import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlarmClock, Ban, CalendarCheck, CalendarClock, CalendarX, ChevronLeft, ChevronRight, CircleDollarSign,
  ClipboardCheck, FileWarning, Hourglass, Landmark, PieChart, Plus, Users,
} from 'lucide-react'
import { useDb } from '../data/store'
import { ativa, financeiroDe, indexar, serieMeses, tarefasDe } from '../data/selectors'
import { addDias, brl, fmtData, fmtHora, fmtMes, hoje, mesAtual, num, pct } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { ImovelThumb, Kpi, Painel as Card, Sparkline, Variacao, Vazio } from '../ui/components'
import Timeline, { LegendaTimeline } from '../ui/Timeline'

export default function Painel() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const navigate = useNavigate()
  const dia = hoje()
  const ym = mesAtual()
  const [inicio, setInicio] = useState(() => addDias(dia, -1))

  const imoveis = indexar(estado.imoveis)
  const clientes = indexar(estado.clientes)
  const ativas = estado.reservas.filter(ativa)
  const fin = (r) => financeiroDe(r, estado.config)

  const serie = useMemo(() => serieMeses(estado, ym, 6), [estado, ym])
  const mes = serie[serie.length - 1]
  const anterior = serie[serie.length - 2]
  const tarefas = useMemo(() => tarefasDe(estado, dia), [estado, dia])
  const qtd = (id) => tarefas.find((t) => t.id === id).itens.length

  const checkinsHoje = ativas.filter((r) => r.status !== 'pre' && r.checkin === dia)
  const checkoutsHoje = ativas.filter((r) => r.status !== 'pre' && r.checkout === dia)
  const aReceber = ativas.filter((r) => r.status !== 'pre').reduce((s, r) => s + fin(r).saldo, 0)
  const proximos = ativas
    .filter((r) => r.status !== 'pre' && r.checkin >= dia)
    .sort((a, b) => (a.checkin + a.horaCheckin).localeCompare(b.checkin + b.horaCheckin))
    .slice(0, 5)

  const imoveisAtivos = estado.imoveis.filter((i) => i.ativo)
  const r = (filtro) => `/admin/reservas?status=${filtro}`

  return (
    <div className="painel-dash">
      <div className="kpis">
        <Kpi icone={CalendarCheck} cor="blue" label="Check-ins hoje" valor={checkinsHoje.length} to="/admin/reservas?periodo=hoje" />
        <Kpi icone={CalendarX} cor="green" label="Check-outs hoje" valor={checkoutsHoje.length} to="/admin/reservas?periodo=hoje" />
        <Kpi icone={CircleDollarSign} cor="orange" label="A receber (saldos)" valor={brl(aReceber)} to="/admin/financeiro" />
        <Kpi icone={Landmark} cor="purple" label="Recebido no mês" valor={brl(mes.recebido)} to="/admin/financeiro" />
        <Kpi icone={PieChart} cor="teal" label="Comissão / lucro (mês)" valor={brl(mes.comissao)} to="/admin/relatorios" />
        <Kpi icone={Landmark} cor="indigo" label="Repasse (mês)" valor={brl(mes.repasse)} to="/admin/repasse" />

        <Kpi icone={Hourglass} cor="red" label="Aguardando sinal" valor={qtd('sinal')} to={r('aguardando_sinal')} link="Ver reservas" />
        <Kpi icone={AlarmClock} cor="yellow" label="Pré-reservas" valor={qtd('pre')} to={r('pre')} link="Ver reservas" />
        <Kpi icone={ClipboardCheck} cor="green" label="Reservas no mês" valor={mes.reservas} to="/admin/reservas" link="Ver reservas" />
        <Kpi icone={Users} cor="blue" label="Hóspedes (mês)" valor={num(mes.hospedes)} to="/admin/relatorios" />
        <Kpi icone={Ban} cor="gray" label="Canceladas (mês)" valor={mes.canceladas} to={r('cancelada')} link="Ver reservas" />
        <Kpi icone={FileWarning} cor="orange" label="Contratos pendentes" valor={qtd('contrato')} to="/admin/contratos" link="Ver contratos" />
      </div>

      <div className="dash-grade">
        <Card
          titulo="Calendário de disponibilidade"
          className="dash-calendario"
          acoes={
            <>
              <div className="nav-datas">
                <button type="button" className="btn-icone" onClick={() => setInicio(addDias(inicio, -7))} aria-label="Semana anterior"><ChevronLeft size={18} /></button>
                <button type="button" className="btn btn-sm" onClick={() => setInicio(addDias(dia, -1))}>Hoje</button>
                <button type="button" className="btn-icone" onClick={() => setInicio(addDias(inicio, 7))} aria-label="Próxima semana"><ChevronRight size={18} /></button>
                <span className="nav-datas-txt">{fmtData(inicio)} – {fmtData(addDias(inicio, 13))}</span>
              </div>
              <button type="button" className="btn btn-primario btn-sm" onClick={() => abrir('reserva-form')}><Plus size={16} aria-hidden="true" /> Nova reserva</button>
            </>
          }
        >
          <Timeline
            estado={estado}
            inicio={inicio}
            dias={14}
            imoveis={imoveisAtivos}
            onDia={(im, d) => abrir('reserva-form', { inicial: { imovelId: im.id, checkin: d, checkout: addDias(d, 1) } })}
            onReserva={(res) => abrir('reserva', { id: res.id })}
            onBloqueio={(b) => abrir('bloqueio-form', { bloqueio: b })}
          />
          <div className="painel-rodape">
            <LegendaTimeline />
            <Link to="/admin/calendario" className="link">Ver calendário completo →</Link>
          </div>
        </Card>

        <div className="dash-lateral">
          <Card titulo="Próximos check-ins" acoes={<Link to="/admin/reservas" className="link">Ver todos</Link>}>
            {proximos.length ? (
              <ul className="lista-proximos">
                {proximos.map((res) => (
                  <li key={res.id}>
                    <button type="button" onClick={() => abrir('reserva', { id: res.id })}>
                      <ImovelThumb imovel={imoveis[res.imovelId]} tamanho={44} />
                      <span className="lp-info">
                        <strong>{imoveis[res.imovelId]?.nome}</strong>
                        <span>{clientes[res.clienteId]?.nome}{res.titulo ? ` · ${res.titulo}` : ''}</span>
                        <small>{fmtData(res.checkin)} – {fmtData(res.checkout)}</small>
                      </span>
                      <span className="lp-quando">
                        <strong>{res.checkin === dia ? 'Hoje' : res.checkin === addDias(dia, 1) ? 'Amanhã' : fmtData(res.checkin).slice(0, 5)}</strong>
                        <span>{fmtHora(res.horaCheckin)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Vazio icone={CalendarClock} titulo="Nenhum check-in agendado." />}
          </Card>

          <Card titulo="Tarefas e alertas">
            <ul className="lista-tarefas">
              {tarefas.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    disabled={!t.itens.length}
                    onClick={() => navigate(t.rota || (t.filtro ? r(t.filtro) : '/admin/reservas'))}
                  >
                    <span>{t.label}</span>
                    <span className={`contador ${t.itens.length ? `bg-${t.cor}` : 'bg-gray'}`}>{t.itens.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="dash-resumo">
        <Card titulo={`Resumo de ${fmtMes(ym).split(' ')[0].toLowerCase()}`} acoes={<Link to="/admin/relatorios" className="link">Ver relatório</Link>}>
          <dl className="resumo-lista">
            <dt>Reservas</dt><dd>{mes.reservas}</dd>
            <dt>Faturamento</dt><dd>{brl(mes.faturamento)}</dd>
            <dt>Repasse a proprietários</dt><dd>{brl(mes.repasse)}</dd>
            <dt>Comissão / lucro</dt><dd>{brl(mes.comissao)}</dd>
            <dt>Despesas</dt><dd>{brl(mes.despesas)}</dd>
          </dl>
        </Card>
        <MiniGrafico titulo="Faturamento (mês)" valor={brl(mes.faturamento)} serie={serie.map((s) => s.faturamento)} atual={mes.faturamento} anterior={anterior.faturamento} cor="var(--a-verde)" />
        <MiniGrafico titulo="Reservas (mês)" valor={mes.reservas} serie={serie.map((s) => s.reservas)} atual={mes.reservas} anterior={anterior.reservas} cor="var(--a-azul)" />
        <MiniGrafico titulo="Hóspedes (mês)" valor={num(mes.hospedes)} serie={serie.map((s) => s.hospedes)} atual={mes.hospedes} anterior={anterior.hospedes} cor="var(--a-roxo)" />
        <MiniGrafico titulo="Taxa de ocupação" valor={pct(mes.ocupacao)} serie={serie.map((s) => s.ocupacao)} atual={mes.ocupacao} anterior={anterior.ocupacao} cor="var(--a-laranja)" />
      </div>
    </div>
  )
}

function MiniGrafico({ titulo, valor, serie, atual, anterior, cor }) {
  return (
    <section className="painel mini-grafico">
      <h2>{titulo}</h2>
      <strong>{valor}</strong>
      <Variacao atual={atual} anterior={anterior} />
      <Sparkline valores={serie} cor={cor} />
    </section>
  )
}
