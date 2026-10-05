import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import CalendarioDisponibilidade from './CalendarioDisponibilidade'
import { whatsappLink } from '../data/site'
import {
  LOCAIS, LOCAL_PADRAO, PERIODOS, calcularOrcamento, capacidadeDe, formatBRL, sugerirPacote, temTabela,
} from '../data/locais'
import { useDb } from '../admin/data/store'
import { diasOcupados } from '../admin/data/selectors'
import { addDias, diffDias, fmtData } from '../admin/lib/format'

// `inicial` vem dos cards de imóveis ("Simular valor"); a Home remonta o componente a cada escolha.
export default function Calculadora({ inicial = {} }) {
  const estado = useDb()
  const [localId, setLocalId] = useState(inicial.localId || LOCAL_PADRAO)
  const [checkin, setCheckin] = useState(inicial.checkin || null)
  const [checkout, setCheckout] = useState(inicial.checkout || null)
  const [sugestaoInicial] = useState(() =>
    inicial.checkin && inicial.checkout ? sugerirPacote(LOCAIS[localId], inicial.checkin, inicial.checkout) : null,
  )
  const [tipo, setTipo] = useState(sugestaoInicial?.pacote || 'hospedagem')
  const [periodo, setPeriodo] = useState(sugestaoInicial?.periodo || 'sab_dom')
  const [semPacote, setSemPacote] = useState(!!inicial.checkout && !sugestaoInicial)
  // Guardados como texto para o campo poder ficar vazio enquanto a pessoa digita.
  const [pessoasTxt, setPessoasTxt] = useState('15')
  const [convidadosTxt, setConvidadosTxt] = useState('0')
  const [criancasTxt, setCriancasTxt] = useState('0')
  const [bebesTxt, setBebesTxt] = useState('0')

  const local = LOCAIS[localId]
  const ocupados = useMemo(() => diasOcupados(estado, localId), [estado, localId])
  const tabela = temTabela(local)
  // Imóveis sem tabela ficam sem pacote: o valor é sob consulta.
  const tipoAtual = local.pacotes[tipo] ? tipo : Object.keys(local.pacotes)[0]
  const pacote = tipoAtual ? local.pacotes[tipoAtual] : null
  const evento = !!pacote?.semConvidados
  const pessoas = Math.max(1, parseInt(pessoasTxt, 10) || 1)
  const convidados = evento ? 0 : Math.max(0, parseInt(convidadosTxt, 10) || 0)
  // Hospedagem: até 3 anos não conta; de 4 a 9 anos conta meia vaga na faixa do pacote.
  const criancas = evento ? 0 : Math.max(0, parseInt(criancasTxt, 10) || 0)
  const bebes = evento ? 0 : Math.max(0, parseInt(bebesTxt, 10) || 0)
  const r = pacote ? calcularOrcamento(localId, tipoAtual, periodo, pessoas + criancas / 2, convidados) : null

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
    ]
    if (pacote) linhas.push(`*Pacote:* ${pacote.nome}`)
    if (checkin && checkout) linhas.push(`*Datas:* ${fmtData(checkin)} a ${fmtData(checkout)}`)
    if (pacote?.periodos) linhas.push(`*Período:* ${PERIODOS[periodo]}`)
    linhas.push(`*${evento ? 'Pessoas' : 'Adultos (10+ anos)'}:* ${pessoas}`)
    if (criancas > 0) linhas.push(`*Crianças de 4 a 9 anos:* ${criancas}`)
    if (bebes > 0) linhas.push(`*Crianças até 3 anos:* ${bebes}`)
    if (convidados > 0) linhas.push(`*Convidados sem pernoite:* ${convidados}`)
    if (r && !r.sobConsulta) linhas.push('', `*Valor estimado:* ${formatBRL(r.total)}`)
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
          {semPacote && tabela && (
            <p className="field-hint">Nenhum pacote da tabela cobre essa estadia. Escolha o pacote mais próximo ou consulte pelo WhatsApp.</p>
          )}
        </div>

        {pacote && (
          <div className={`field${pacote.periodos ? '' : ' full'}`}>
            <label htmlFor="calc-tipo">Pacote</label>
            <select id="calc-tipo" value={tipoAtual} onChange={(e) => setTipo(e.target.value)}>
              {Object.entries(local.pacotes).map(([id, p]) => (
                <option key={id} value={id}>{p.nome}</option>
              ))}
            </select>
            {pacote.detalhe && <p className="field-hint">{pacote.detalhe}</p>}
          </div>
        )}

        {pacote?.periodos && (
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
          <label htmlFor="calc-pessoas">{evento ? 'Quantidade de pessoas' : 'Adultos e crianças de 10+ anos'}</label>
          <input
            id="calc-pessoas"
            type="number"
            inputMode="numeric"
            min="1"
            value={pessoasTxt}
            onChange={(e) => setPessoasTxt(e.target.value)}
          />
        </div>

        {!evento && (
          <>
            <div className="field">
              <label htmlFor="calc-criancas">Crianças de 4 a 9 anos (meia vaga)</label>
              <input
                id="calc-criancas"
                type="number"
                inputMode="numeric"
                min="0"
                value={criancasTxt}
                onChange={(e) => setCriancasTxt(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="calc-bebes">Crianças até 3 anos (grátis)</label>
              <input
                id="calc-bebes"
                type="number"
                inputMode="numeric"
                min="0"
                value={bebesTxt}
                onChange={(e) => setBebesTxt(e.target.value)}
              />
              {pacote?.datas && tipoAtual !== 'carnaval_2027' && (
                <p className="field-hint">Natal e Réveillon têm regras próprias para crianças. Confirme pelo WhatsApp.</p>
              )}
            </div>
          </>
        )}

        {!evento && (
          <div className="field">
            <label htmlFor="calc-convidados">
              Convidados sem pernoite{tabela ? ` (+${formatBRL(local.convidado)} cada)` : ''}
            </label>
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
        {!r ? (
          <p className="result-consulta">
            Os valores do {local.nome} são sob consulta. Envie as datas e o tamanho do grupo pelo WhatsApp.
          </p>
        ) : r.sobConsulta ? (
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
          {!r || r.sobConsulta ? 'Consultar valores' : 'Solicitar datas'}
          <ChevronRight size={20} aria-hidden="true" />
        </a>
        <p className="result-note">Valores sujeitos à disponibilidade. Consulte antes de confirmar sua reserva.</p>
      </div>
    </div>
  )
}
