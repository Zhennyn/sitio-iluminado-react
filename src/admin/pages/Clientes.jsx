import { useMemo, useState } from 'react'
import { Download, MessageCircle, UserPlus, Users } from 'lucide-react'
import { useDb } from '../data/store'
import { ativa, totalDe } from '../data/selectors'
import { baixarCSV } from '../lib/arquivos'
import { brl, fmtData, fmtTelefone, hoje, normalizar, whatsappDe } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Avatar, Cabecalho, Painel, Vazio } from '../ui/components'

export default function Clientes() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('nome')

  const linhas = useMemo(() => {
    const t = normalizar(busca.trim())
    return estado.clientes
      .filter((c) => !t || normalizar(`${c.nome} ${c.telefone} ${c.email} ${c.cidade} ${c.documento}`).includes(t))
      .map((c) => {
        const rs = estado.reservas.filter((r) => r.clienteId === c.id)
        const validas = rs.filter(ativa)
        return {
          c,
          reservas: rs.length,
          total: validas.reduce((s, r) => s + totalDe(r), 0),
          ultima: validas.map((r) => r.checkin).sort().pop() || '',
        }
      })
      .sort((a, b) => {
        if (ordem === 'total') return b.total - a.total
        if (ordem === 'recentes') return b.ultima.localeCompare(a.ultima)
        return a.c.nome.localeCompare(b.c.nome)
      })
  }, [estado.clientes, estado.reservas, busca, ordem])

  const exportar = () =>
    baixarCSV(
      `clientes-${hoje()}.csv`,
      ['Nome', 'Telefone', 'E-mail', 'CPF/CNPJ', 'Cidade', 'Reservas', 'Total contratado', 'Última estadia'],
      linhas.map(({ c, reservas, total, ultima }) => [c.nome, c.telefone, c.email, c.documento, c.cidade, reservas, total, fmtData(ultima)]),
    )

  return (
    <>
      <Cabecalho titulo="Clientes" descricao={`${estado.clientes.length} cliente${estado.clientes.length === 1 ? '' : 's'} cadastrado${estado.clientes.length === 1 ? '' : 's'}`}>
        <button type="button" className="btn" onClick={exportar} disabled={!linhas.length}><Download size={16} aria-hidden="true" /> Exportar CSV</button>
        <button type="button" className="btn btn-primario" onClick={() => abrir('cliente-form')}><UserPlus size={16} aria-hidden="true" /> Novo cliente</button>
      </Cabecalho>

      <Painel>
        <div className="filtros">
          <input type="search" placeholder="Buscar por nome, telefone, e-mail, cidade…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar clientes" />
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar por">
            <option value="nome">Ordem alfabética</option>
            <option value="recentes">Estadia mais recente</option>
            <option value="total">Maior valor contratado</option>
          </select>
        </div>

        {linhas.length ? (
          <div className="tabela-scroll">
            <table className="tabela tabela-clicavel">
              <thead>
                <tr><th>Cliente</th><th>Telefone</th><th>Cidade</th><th className="num">Reservas</th><th className="num">Total contratado</th><th>Última estadia</th><th /></tr>
              </thead>
              <tbody>
                {linhas.map(({ c, reservas, total, ultima }) => {
                  const w = whatsappDe(c.telefone)
                  return (
                    <tr key={c.id} onClick={() => abrir('cliente', { id: c.id })}>
                      <td>
                        <span className="celula-cliente">
                          <Avatar nome={c.nome} />
                          <button type="button" className="link-forte" onClick={(e) => { e.stopPropagation(); abrir('cliente', { id: c.id }) }}>{c.nome}</button>
                        </span>
                      </td>
                      <td>{fmtTelefone(c.telefone) || '—'}</td>
                      <td>{c.cidade || '—'}</td>
                      <td className="num">{reservas}</td>
                      <td className="num">{brl(total)}</td>
                      <td>{fmtData(ultima)}</td>
                      <td className="num">
                        {w && (
                          <a className="btn-icone txt-verde" href={w} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`WhatsApp de ${c.nome}`}>
                            <MessageCircle size={17} />
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Vazio icone={Users} titulo={busca ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'} />}
      </Painel>
    </>
  )
}
