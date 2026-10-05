import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react'
import { useDb } from '../data/store'
import { addDias, fmtData, hoje } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Cabecalho, Painel } from '../ui/components'
import Timeline, { LegendaTimeline } from '../ui/Timeline'

export default function Calendario() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const [dias, setDias] = useState(14)
  const [inicio, setInicio] = useState(() => addDias(hoje(), -1))
  const [filtro, setFiltro] = useState('ativos')

  const imoveis = estado.imoveis.filter((i) => (filtro === 'ativos' ? i.ativo : filtro === 'todos' ? true : i.id === filtro))
  const passo = dias === 14 ? 7 : 30

  return (
    <>
      <Cabecalho titulo="Calendário" descricao="Clique em um dia livre para criar uma reserva, ou numa barra para ver os detalhes.">
        <button type="button" className="btn" onClick={() => abrir('bloqueio-form')}><Lock size={16} aria-hidden="true" /> Bloquear datas</button>
        <button type="button" className="btn btn-primario" onClick={() => abrir('reserva-form')}><Plus size={16} aria-hidden="true" /> Nova reserva</button>
      </Cabecalho>

      <Painel
        acoes={
          <>
            <div className="nav-datas">
              <button type="button" className="btn-icone" onClick={() => setInicio(addDias(inicio, -passo))} aria-label="Anterior"><ChevronLeft size={18} /></button>
              <button type="button" className="btn btn-sm" onClick={() => setInicio(addDias(hoje(), -1))}>Hoje</button>
              <button type="button" className="btn-icone" onClick={() => setInicio(addDias(inicio, passo))} aria-label="Próximo"><ChevronRight size={18} /></button>
              <label className="nav-datas-ir">
                <span className="sr-only">Ir para a data</span>
                <input type="date" value={inicio} onChange={(e) => e.target.value && setInicio(e.target.value)} />
              </label>
              <span className="nav-datas-txt">{fmtData(inicio)} – {fmtData(addDias(inicio, dias - 1))}</span>
            </div>
            <div className="segmentado" role="group" aria-label="Quantidade de dias">
              <button type="button" className={dias === 14 ? 'ativo' : ''} onClick={() => setDias(14)}>14 dias</button>
              <button type="button" className={dias === 31 ? 'ativo' : ''} onClick={() => setDias(31)}>31 dias</button>
            </div>
            <select className="select-sm" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar imóveis">
              <option value="ativos">Imóveis ativos</option>
              <option value="todos">Todos os imóveis</option>
              {estado.imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </>
        }
      >
        <Timeline
          estado={estado}
          inicio={inicio}
          dias={dias}
          imoveis={imoveis}
          onDia={(im, d) => abrir('reserva-form', { inicial: { imovelId: im.id, checkin: d, checkout: addDias(d, 1) } })}
          onReserva={(r) => abrir('reserva', { id: r.id })}
          onBloqueio={(b) => abrir('bloqueio-form', { bloqueio: b })}
        />
        <div className="painel-rodape"><LegendaTimeline /></div>
      </Painel>
    </>
  )
}
