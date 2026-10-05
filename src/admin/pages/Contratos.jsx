import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { db, useDb } from '../data/store'
import { CONTRATO, ativa, indexar } from '../data/selectors'
import { abrirContrato } from '../lib/contrato'
import { fmtData, hoje } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Cabecalho, ContratoBadge, Painel, StatusBadge, Vazio } from '../ui/components'

export default function Contratos() {
  const estado = useDb()
  const { abrir, aviso } = useAdminUI()
  const [filtro, setFiltro] = useState('pendentes')
  const imoveis = indexar(estado.imoveis)
  const clientes = indexar(estado.clientes)
  const dia = hoje()

  const lista = estado.reservas
    .filter(ativa)
    .filter((r) => {
      if (filtro === 'pendentes') return r.contrato !== 'assinado' && r.checkout >= dia
      if (filtro === 'todos') return true
      return r.contrato === filtro
    })
    .sort((a, b) => a.checkin.localeCompare(b.checkin))

  const gerar = (r) => {
    const ok = abrirContrato({ reserva: r, cliente: clientes[r.clienteId], imovel: imoveis[r.imovelId], config: estado.config })
    if (!ok) {
      aviso('O navegador bloqueou a nova aba. Permita pop-ups para este site.', 'erro')
      return
    }
    if (r.contrato === 'pendente') db.atualizar('reservas', r.id, { contrato: 'gerado' })
  }

  return (
    <>
      <Cabecalho titulo="Contratos" descricao="Gere o contrato de locação a partir da reserva e acompanhe a assinatura.">
        <button type="button" className="btn btn-primario" onClick={() => abrir('reserva-form')}><Plus size={16} aria-hidden="true" /> Nova reserva</button>
      </Cabecalho>

      <div className="abas" role="tablist">
        {[['pendentes', 'A assinar'], ...Object.entries(CONTRATO).map(([k, v]) => [k, v.label]), ['todos', 'Todos']].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={filtro === k} className={filtro === k ? 'ativo' : ''} onClick={() => setFiltro(k)}>{l}</button>
        ))}
      </div>

      <Painel>
        {lista.length ? (
          <div className="tabela-scroll">
            <table className="tabela">
              <thead><tr><th>Reserva</th><th>Cliente</th><th>Imóvel</th><th>Período</th><th>Situação</th><th>Contrato</th><th /></tr></thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id}>
                    <td><button type="button" className="link-forte" onClick={() => abrir('reserva', { id: r.id })}>{r.codigo}</button></td>
                    <td>{clientes[r.clienteId]?.nome}</td>
                    <td>{imoveis[r.imovelId]?.nome}</td>
                    <td>{fmtData(r.checkin)} – {fmtData(r.checkout)}</td>
                    <td><StatusBadge reserva={r} /></td>
                    <td>
                      <select className="select-sm" value={r.contrato} onChange={(e) => db.atualizar('reservas', r.id, { contrato: e.target.value })} aria-label={`Situação do contrato ${r.codigo}`}>
                        {Object.entries(CONTRATO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="num">
                      <button type="button" className="btn btn-sm" onClick={() => gerar(r)}><FileText size={14} aria-hidden="true" /> Gerar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Vazio icone={FileText} titulo="Nenhum contrato nesta situação." />}
      </Painel>
      <p className="muted nota">Dica: preencha CPF/CNPJ, chave Pix e foro em Configurações para que apareçam no contrato. <ContratoBadge status="assinado" /> some da lista “A assinar”.</p>
    </>
  )
}
