import { useState } from 'react'
import { MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { db, useDb } from '../data/store'
import { ativa, indexar, totalDe } from '../data/selectors'
import { brl, fmtData, fmtTelefone, whatsappDe } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Avatar, Campo, Modal, StatusBadge, Vazio } from '../ui/components'

export function ClienteForm({ cliente }) {
  const { fechar, abrir, aviso } = useAdminUI()
  const [f, setF] = useState({
    nome: cliente?.nome || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    documento: cliente?.documento || '',
    cidade: cliente?.cidade || '',
    obs: cliente?.obs || '',
  })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const salvar = (e) => {
    e.preventDefault()
    if (!f.nome.trim()) {
      setErro('Informe o nome.')
      return
    }
    const dados = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()]))
    if (cliente) {
      db.atualizar('clientes', cliente.id, dados)
      aviso('Cliente atualizado.')
      abrir('cliente', { id: cliente.id })
    } else {
      const novo = db.inserir('clientes', dados)
      aviso('Cliente cadastrado.')
      abrir('cliente', { id: novo.id })
    }
  }

  return (
    <Modal
      titulo={cliente ? 'Editar cliente' : 'Novo cliente'}
      onClose={fechar}
      rodape={
        <>
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" form="form-cliente" className="btn btn-primario">Salvar</button>
        </>
      }
    >
      <form id="form-cliente" className="form-grade" onSubmit={salvar} noValidate>
        <Campo label="Nome completo / empresa" erro={erro} largo>
          <input value={f.nome} onChange={set('nome')} autoComplete="off" />
        </Campo>
        <Campo label="WhatsApp / telefone">
          <input value={f.telefone} onChange={set('telefone')} inputMode="tel" placeholder="(11) 90000-0000" />
        </Campo>
        <Campo label="E-mail">
          <input type="email" value={f.email} onChange={set('email')} />
        </Campo>
        <Campo label="CPF / CNPJ" dica="Aparece no contrato">
          <input value={f.documento} onChange={set('documento')} />
        </Campo>
        <Campo label="Cidade">
          <input value={f.cidade} onChange={set('cidade')} />
        </Campo>
        <Campo label="Observações" largo>
          <textarea rows={3} value={f.obs} onChange={set('obs')} />
        </Campo>
      </form>
    </Modal>
  )
}

export function ClienteDetalhe({ id }) {
  const estado = useDb()
  const { fechar, abrir, aviso } = useAdminUI()
  const c = estado.clientes.find((x) => x.id === id)
  if (!c) {
    return <Modal titulo="Cliente não encontrado" onClose={fechar}><Vazio titulo="Este cliente foi removido." /></Modal>
  }

  const imoveis = indexar(estado.imoveis)
  const reservas = estado.reservas.filter((r) => r.clienteId === c.id).sort((a, b) => b.checkin.localeCompare(a.checkin))
  const gasto = reservas.filter(ativa).reduce((s, r) => s + totalDe(r), 0)
  const whats = whatsappDe(c.telefone)

  const excluir = () => {
    if (reservas.length) {
      aviso('Este cliente tem reservas. Exclua ou transfira as reservas antes.', 'erro')
      return
    }
    if (!window.confirm(`Excluir o cliente ${c.nome}?`)) return
    db.remover('clientes', c.id)
    fechar()
    aviso('Cliente excluído.')
  }

  return (
    <Modal
      titulo={<span className="titulo-reserva"><Avatar nome={c.nome} /> {c.nome}</span>}
      subtitulo={[fmtTelefone(c.telefone), c.email, c.cidade].filter(Boolean).join(' · ') || null}
      onClose={fechar}
      largura="lg"
      rodape={
        <>
          <button type="button" className="btn btn-perigo-txt" onClick={excluir}><Trash2 size={16} aria-hidden="true" /> Excluir</button>
          <span className="espaco" />
          {whats && <a className="btn btn-whats" href={whats} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> WhatsApp</a>}
          <button type="button" className="btn" onClick={() => abrir('cliente-form', { cliente: c })}><Pencil size={16} aria-hidden="true" /> Editar</button>
          <button type="button" className="btn btn-primario" onClick={() => abrir('reserva-form', { inicial: { clienteId: c.id } })}><Plus size={16} aria-hidden="true" /> Nova reserva</button>
        </>
      }
    >
      <div className="fin-resumo">
        <div><span>Reservas</span><strong>{reservas.length}</strong></div>
        <div><span>Total contratado</span><strong>{brl(gasto)}</strong></div>
        <div><span>CPF / CNPJ</span><strong>{c.documento || '—'}</strong></div>
        <div><span>Cliente desde</span><strong>{fmtData(c.criadoEm)}</strong></div>
      </div>
      {c.obs && <p className="pre-linha mt">{c.obs}</p>}

      <h3 className="mt">Histórico</h3>
      {reservas.length ? (
        <table className="tabela tabela-compacta tabela-clicavel">
          <thead><tr><th>Código</th><th>Imóvel</th><th>Período</th><th className="num">Total</th><th>Situação</th></tr></thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} onClick={() => abrir('reserva', { id: r.id })}>
                <td><button type="button" className="link-forte" onClick={() => abrir('reserva', { id: r.id })}>{r.codigo}</button></td>
                <td>{imoveis[r.imovelId]?.nome}</td>
                <td>{fmtData(r.checkin)} – {fmtData(r.checkout)}</td>
                <td className="num">{brl(totalDe(r))}</td>
                <td><StatusBadge reserva={r} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <Vazio titulo="Nenhuma reserva ainda." />}
    </Modal>
  )
}
