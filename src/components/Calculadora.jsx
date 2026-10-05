import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import CalendarioDisponibilidade from './CalendarioDisponibilidade'
import { whatsappLink } from '../data/site'
import {
  LOCAIS, LOCAL_PADRAO, PERIODOS, calcularOrcamento, capacidadeDe, formatBRL, sugerirPacote,
} from '../data/locais'
import { useDb } from '../admin/data/store'
import { diasOcupados } from '../admin/data/selectors'
import { addDias, diffDias, fmtData } from '../admin/lib/format'

export default function Calculadora() {
  const estado = useDb()
  const [localId, setLocalId] = useState(LOCAL_PADRAO)
  const [tipo, setTipo] = useState('hospedagem')
  const [periodo, setPeriodo] = useState('sab_dom')
  const [checkin, setCheckin] = useState(null)
  const [checkout, setCheckout] = useState(null)
  const [semPacote, setSemPacote] = useState(false)
  // Guardados como texto para o campo poder ficar vazio enquanto a pessoa digita.
  const [pessoasTxt, setPessoasTxt] = useState('15')
  const [convidadosTxt, setConvidadosTxt] = useState('0')

  const local = LOCAIS[localId]
  const ocupados = useMemo(() => diasOcupados(estado, localId), [estado, localId])
  const tipoAtual = local.pacotes[tipo] ? tipo : 'hospedagem'
  const pacote = local.pacotes[tipoAtual]
  const pessoas = Math.max(1, parseInt(pessoasTxt, 10) || 1)
  const convidados = pacote.semConvidados ? 0 : Math.max(0, parseInt(convidadosTxt, 10) || 0)
  const r = calcularOrcamento(localId, tipoAtual, periodo, pessoas, convidados)

  const aplicarSugestao = (l, ini, fim) => {
    const s = sugerirPacote(l, ini, fim)
    setSemPacote(!s)
    if (s) {
      setTipo(s.pacote)
      setPeriodo(s.periodo)
    }
  }

  const mudarDatas = (ini, fim) => {
    setCheckin(ini)
    setCheckout(fim)
    if (fim) aplicarSugestao(local, ini, fim)
    else setSemPacote(false)
  }

  const mudarLocal = (id) => {
    const novo = LOCAIS[id]
    const ocupadosNovo = diasOcupados(estado, id)
    let conflito = false
    for (let d = checkin; d && d <= (checkout || checkin); d = addDias(d, 1)) if (ocupadosNovo.has(d)) conflito = true

    setLocalId(id)
    if (conflito) mudarDatas(null, null)
    const s = !conflito && checkin && checkout ? sugerirPacote(novo, checkin, checkout) : null
    setSemPacote(!conflito && !!checkout && !s)
    if (s) {
      setTipo(s.pacote)
      setPeriodo(s.periodo)
    } else if (!novo.pacotes[tipo]) {
      setTipo('hospedagem')
    }
  }

  const datasTxt = checkin
    ? checkout
      ? checkin === checkout
        ? `${fmtData(checkin)} (diária)`
        : `${fmtData(checkin)} a ${fmtData(checkout)} · ${diffDias(checkin, checkout)} noite${diffDias(checkin, checkout) > 1 ? 's' : ''}`
      : `Check-in ${fmtData(checkin)} — agora escolha o check-out`
    : 'Escolha o check-in e o check-out no calendário'

  const mensagem = () => {
    const linhas = [
      `Olá! Gostaria de fazer uma reserva no *${local.nome}*.`,
      '',
      `*Pacote:* ${pacote.nome}`,
    ]
    if (checkin && checkout) linhas.push(`*Datas:* ${fmtData(checkin)} a ${fmtData(checkout)}`)
    if (pacote.periodos) linhas.push(`*Período:* ${PERIODOS[periodo]}`)
    linhas.push(`*${tipoAtual === 'evento' ? 'Pessoas' : 'Hóspedes'}:* ${pessoas}`)
    if (convidados > 0) linhas.push(`*Convidados sem pernoite:* ${convidados}`)
    if (!r.sobConsulta) linhas.push('', `*Valor estimado:* ${formatBRL(r.total)}`)
    linhas.push('', 'Podemos confirmar a disponibilidade?')
    return linhas.join('\n')
  }

  return (
    <div className="calc-container">
      <div className="eyebrow">Orçamento</div>
      <h2>Simule sua reserva</h2>
      <p className="calc-lead">Escolha o local e as datas, veja a disponibilidade e o valor na hora. A confirmação é feita pelo WhatsApp.</p>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="calc-local">Local</label>
          <select id="calc-local" value={localId} onChange={(e) => mudarLocal(e.target.value)}>
            {Object.entries(LOCAIS).map(([id, l]) => (
              <option key={id} value={id}>
                {l.nome}{l.cidade && l.cidade !== l.nome ? ` — ${l.cidade}` : ''} (até {capacidadeDe(l)} pessoas)
              </option>
            ))}
          </select>
        </div>

        <div className="field full">
          <span className="field-label" id="calc-datas">Datas · disponibilidade do {local.nome}</span>
          <CalendarioDisponibilidade
            key={localId}
            ocupados={ocupados}
            inicio={checkin}
            fim={checkout}
            onChange={mudarDatas}
          />
          <p className="field-hint" aria-live="polite">{datasTxt}</p>
          {semPacote && (
            <p className="field-hint">Nenhum pacote da tabela cobre essa estadia. Escolha o pacote mais próximo ou consulte pelo WhatsApp.</p>
          )}
        </div>

        <div className={`field${pacote.periodos ? '' : ' full'}`}>
          <label htmlFor="calc-tipo">Pacote</label>
          <select id="calc-tipo" value={tipoAtual} onChange={(e) => setTipo(e.target.value)}>
            {Object.entries(local.pacotes).map(([id, p]) => (
              <option key={id} value={id}>{p.nome}</option>
            ))}
          </select>
          {pacote.detalhe && <p className="field-hint">{pacote.detalhe}</p>}
        </div>

        {pacote.periodos && (
          <div className="field">
            <label htmlFor="calc-periodo">Check-in / Check-out</label>
            <select id="calc-periodo" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {Object.entries(PERIODOS).map(([id, txt]) => (
                <option key={id} value={id}>{txt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="calc-pessoas">{tipoAtual === 'evento' ? 'Quantidade de pessoas' : 'Hóspedes com pernoite'}</label>
          <input
            id="calc-pessoas"
            type="number"
            inputMode="numeric"
            min="1"
            value={pessoasTxt}
            onChange={(e) => setPessoasTxt(e.target.value)}
          />
        </div>

        {!pacote.semConvidados && (
          <div className="field">
            <label htmlFor="calc-convidados">Convidados sem pernoite (+{formatBRL(local.convidado)} cada)</label>
            <input
              id="calc-convidados"
              type="number"
              inputMode="numeric"
              min="0"
              value={convidadosTxt}
              onChange={(e) => setConvidadosTxt(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="result-box" aria-live="polite">
        {r.sobConsulta ? (
          <p className="result-consulta">
            Para grupos acima de {r.maxPessoas} pessoas neste pacote, os valores são sob consulta.
          </p>
        ) : (
          <>
            <div className="result-row">
              <span>{pacote.nome} ({r.faixa})</span>
              <span>{formatBRL(r.valBase)}</span>
            </div>
            {r.valSexta > 0 && (
              <div className="result-row">
                <span>Entrada na sexta às 18h</span>
                <span>{formatBRL(r.valSexta)}</span>
              </div>
            )}
            {r.valConvidados > 0 && (
              <div className="result-row">
                <span>Convidados sem pernoite ({convidados}×)</span>
                <span>{formatBRL(r.valConvidados)}</span>
              </div>
            )}
            <div className="result-row">
              <span>Taxa de limpeza</span>
              <span>{formatBRL(r.limpeza)}</span>
            </div>
            <div className="result-row total">
              <span>Valor estimado</span>
              <span>{formatBRL(r.total)}</span>
            </div>
          </>
        )}
        <a className="button-primary" href={whatsappLink(mensagem())} target="_blank" rel="noopener noreferrer">
          <WhatsAppIcon size={22} />
          {r.sobConsulta ? 'Consultar valores' : 'Solicitar datas'}
          <ChevronRight size={20} aria-hidden="true" />
        </a>
        <p className="result-note">Valores sujeitos à disponibilidade. Consulte antes de confirmar sua reserva.</p>
      </div>
    </div>
  )
}
