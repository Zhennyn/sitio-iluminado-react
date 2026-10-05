import { useMemo } from 'react'
import { Lock } from 'lucide-react'
import { ativa, indexar, statusDe } from '../data/selectors'
import { addDias, DIAS_SEMANA, diaSemana, diffDias, fmtData, hoje } from '../lib/format'
import { ImovelThumb } from './components'

const COR_BARRA = { pre: 'pre', aguardando_sinal: 'sinal', confirmada: 'reservado', concluida: 'concluido' }

// Grade imóveis × dias com as reservas desenhadas como barras.
export default function Timeline({ estado, inicio, dias, imoveis, onDia, onReserva, onBloqueio }) {
  const dia0 = hoje()
  const fim = addDias(inicio, dias - 1)
  const datas = useMemo(() => Array.from({ length: dias }, (_, i) => addDias(inicio, i)), [inicio, dias])
  const clientes = useMemo(() => indexar(estado.clientes), [estado.clientes])

  const coluna = (ini, f) => {
    const s = Math.max(0, diffDias(inicio, ini))
    const e = Math.min(dias - 1, diffDias(inicio, f))
    return { gridColumn: `${s + 1} / ${e + 2}` }
  }

  return (
    <div className="tl-scroll">
      <div className="tl" style={{ '--dias': dias }}>
        <div className="tl-linha tl-topo">
          <div className="tl-imovel tl-imovel-cab">Imóvel</div>
          <div className="tl-grade">
            {datas.map((d) => {
              const dow = diaSemana(d)
              return (
                <div key={d} className={`tl-dia-cab${d === dia0 ? ' hoje' : ''}${dow === 0 || dow === 6 ? ' fds' : ''}`}>
                  <strong>{d.slice(8)}</strong>
                  <span>{DIAS_SEMANA[dow]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {imoveis.map((im) => {
          const reservas = estado.reservas.filter(
            (r) => r.imovelId === im.id && ativa(r) && r.checkin <= fim && r.checkout >= inicio,
          )
          const bloqueios = estado.bloqueios.filter((b) => b.imovelId === im.id && b.inicio <= fim && b.fim >= inicio)
          return (
            <div className="tl-linha" key={im.id}>
              <div className="tl-imovel">
                <ImovelThumb imovel={im} tamanho={36} />
                <span>
                  <strong>{im.nome}</strong>
                  <small>{im.cidade}</small>
                </span>
              </div>
              <div className="tl-grade">
                {datas.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    className={`tl-cel${d < dia0 ? ' passado' : ''}`}
                    style={{ gridColumn: i + 1 }}
                    onClick={() => onDia?.(im, d)}
                    aria-label={`${im.nome}, ${fmtData(d)}: livre — criar reserva`}
                  />
                ))}
                {bloqueios.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`tl-barra tl-bloqueio${b.inicio < inicio ? ' corta-ini' : ''}${b.fim > fim ? ' corta-fim' : ''}`}
                    style={coluna(b.inicio, b.fim)}
                    onClick={() => onBloqueio?.(b)}
                    title={`Bloqueado: ${b.motivo || 'sem motivo'} (${fmtData(b.inicio)} a ${fmtData(b.fim)})`}
                  >
                    <Lock size={12} aria-hidden="true" /> <span>{b.motivo || 'Bloqueado'}</span>
                  </button>
                ))}
                {reservas.map((r) => {
                  const st = statusDe(r, dia0)
                  const nome = r.titulo ? `${clientes[r.clienteId]?.nome?.split(' ')[0] ?? ''} · ${r.titulo}` : clientes[r.clienteId]?.nome
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`tl-barra tl-${COR_BARRA[st]}${r.checkin < inicio ? ' corta-ini' : ''}${r.checkout > fim ? ' corta-fim' : ''}`}
                      style={coluna(r.checkin, r.checkout)}
                      onClick={() => onReserva?.(r)}
                      title={`${r.codigo} — ${nome} (${fmtData(r.checkin)} a ${fmtData(r.checkout)})`}
                    >
                      <span>{st === 'pre' ? 'Pré · ' : ''}{nome}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LegendaTimeline() {
  return (
    <ul className="tl-legenda">
      <li><i className="tl-livre" /> Livre</li>
      <li><i className="tl-pre" /> Pré-reserva</li>
      <li><i className="tl-sinal" /> Aguardando sinal</li>
      <li><i className="tl-reservado" /> Reservado</li>
      <li><i className="tl-concluido" /> Concluído</li>
      <li><i className="tl-bloqueio" /> Bloqueado</li>
    </ul>
  )
}
