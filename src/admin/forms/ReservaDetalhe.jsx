import { useState } from 'react'
import {
  CalendarDays, CheckCircle2, FileText, MessageCircle, Pencil, Plus, Trash2, Undo2, Users, XCircle, Ban,
} from 'lucide-react'
import { db, uid, useDb } from '../data/store'
import {
  CONTRATO, METODOS_PAGAMENTO, conflitosDe, financeiroDe, noites, preencherTemplate, statusDe,
} from '../data/selectors'
import { abrirContrato } from '../lib/contrato'
import { brl, fmtData, fmtHora, fmtTelefone, hoje, whatsappDe } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { ContratoBadge, ImovelThumb, Modal, Progresso, StatusBadge, Vazio } from '../ui/components'

export default function ReservaDetalhe({ id }) {
  const estado = useDb()
  const { fechar, abrir, aviso } = useAdminUI()
  const r = estado.reservas.find((x) => x.id === id)
  const [pg, setPg] = useState(null)

  if (!r) {
    return (
      <Modal titulo="Reserva não encontrada" onClose={fechar}>
        <Vazio titulo="Esta reserva foi removida." />
      </Modal>
    )
  }

  const { config } = estado
  const cliente = estado.clientes.find((c) => c.id === r.clienteId)
  const imovel = estado.imoveis.find((i) => i.id === r.imovelId)
  const f = financeiroDe(r, config)
  const st = statusDe(r)
  const n = noites(r)

  const mudarStatus = (status, extra = {}) => {
    db.atualizar('reservas', r.id, { status, ...extra })
  }

  const confirmar = () => {
    mudarStatus('confirmada')
    aviso(`Reserva ${r.codigo} confirmada.`)
  }
  const pedirSinal = () => {
    mudarStatus('aguardando_sinal')
    aviso('Reserva aguardando o sinal.')
  }
  const cancelar = () => {
    const motivo = window.prompt('Motivo do cancelamento (opcional):', '')
    if (motivo === null) return
    mudarStatus('cancelada', { motivoCancelamento: motivo.trim() })
    aviso(`Reserva ${r.codigo} cancelada.`)
  }
  const reativar = () => {
    if (conflitosDe(estado, { imovelId: r.imovelId, checkin: r.checkin, checkout: r.checkout, ignorarId: r.id }).length) {
      aviso('Não dá para reativar: as datas já estão ocupadas neste imóvel.', 'erro')
      return
    }
    mudarStatus(f.sinalPago ? 'confirmada' : 'aguardando_sinal', { motivoCancelamento: '' })
    aviso('Reserva reativada.')
  }
  const excluir = () => {
    if (!window.confirm(`Excluir definitivamente a reserva ${r.codigo}? Os pagamentos registrados nela também serão apagados.`)) return
    db.remover('reservas', r.id)
    fechar()
    aviso(`Reserva ${r.codigo} excluída.`)
  }

  const novoPagamento = () =>
    setPg({ data: hoje(), valor: String(f.pago < f.sinal ? f.sinal - f.pago : f.saldo), metodo: 'Pix', descricao: f.pago < f.sinal ? 'Sinal' : 'Saldo' })

  const salvarPagamento = (e) => {
    e.preventDefault()
    const valor = Number(String(pg.valor).replace(',', '.'))
    if (!(valor > 0) || !pg.data) {
      aviso('Informe a data e um valor maior que zero.', 'erro')
      return
    }
    const pagamentos = [...(r.pagamentos || []), { id: uid(), data: pg.data, valor, metodo: pg.metodo, descricao: pg.descricao.trim() }]
    const novoPago = pagamentos.reduce((s, p) => s + p.valor, 0)
    const patch = { pagamentos }
    // Sinal atingido: a reserva passa a confirmada automaticamente.
    if ((r.status === 'pre' || r.status === 'aguardando_sinal') && novoPago >= f.sinal - 0.005) patch.status = 'confirmada'
    db.atualizar('reservas', r.id, patch)
    setPg(null)
    aviso(patch.status ? `Pagamento registrado — reserva ${r.codigo} confirmada.` : 'Pagamento registrado.')
  }

  const removerPagamento = (p) => {
    if (!window.confirm(`Remover o pagamento de ${brl(p.valor)} de ${fmtData(p.data)}?`)) return
    db.atualizar('reservas', r.id, (x) => ({ pagamentos: x.pagamentos.filter((q) => q.id !== p.id) }))
  }

  const gerarContrato = () => {
    if (!abrirContrato({ reserva: r, cliente, imovel, config })) {
      aviso('O navegador bloqueou a nova aba. Permita pop-ups para este site.', 'erro')
      return
    }
    if (r.contrato === 'pendente') db.atualizar('reservas', r.id, { contrato: 'gerado' })
  }

  const linkWhats = (texto) => whatsappDe(cliente?.telefone, texto)

  return (
    <Modal
      titulo={
        <span className="titulo-reserva">
          {r.codigo} <StatusBadge reserva={r} />
        </span>
      }
      subtitulo={r.titulo || null}
      onClose={fechar}
      largura="lg"
      rodape={
        <>
          <button type="button" className="btn btn-perigo-txt" onClick={excluir}><Trash2 size={16} aria-hidden="true" /> Excluir</button>
          <span className="espaco" />
          {st !== 'cancelada' && st !== 'concluida' && (
            <button type="button" className="btn" onClick={cancelar}><XCircle size={16} aria-hidden="true" /> Cancelar reserva</button>
          )}
          {st === 'cancelada' && <button type="button" className="btn" onClick={reativar}><Undo2 size={16} aria-hidden="true" /> Reativar</button>}
          {st === 'pre' && <button type="button" className="btn" onClick={pedirSinal}>Aguardar sinal</button>}
          {(st === 'pre' || st === 'aguardando_sinal') && (
            <button type="button" className="btn btn-sucesso" onClick={confirmar}><CheckCircle2 size={16} aria-hidden="true" /> Confirmar</button>
          )}
          <button type="button" className="btn btn-primario" onClick={() => abrir('reserva-form', { reserva: r })}><Pencil size={16} aria-hidden="true" /> Editar</button>
        </>
      }
    >
      {r.status === 'cancelada' && r.motivoCancelamento && (
        <div className="alerta alerta-erro"><Ban size={18} aria-hidden="true" /> Cancelada: {r.motivoCancelamento}</div>
      )}

      <div className="detalhe-grade">
        <div className="detalhe-bloco">
          <h3>Hospedagem</h3>
          <div className="linha-imovel">
            <ImovelThumb imovel={imovel} tamanho={48} />
            <div>
              <strong>{imovel?.nome ?? 'Imóvel removido'}</strong>
              <small>{imovel?.cidade}</small>
            </div>
          </div>
          <dl className="dl">
            <dt><CalendarDays size={15} aria-hidden="true" /> Check-in</dt>
            <dd>{fmtData(r.checkin)} às {fmtHora(r.horaCheckin)}</dd>
            <dt><CalendarDays size={15} aria-hidden="true" /> Check-out</dt>
            <dd>{fmtData(r.checkout)} até {fmtHora(r.horaCheckout)} · {n ? `${n} noite${n > 1 ? 's' : ''}` : 'diária'}</dd>
            <dt><Users size={15} aria-hidden="true" /> Pessoas</dt>
            <dd>{r.hospedes} com pernoite{r.convidados ? ` + ${r.convidados} convidados` : ''}</dd>
          </dl>
        </div>

        <div className="detalhe-bloco">
          <h3>Cliente</h3>
          {cliente ? (
            <>
              <button type="button" className="link-forte" onClick={() => abrir('cliente', { id: cliente.id })}>{cliente.nome}</button>
              <p className="muted">{fmtTelefone(cliente.telefone) || 'Sem telefone'}{cliente.email ? ` · ${cliente.email}` : ''}</p>
              {cliente.telefone && (
                <div className="whats-rapido">
                  {config.templates.map((t) => (
                    <a
                      key={t.id}
                      className="chip"
                      href={linkWhats(preencherTemplate(t.texto, { reserva: r, cliente, imovel, config }))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={14} aria-hidden="true" /> {t.nome}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : <p className="muted">Cliente removido.</p>}
          {r.obs && (
            <>
              <h3 className="mt">Observações</h3>
              <p className="pre-linha">{r.obs}</p>
            </>
          )}
        </div>
      </div>

      <div className="detalhe-bloco">
        <div className="bloco-cab">
          <h3>Financeiro</h3>
          {!pg && r.status !== 'cancelada' && !f.quitado && (
            <button type="button" className="btn btn-sm" onClick={novoPagamento}><Plus size={14} aria-hidden="true" /> Registrar pagamento</button>
          )}
        </div>
        <div className="fin-resumo">
          <div><span>Hospedagem</span><strong>{brl(r.valor)}</strong></div>
          <div><span>Limpeza</span><strong>{brl(r.taxaLimpeza)}</strong></div>
          {Number(r.extras) > 0 && <div><span>Adicionais</span><strong>{brl(r.extras)}</strong></div>}
          <div><span>Total</span><strong>{brl(f.total)}</strong></div>
          <div><span>Sinal ({config.percentSinal}%)</span><strong className={f.sinalPago ? 'txt-verde' : 'txt-laranja'}>{brl(f.sinal)}</strong></div>
          <div><span>Pago</span><strong className="txt-verde">{brl(f.pago)}</strong></div>
          <div><span>Saldo</span><strong className={f.saldo ? 'txt-vermelho' : ''}>{brl(f.saldo)}</strong></div>
        </div>
        <Progresso pct={f.pctPago} cor={f.quitado ? 'green' : f.sinalPago ? 'blue' : 'orange'} />

        {pg && (
          <form className="form-pagamento" onSubmit={salvarPagamento}>
            <label className="campo"><span className="campo-label">Data</span><input type="date" value={pg.data} onChange={(e) => setPg({ ...pg, data: e.target.value })} /></label>
            <label className="campo"><span className="campo-label">Valor</span><input type="number" min="0" step="0.01" value={pg.valor} onChange={(e) => setPg({ ...pg, valor: e.target.value })} data-autofocus /></label>
            <label className="campo"><span className="campo-label">Forma</span>
              <select value={pg.metodo} onChange={(e) => setPg({ ...pg, metodo: e.target.value })}>
                {METODOS_PAGAMENTO.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="campo"><span className="campo-label">Descrição</span><input value={pg.descricao} onChange={(e) => setPg({ ...pg, descricao: e.target.value })} /></label>
            <div className="form-pagamento-acoes">
              <button type="button" className="btn btn-sm" onClick={() => setPg(null)}>Cancelar</button>
              <button type="submit" className="btn btn-sm btn-primario">Salvar</button>
            </div>
          </form>
        )}

        {r.pagamentos?.length > 0 && (
          <table className="tabela tabela-compacta">
            <thead><tr><th>Data</th><th>Descrição</th><th>Forma</th><th className="num">Valor</th><th /></tr></thead>
            <tbody>
              {[...r.pagamentos].sort((a, b) => a.data.localeCompare(b.data)).map((p) => (
                <tr key={p.id}>
                  <td>{fmtData(p.data)}</td>
                  <td>{p.descricao || '—'}</td>
                  <td>{p.metodo}</td>
                  <td className="num">{brl(p.valor)}</td>
                  <td className="num">
                    <button type="button" className="btn-icone" onClick={() => removerPagamento(p)} aria-label={`Remover pagamento de ${brl(p.valor)}`}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="detalhe-bloco">
        <div className="bloco-cab">
          <h3>Contrato <ContratoBadge status={r.contrato} /></h3>
          <div className="botoes">
            <button type="button" className="btn btn-sm" onClick={gerarContrato}><FileText size={14} aria-hidden="true" /> Gerar / imprimir</button>
            <select
              className="select-sm"
              value={r.contrato}
              onChange={(e) => db.atualizar('reservas', r.id, { contrato: e.target.value })}
              aria-label="Situação do contrato"
            >
              {Object.entries(CONTRATO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}
