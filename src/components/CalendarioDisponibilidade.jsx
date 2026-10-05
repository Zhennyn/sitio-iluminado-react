import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FERIADOS } from '../data/locais'
import { DIAS_SEMANA, addDias, addMes, diasNoMes, diaSemana, fmtMes, hoje, inicioMes, mesAtual } from '../admin/lib/format'

// Calendário de disponibilidade: dias ocupados ficam bloqueados e a pessoa escolhe
// check-in e check-out com dois cliques (o mesmo dia duas vezes = diária sem pernoite).
export default function CalendarioDisponibilidade({ ocupados, inicio, fim, onChange }) {
  const [mes, setMes] = useState(() => (inicio ? inicio.slice(0, 7) : mesAtual()))
  const hj = hoje()
  const primeiro = inicioMes(mes)
  const vazios = diaSemana(primeiro)
  const dias = Array.from({ length: diasNoMes(mes) }, (_, i) => addDias(primeiro, i))

  const livreEntre = (a, b) => {
    for (let d = a; d <= b; d = addDias(d, 1)) if (ocupados.has(d)) return false
    return true
  }

  const escolher = (d) => {
    if (!inicio || fim) onChange(d, null)
    else if (d < inicio || !livreEntre(inicio, d)) onChange(d, null)
    else onChange(inicio, d)
  }

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => setMes(addMes(mes, -1))} disabled={mes <= mesAtual()} aria-label="Mês anterior">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <strong aria-live="polite">{fmtMes(mes)}</strong>
        <button type="button" className="cal-nav" onClick={() => setMes(addMes(mes, 1))} aria-label="Próximo mês">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="cal-grid">
        {DIAS_SEMANA.map((d) => <span key={d} className="cal-dow" aria-hidden="true">{d}</span>)}
        {Array.from({ length: vazios }, (_, i) => <span key={`v${i}`} />)}
        {dias.map((d) => {
          const passado = d < hj
          const ocupado = ocupados.has(d)
          const selecionado = d === inicio || d === fim || (inicio && fim && inicio < d && d < fim)
          const feriado = FERIADOS[d]
          const cls = ['cal-dia']
          if (passado) cls.push('is-passado')
          else if (ocupado) cls.push('is-ocupado')
          if (selecionado) cls.push('is-sel')
          if (d === inicio) cls.push('is-ini')
          if (d === (fim || inicio)) cls.push('is-fim')
          if (feriado) cls.push('is-feriado')
          const status = passado ? '' : ocupado ? ', reservado' : ', disponível'
          return (
            <button
              key={d}
              type="button"
              className={cls.join(' ')}
              disabled={passado || ocupado}
              onClick={() => escolher(d)}
              aria-pressed={!!selecionado}
              aria-label={`${Number(d.slice(8))} de ${fmtMes(mes)}${feriado ? `, ${feriado}` : ''}${status}`}
              title={feriado || undefined}
            >
              {Number(d.slice(8))}
            </button>
          )
        })}
      </div>

      <ul className="cal-legenda">
        <li><span className="cal-ponto livre" /> Disponível</li>
        <li><span className="cal-ponto ocupado" /> Reservado</li>
        <li><span className="cal-ponto sel" /> Selecionado</li>
        <li><span className="cal-ponto feriado" /> Feriado</li>
      </ul>
    </div>
  )
}
