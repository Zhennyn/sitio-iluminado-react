import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardList, Download, Plus } from 'lucide-react'
import { useDb } from '../data/store'
import { CONTRATO, STATUS, financeiroDe, indexar, statusDe } from '../data/selectors'
import { baixarCSV } from '../lib/arquivos'
import { brl, fmtData, hoje, normalizar } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Cabecalho, ContratoBadge, Painel, Progresso, StatusBadge, Vazio } from '../ui/components'

const ABAS = [['todas', 'Todas'], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])]

export default function Reservas() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'todas'
  const periodo = params.get('periodo') || 'proximas'
  const [imovelId, setImovelId] = useState('')
  const [busca, setBusca] = useState('')

  const setParam = (k, v) => {
    const p = new URLSearchParams(params)
    p.set(k, v)
    setParams(p, { replace: true })
  }

  const imoveis = indexar(estado.imoveis)
  const clientes = indexar(estado.clientes)
  const dia = hoje()

  const lista = useMemo(() => {
    const t = normalizar(busca.trim())
    return estado.reservas
      .filter((r) => status === 'todas' || statusDe(r, dia) === status)
      .filter((r) => !imovelId || r.imovelId === imovelId)
      .filter((r) => {
        if (periodo === 'hoje') return r.checkin === dia || r.checkout === dia
        if (periodo === 'proximas') return r.checkout >= dia
        if (periodo === 'passadas') return r.checkout < dia
        return true
      })
      .filter((r) => !t || normalizar(`${r.codigo} ${clientes[r.clienteId]?.nome ?? ''} ${r.titulo}`).includes(t))
      .sort((a, b) => (periodo === 'passadas' ? b.checkin.localeCompare(a.checkin) : a.checkin.localeCompare(b.checkin)))
  }, [estado.reservas, status, imovelId, periodo, busca, clientes, dia])

  const contagem = (k) => estado.reservas.filter((r) => k === 'todas' || statusDe(r, dia) === k).length

  const exportar = () => {
    baixarCSV(
      `reservas-${dia}.csv`,
      ['Código', 'Cliente', 'Telefone', 'Imóvel', 'Título', 'Check-in', 'Check-out', 'Pessoas', 'Total', 'Pago', 'Saldo', 'Situação', 'Contrato'],
      lista.map((r) => {
        const f = financeiroDe(r, estado.config)
        const c = clientes[r.clienteId]
        return [r.codigo, c?.nome, c?.telefone, imoveis[r.imovelId]?.nome, r.titulo, fmtData(r.checkin), fmtData(r.checkout), r.hospedes, f.total, f.pago, f.saldo, STATUS[statusDe(r, dia)].label, CONTRATO[r.contrato]?.label]
      }),
    )
  }

  return (
    <>
      <Cabecalho titulo="Reservas" descricao={`${lista.length} reserva${lista.length === 1 ? '' : 's'} encontrada${lista.length === 1 ? '' : 's'}`}>
        <button type="button" className="btn" onClick={exportar} disabled={!lista.length}><Download size={16} aria-hidden="true" /> Exportar CSV</button>
        <button type="button" className="btn btn-primario" onClick={() => abrir('reserva-form')}><Plus size={16} aria-hidden="true" /> Nova reserva</button>
      </Cabecalho>

      <div className="abas" role="tablist">
        {ABAS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={status === k} className={status === k ? 'ativo' : ''} onClick={() => setParam('status', k)}>
            {label} <span>{contagem(k)}</span>
          </button>
        ))}
      </div>

      <Painel>
        <div className="filtros">
          <input type="search" placeholder="Buscar por código, cliente ou evento…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar reservas" />
          <select value={imovelId} onChange={(e) => setImovelId(e.target.value)} aria-label="Imóvel">
            <option value="">Todos os imóveis</option>
            {estado.imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
          <select value={periodo} onChange={(e) => setParam('periodo', e.target.value)} aria-label="Período">
            <option value="proximas">Em andamento e próximas</option>
            <option value="hoje">Check-in ou check-out hoje</option>
            <option value="passadas">Passadas</option>
            <option value="todas">Todas as datas</option>
          </select>
        </div>

        {lista.length ? (
          <div className="tabela-scroll">
            <table className="tabela tabela-clicavel">
              <thead>
                <tr>
                  <th>Código</th><th>Cliente</th><th>Imóvel</th><th>Check-in</th><th>Check-out</th>
                  <th className="num">Pessoas</th><th className="num">Total</th><th>Pagamento</th><th>Situação</th><th>Contrato</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r) => {
                  const f = financeiroDe(r, estado.config)
                  return (
                    <tr key={r.id} onClick={() => abrir('reserva', { id: r.id })}>
                      <td><button type="button" className="link-forte" onClick={(e) => { e.stopPropagation(); abrir('reserva', { id: r.id }) }}>{r.codigo}</button></td>
                      <td>
                        <strong className="celula-forte">{clientes[r.clienteId]?.nome ?? '—'}</strong>
                        {r.titulo && <small className="celula-sub">{r.titulo}</small>}
                      </td>
                      <td>{imoveis[r.imovelId]?.nome}</td>
                      <td>{fmtData(r.checkin)}</td>
                      <td>{fmtData(r.checkout)}</td>
                      <td className="num">{r.hospedes}</td>
                      <td className="num">{brl(f.total)}</td>
                      <td className="celula-pg">
                        <Progresso pct={f.pctPago} cor={f.quitado ? 'green' : f.sinalPago ? 'blue' : 'orange'} />
                        <small>{f.quitado ? 'Quitado' : `Saldo ${brl(f.saldo)}`}</small>
                      </td>
                      <td><StatusBadge reserva={r} /></td>
                      <td><ContratoBadge status={r.contrato} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio icone={ClipboardList} titulo="Nenhuma reserva com esses filtros." />
        )}
      </Painel>
    </>
  )
}
