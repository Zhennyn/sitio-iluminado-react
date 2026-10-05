import { useMemo, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Download, Plus, Receipt, Wallet } from 'lucide-react'
import { useDb } from '../data/store'
import { ativa, financeiroDe, indexar, resumoMes } from '../data/selectors'
import { baixarCSV } from '../lib/arquivos'
import { brl, fmtData, mesAtual, mesDe } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Badge, Cabecalho, Kpi, MesPicker, Painel, Vazio } from '../ui/components'

export default function Financeiro() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const [ym, setYm] = useState(mesAtual())
  const [tipo, setTipo] = useState('todos')

  const imoveis = indexar(estado.imoveis)
  const clientes = indexar(estado.clientes)
  const mes = resumoMes(estado, ym)

  const lancamentos = useMemo(() => {
    const entradas = estado.reservas.flatMap((r) =>
      (r.pagamentos || [])
        .filter((p) => mesDe(p.data) === ym)
        .map((p) => ({
          id: p.id, tipo: 'entrada', data: p.data, valor: Number(p.valor) || 0,
          descricao: `${p.descricao || 'Pagamento'} — ${r.codigo} · ${clientes[r.clienteId]?.nome ?? ''}`,
          categoria: p.metodo, imovel: imoveis[r.imovelId]?.nome, abrir: () => abrir('reserva', { id: r.id }),
        })),
    )
    const saidas = estado.despesas
      .filter((d) => mesDe(d.data) === ym)
      .map((d) => ({
        id: d.id, tipo: 'saida', data: d.data, valor: Number(d.valor) || 0,
        descricao: d.descricao || d.categoria, categoria: d.categoria,
        imovel: d.imovelId ? imoveis[d.imovelId]?.nome : 'Geral', abrir: () => abrir('despesa-form', { despesa: d }),
      }))
    return [...entradas, ...saidas]
      .filter((l) => tipo === 'todos' || l.tipo === tipo)
      .sort((a, b) => b.data.localeCompare(a.data))
  }, [estado, ym, tipo, abrir, clientes, imoveis])

  const saldos = estado.reservas
    .filter((r) => ativa(r) && r.status !== 'pre')
    .map((r) => ({ r, f: financeiroDe(r, estado.config) }))
    .filter(({ f }) => f.saldo > 0)
    .sort((a, b) => a.r.checkin.localeCompare(b.r.checkin))
  const totalAReceber = saldos.reduce((s, { f }) => s + f.saldo, 0)

  const exportar = () =>
    baixarCSV(
      `financeiro-${ym}.csv`,
      ['Data', 'Tipo', 'Descrição', 'Categoria/forma', 'Imóvel', 'Valor'],
      lancamentos.map((l) => [fmtData(l.data), l.tipo === 'entrada' ? 'Entrada' : 'Saída', l.descricao, l.categoria, l.imovel, l.tipo === 'entrada' ? l.valor : -l.valor]),
    )

  return (
    <>
      <Cabecalho titulo="Financeiro" descricao="Entradas são os pagamentos registrados nas reservas; saídas são as despesas lançadas.">
        <MesPicker valor={ym} onChange={setYm} />
        <button type="button" className="btn btn-primario" onClick={() => abrir('despesa-form')}><Plus size={16} aria-hidden="true" /> Nova despesa</button>
      </Cabecalho>

      <div className="kpis kpis-4">
        <Kpi icone={ArrowUpCircle} cor="green" label="Recebido no mês" valor={brl(mes.recebido)} />
        <Kpi icone={ArrowDownCircle} cor="red" label="Despesas no mês" valor={brl(mes.despesas)} />
        <Kpi icone={Wallet} cor="blue" label="Resultado do caixa" valor={brl(mes.recebido - mes.despesas)} />
        <Kpi icone={Receipt} cor="orange" label="Total a receber (todas)" valor={brl(totalAReceber)} />
      </div>

      <div className="grade-2-1">
        <Painel
          titulo="Lançamentos do mês"
          acoes={
            <>
              <div className="segmentado" role="group" aria-label="Tipo de lançamento">
                {[['todos', 'Todos'], ['entrada', 'Entradas'], ['saida', 'Saídas']].map(([k, l]) => (
                  <button key={k} type="button" className={tipo === k ? 'ativo' : ''} onClick={() => setTipo(k)}>{l}</button>
                ))}
              </div>
              <button type="button" className="btn btn-sm" onClick={exportar} disabled={!lancamentos.length}><Download size={14} aria-hidden="true" /> CSV</button>
            </>
          }
        >
          {lancamentos.length ? (
            <div className="tabela-scroll">
              <table className="tabela tabela-clicavel">
                <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Imóvel</th><th className="num">Valor</th></tr></thead>
                <tbody>
                  {lancamentos.map((l) => (
                    <tr key={l.id} onClick={l.abrir}>
                      <td>{fmtData(l.data)}</td>
                      <td>{l.descricao}</td>
                      <td><Badge cor={l.tipo === 'entrada' ? 'green' : 'red'}>{l.categoria}</Badge></td>
                      <td>{l.imovel}</td>
                      <td className={`num ${l.tipo === 'entrada' ? 'txt-verde' : 'txt-vermelho'}`}>{l.tipo === 'entrada' ? '+' : '−'} {brl(l.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Vazio icone={Wallet} titulo="Nenhum lançamento neste mês." />}
        </Painel>

        <Painel titulo="Saldos a receber">
          {saldos.length ? (
            <ul className="lista-saldos">
              {saldos.map(({ r, f }) => (
                <li key={r.id}>
                  <button type="button" onClick={() => abrir('reserva', { id: r.id })}>
                    <span>
                      <strong>{clientes[r.clienteId]?.nome}</strong>
                      <small>{r.codigo} · {imoveis[r.imovelId]?.nome} · {fmtData(r.checkin)}</small>
                    </span>
                    <span className="txt-vermelho">{brl(f.saldo)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <Vazio titulo="Nenhum saldo pendente." />}
        </Painel>
      </div>
    </>
  )
}
