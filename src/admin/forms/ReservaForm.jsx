import { useMemo, useState } from 'react'
import { Calculator, AlertTriangle } from 'lucide-react'
import { db, useDb } from '../data/store'
import { conflitosDe, indexar, totalDe } from '../data/selectors'
import { PACOTES, PERIODOS, calcularOrcamento } from '../../data/site'
import { addDias, brl, diffDias, fmtData, hoje } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Campo, Modal } from '../ui/components'

const NOVO = '__novo__'

export default function ReservaForm({ reserva, inicial = {} }) {
  const estado = useDb()
  const { fechar, abrir, aviso } = useAdminUI()
  const { config } = estado
  const imoveisAtivos = estado.imoveis.filter((i) => i.ativo || i.id === reserva?.imovelId)
  const clientesOrd = useMemo(() => [...estado.clientes].sort((a, b) => a.nome.localeCompare(b.nome)), [estado.clientes])

  const [f, setF] = useState(() => {
    const r = reserva || {}
    const checkin = r.checkin || inicial.checkin || hoje()
    return {
      imovelId: r.imovelId || inicial.imovelId || imoveisAtivos[0]?.id || '',
      clienteId: r.clienteId || inicial.clienteId || (clientesOrd.length ? '' : NOVO),
      novoNome: '',
      novoTelefone: '',
      titulo: r.titulo || '',
      pacote: r.pacote || 'hospedagem',
      periodo: 'sab_dom',
      checkin,
      horaCheckin: r.horaCheckin || config.horaCheckin,
      checkout: r.checkout || inicial.checkout || addDias(checkin, 1),
      horaCheckout: r.horaCheckout || config.horaCheckout,
      hospedes: String(r.hospedes ?? inicial.hospedes ?? ''),
      convidados: String(r.convidados ?? 0),
      valor: r.valor != null ? String(r.valor) : '',
      taxaLimpeza: String(r.taxaLimpeza ?? config.taxaLimpeza),
      extras: String(r.extras ?? 0),
      status: r.status || 'pre',
      obs: r.obs || '',
    }
  })
  const [erros, setErros] = useState({})
  const set = (campo) => (e) => setF((x) => ({ ...x, [campo]: e.target.value }))

  const imovel = indexar(estado.imoveis)[f.imovelId]
  const n = (v) => Number(String(v).replace(',', '.')) || 0
  const total = totalDe({ valor: n(f.valor), taxaLimpeza: n(f.taxaLimpeza), extras: n(f.extras) })
  const noites = f.checkin && f.checkout ? diffDias(f.checkin, f.checkout) : 0
  const conflitos = conflitosDe(estado, { imovelId: f.imovelId, checkin: f.checkin, checkout: f.checkout, ignorarId: reserva?.id })
  const clientes = indexar(estado.clientes)

  const sugerir = () => {
    if (!imovel) return
    if (imovel.usaTabela) {
      const r = calcularOrcamento(f.pacote, f.periodo, Math.max(1, n(f.hospedes)), n(f.convidados))
      if (r.sobConsulta) {
        aviso(`Acima de ${r.maxPessoas} pessoas este pacote é sob consulta. Informe o valor manualmente.`, 'erro')
        return
      }
      setF((x) => ({ ...x, valor: String(r.valBase), extras: String(r.valConvidados), taxaLimpeza: String(config.taxaLimpeza) }))
    } else if (imovel.diaria) {
      setF((x) => ({ ...x, valor: String(imovel.diaria * Math.max(1, noites)), taxaLimpeza: String(config.taxaLimpeza) }))
    } else {
      aviso('Cadastre a diária do imóvel para calcular automaticamente.', 'erro')
    }
  }

  const salvar = (e) => {
    e.preventDefault()
    const er = {}
    if (!f.imovelId) er.imovelId = 'Escolha o imóvel.'
    if (!f.clienteId) er.clienteId = 'Escolha o cliente.'
    if (f.clienteId === NOVO && !f.novoNome.trim()) er.novoNome = 'Informe o nome do cliente.'
    if (!f.checkin) er.checkin = 'Informe a data.'
    if (!f.checkout) er.checkout = 'Informe a data.'
    else if (f.checkout < f.checkin) er.checkout = 'O check-out deve ser no mesmo dia ou depois do check-in.'
    if (n(f.hospedes) < 1) er.hospedes = 'Informe a quantidade de pessoas.'
    if (n(f.valor) <= 0) er.valor = 'Informe o valor (ou use "Calcular").'
    if (conflitos.length && f.status !== 'cancelada') er.datas = 'Datas indisponíveis neste imóvel.'
    setErros(er)
    if (Object.keys(er).length) return

    let clienteId = f.clienteId
    if (clienteId === NOVO) {
      clienteId = db.inserir('clientes', {
        nome: f.novoNome.trim(), telefone: f.novoTelefone.trim(), email: '', documento: '', cidade: '', obs: '',
      }).id
    }

    const dados = {
      imovelId: f.imovelId,
      clienteId,
      titulo: f.titulo.trim(),
      pacote: imovel?.usaTabela ? f.pacote : '',
      checkin: f.checkin,
      horaCheckin: f.horaCheckin,
      checkout: f.checkout,
      horaCheckout: f.horaCheckout,
      hospedes: n(f.hospedes),
      convidados: n(f.convidados),
      valor: n(f.valor),
      taxaLimpeza: n(f.taxaLimpeza),
      extras: n(f.extras),
      status: f.status,
      obs: f.obs.trim(),
    }

    if (reserva) {
      db.atualizar('reservas', reserva.id, dados)
      aviso(`Reserva ${reserva.codigo} atualizada.`)
      abrir('reserva', { id: reserva.id })
    } else {
      const nova = db.inserirReserva(dados)
      aviso(`Reserva ${nova.codigo} criada.`)
      abrir('reserva', { id: nova.id })
    }
  }

  return (
    <Modal
      titulo={reserva ? `Editar reserva ${reserva.codigo}` : 'Nova reserva'}
      onClose={fechar}
      largura="lg"
      rodape={
        <>
          <span className="rodape-total">Total: <strong>{brl(total)}</strong></span>
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" form="form-reserva" className="btn btn-primario">{reserva ? 'Salvar alterações' : 'Criar reserva'}</button>
        </>
      }
    >
      <form id="form-reserva" className="form-grade" onSubmit={salvar} noValidate>
        <Campo label="Imóvel" erro={erros.imovelId}>
          <select value={f.imovelId} onChange={set('imovelId')}>
            {imoveisAtivos.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </Campo>

        <Campo label="Cliente" erro={erros.clienteId}>
          <select value={f.clienteId} onChange={set('clienteId')}>
            <option value="">Selecione…</option>
            <option value={NOVO}>+ Cadastrar novo cliente</option>
            {clientesOrd.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>

        {f.clienteId === NOVO && (
          <>
            <Campo label="Nome do novo cliente" erro={erros.novoNome}>
              <input value={f.novoNome} onChange={set('novoNome')} autoComplete="off" />
            </Campo>
            <Campo label="WhatsApp / telefone">
              <input value={f.novoTelefone} onChange={set('novoTelefone')} inputMode="tel" placeholder="(11) 90000-0000" />
            </Campo>
          </>
        )}

        <Campo label="Título / evento (opcional)" dica="Ex.: Aniversário, Retiro, Casamento" largo>
          <input value={f.titulo} onChange={set('titulo')} />
        </Campo>

        <Campo label="Check-in" erro={erros.checkin}>
          <div className="campo-dupla">
            <input type="date" value={f.checkin} onChange={set('checkin')} />
            <input type="time" value={f.horaCheckin} onChange={set('horaCheckin')} aria-label="Horário do check-in" />
          </div>
        </Campo>
        <Campo label="Check-out" erro={erros.checkout} dica={noites >= 0 && f.checkout >= f.checkin ? (noites ? `${noites} noite${noites > 1 ? 's' : ''}` : 'Diária (sem pernoite)') : null}>
          <div className="campo-dupla">
            <input type="date" value={f.checkout} min={f.checkin} onChange={set('checkout')} />
            <input type="time" value={f.horaCheckout} onChange={set('horaCheckout')} aria-label="Horário do check-out" />
          </div>
        </Campo>

        {conflitos.length > 0 && (
          <div className="alerta alerta-erro campo-largo" role="alert">
            <AlertTriangle size={18} aria-hidden="true" />
            <div>
              <strong>{erros.datas || 'Conflito de datas neste imóvel:'}</strong>
              <ul>
                {conflitos.map(({ tipo, item }) => (
                  <li key={item.id}>
                    {tipo === 'reserva'
                      ? `${item.codigo} — ${clientes[item.clienteId]?.nome ?? 'cliente'} (${fmtData(item.checkin)} a ${fmtData(item.checkout)})`
                      : `Bloqueio: ${item.motivo || 'sem motivo'} (${fmtData(item.inicio)} a ${fmtData(item.fim)})`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <Campo label="Pessoas com pernoite" erro={erros.hospedes} dica={imovel ? `Capacidade: ${imovel.capacidade} pessoas` : null}>
          <input type="number" min="1" inputMode="numeric" value={f.hospedes} onChange={set('hospedes')} />
        </Campo>
        <Campo label="Convidados sem pernoite">
          <input type="number" min="0" inputMode="numeric" value={f.convidados} onChange={set('convidados')} />
        </Campo>

        <fieldset className="campo-largo valores">
          <legend>Valores</legend>
          {imovel?.usaTabela && (
            <div className="form-grade">
              <Campo label="Pacote da tabela">
                <select value={f.pacote} onChange={set('pacote')}>
                  {Object.entries(PACOTES).map(([id, p]) => <option key={id} value={id}>{p.nome}</option>)}
                </select>
              </Campo>
              {PACOTES[f.pacote]?.periodos ? (
                <Campo label="Período">
                  <select value={f.periodo} onChange={set('periodo')}>
                    {Object.entries(PERIODOS).map(([id, t]) => <option key={id} value={id}>{t}</option>)}
                  </select>
                </Campo>
              ) : <div />}
            </div>
          )}
          <div className="form-grade form-grade-4">
            <Campo label="Hospedagem / pacote" erro={erros.valor}>
              <input type="number" min="0" step="0.01" inputMode="decimal" value={f.valor} onChange={set('valor')} />
            </Campo>
            <Campo label="Taxa de limpeza">
              <input type="number" min="0" step="0.01" inputMode="decimal" value={f.taxaLimpeza} onChange={set('taxaLimpeza')} />
            </Campo>
            <Campo label="Adicionais" dica="Convidados, extras…">
              <input type="number" min="0" step="0.01" inputMode="decimal" value={f.extras} onChange={set('extras')} />
            </Campo>
            <div className="campo campo-acao">
              <button type="button" className="btn" onClick={sugerir}>
                <Calculator size={16} aria-hidden="true" /> Calcular
              </button>
            </div>
          </div>
        </fieldset>

        <Campo label="Situação">
          <select value={f.status} onChange={set('status')}>
            <option value="pre">Pré-reserva (data segurada)</option>
            <option value="aguardando_sinal">Aguardando sinal</option>
            <option value="confirmada">Confirmada</option>
            {reserva && <option value="cancelada">Cancelada</option>}
          </select>
        </Campo>
        <Campo label="Observações" largo>
          <textarea rows={3} value={f.obs} onChange={set('obs')} />
        </Campo>
      </form>
    </Modal>
  )
}
