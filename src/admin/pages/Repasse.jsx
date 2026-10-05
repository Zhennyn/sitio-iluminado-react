import { Fragment, useState } from 'react'
import { CheckCircle2, Handshake, Undo2 } from 'lucide-react'
import { db, useDb } from '../data/store'
import { indexar, repasseMes, totalDe } from '../data/selectors'
import { brl, fmtData, fmtMes, hoje, mesAtual } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Badge, Cabecalho, ImovelThumb, MesPicker, Painel, Vazio } from '../ui/components'

export default function Repasse() {
  const estado = useDb()
  const { abrir, aviso } = useAdminUI()
  const [ym, setYm] = useState(mesAtual())
  const [aberto, setAberto] = useState(null)
  const clientes = indexar(estado.clientes)
  const terceiros = estado.imoveis.filter((i) => !i.proprio)

  const linhas = terceiros.map((im) => ({ im, ...repasseMes(estado, ym, im) }))
  const total = linhas.reduce((s, l) => s + l.liquido, 0)
  const pagos = linhas.filter((l) => l.registro).reduce((s, l) => s + l.registro.valor, 0)

  const marcarPago = (l) => {
    db.inserir('repasses', { imovelId: l.im.id, mes: ym, valor: l.liquido, pagoEm: hoje() })
    aviso(`Repasse de ${l.im.nome} marcado como pago.`)
  }
  const desfazer = (l) => {
    if (!window.confirm('Desmarcar este repasse como pago?')) return
    db.remover('repasses', l.registro.id)
  }

  return (
    <>
      <Cabecalho titulo="Repasse a proprietários" descricao="Valor das reservas do mês (por data de check-in), menos a comissão e as despesas do imóvel.">
        <MesPicker valor={ym} onChange={setYm} />
      </Cabecalho>

      {terceiros.length ? (
        <Painel titulo={`Repasses de ${fmtMes(ym)}`} acoes={<span className="muted">Pago {brl(pagos)} de {brl(total)}</span>}>
          <div className="tabela-scroll">
            <table className="tabela">
              <thead>
                <tr><th>Imóvel</th><th>Proprietário</th><th className="num">Reservas</th><th className="num">Bruto</th><th className="num">Comissão</th><th className="num">Despesas</th><th className="num">A repassar</th><th>Situação</th><th /></tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <Fragment key={l.im.id}>
                    <tr>
                      <td>
                        <button type="button" className="celula-cliente link-forte" onClick={() => setAberto(aberto === l.im.id ? null : l.im.id)} aria-expanded={aberto === l.im.id}>
                          <ImovelThumb imovel={l.im} tamanho={32} /> {l.im.nome}
                        </button>
                      </td>
                      <td>{l.im.proprietario || '—'}</td>
                      <td className="num">{l.reservas.length}</td>
                      <td className="num">{brl(l.bruto)}</td>
                      <td className="num">− {brl(l.comissao)} <small className="muted">({l.im.comissaoPct}%)</small></td>
                      <td className="num">− {brl(l.despesas)}</td>
                      <td className="num"><strong>{brl(l.liquido)}</strong></td>
                      <td>{l.registro ? <Badge cor="green">Pago em {fmtData(l.registro.pagoEm)}</Badge> : l.liquido > 0 ? <Badge cor="orange">Pendente</Badge> : <Badge>Sem valores</Badge>}</td>
                      <td className="num">
                        {l.registro ? (
                          <button type="button" className="btn btn-sm" onClick={() => desfazer(l)}><Undo2 size={14} aria-hidden="true" /> Desfazer</button>
                        ) : l.liquido > 0 ? (
                          <button type="button" className="btn btn-sm btn-sucesso" onClick={() => marcarPago(l)}><CheckCircle2 size={14} aria-hidden="true" /> Marcar pago</button>
                        ) : null}
                      </td>
                    </tr>
                    {aberto === l.im.id && (
                      <tr className="linha-detalhe">
                        <td colSpan={9}>
                          {l.reservas.length ? (
                            <ul>
                              {l.reservas.map((r) => (
                                <li key={r.id}>
                                  <button type="button" className="link-forte" onClick={() => abrir('reserva', { id: r.id })}>{r.codigo}</button>
                                  {' '}— {clientes[r.clienteId]?.nome} · {fmtData(r.checkin)} · {brl(totalDe(r))}
                                </li>
                              ))}
                            </ul>
                          ) : <span className="muted">Nenhuma reserva neste mês.</span>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Painel>
      ) : (
        <Painel><Vazio icone={Handshake} titulo="Nenhum imóvel de terceiros.">Imóveis marcados como “próprios” não geram repasse.</Vazio></Painel>
      )}
    </>
  )
}
