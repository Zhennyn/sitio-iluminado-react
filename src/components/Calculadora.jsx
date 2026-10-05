import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import {
  PACOTES, PERIODOS, TAXA_LIMPEZA, VALOR_CONVIDADO, calcularOrcamento, formatBRL, whatsappLink,
} from '../data/site'

export default function Calculadora() {
  const [tipo, setTipo] = useState('hospedagem')
  const [periodo, setPeriodo] = useState('sab_dom')
  // Guardados como texto para o campo poder ficar vazio enquanto a pessoa digita.
  const [pessoasTxt, setPessoasTxt] = useState('15')
  const [convidadosTxt, setConvidadosTxt] = useState('0')

  const pacote = PACOTES[tipo]
  const pessoas = Math.max(1, parseInt(pessoasTxt, 10) || 1)
  const convidados = pacote.semConvidados ? 0 : Math.max(0, parseInt(convidadosTxt, 10) || 0)
  const r = calcularOrcamento(tipo, periodo, pessoas, convidados)

  const mensagem = () => {
    const linhas = [
      'Olá! Gostaria de fazer uma reserva no Sítio Iluminado.',
      '',
      `*Pacote:* ${pacote.nome}`,
    ]
    if (pacote.periodos) linhas.push(`*Período:* ${PERIODOS[periodo]}`)
    linhas.push(`*${tipo === 'evento' ? 'Pessoas' : 'Hóspedes'}:* ${pessoas}`)
    if (convidados > 0) linhas.push(`*Convidados sem pernoite:* ${convidados}`)
    if (!r.sobConsulta) linhas.push('', `*Valor estimado:* ${formatBRL(r.total)}`)
    linhas.push('', 'Podemos confirmar a disponibilidade?')
    return linhas.join('\n')
  }

  return (
    <div className="calc-container">
      <div className="eyebrow">Orçamento</div>
      <h2>Simule sua reserva</h2>
      <p className="calc-lead">Escolha o pacote e veja o valor na hora. A confirmação é feita pelo WhatsApp.</p>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="calc-tipo">Pacote</label>
          <select id="calc-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {Object.entries(PACOTES).map(([id, p]) => (
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

        <div className={`field${pacote.periodos ? '' : ' full'}`}>
          <label htmlFor="calc-pessoas">{tipo === 'evento' ? 'Quantidade de pessoas' : 'Hóspedes com pernoite'}</label>
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
          <div className="field full">
            <label htmlFor="calc-convidados">Convidados sem pernoite (+{formatBRL(VALOR_CONVIDADO)} por pessoa)</label>
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
              <span>Pacote ({r.faixa})</span>
              <span>{formatBRL(r.valBase)}</span>
            </div>
            {r.valConvidados > 0 && (
              <div className="result-row">
                <span>Convidados sem pernoite ({convidados}×)</span>
                <span>{formatBRL(r.valConvidados)}</span>
              </div>
            )}
            <div className="result-row">
              <span>Taxa de limpeza</span>
              <span>{formatBRL(TAXA_LIMPEZA)}</span>
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
