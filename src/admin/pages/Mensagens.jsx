import { useMemo, useState } from 'react'
import { Copy, MessageCircle, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { db, uid, useDb } from '../data/store'
import { TEMPLATES_PADRAO } from '../data/seed'
import { VARIAVEIS_TEMPLATE, ativa, indexar, preencherTemplate } from '../data/selectors'
import { fmtData, hoje, whatsappDe } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Cabecalho, Campo, Painel, Vazio } from '../ui/components'

export default function Mensagens() {
  const estado = useDb()
  const { aviso } = useAdminUI()
  const { config } = estado
  const templates = config.templates
  const imoveis = indexar(estado.imoveis)
  const clientes = indexar(estado.clientes)

  const reservas = useMemo(() => {
    const dia = hoje()
    return estado.reservas
      .filter(ativa)
      .sort((a, b) => {
        // futuras primeiro (mais próximas no topo), depois as passadas mais recentes
        const fa = a.checkout >= dia
        const fb = b.checkout >= dia
        if (fa !== fb) return fa ? -1 : 1
        return fa ? a.checkin.localeCompare(b.checkin) : b.checkin.localeCompare(a.checkin)
      })
  }, [estado.reservas])

  const [reservaId, setReservaId] = useState(reservas[0]?.id || '')
  const [templateId, setTemplateId] = useState(templates[0]?.id || '')
  const [editando, setEditando] = useState(templates[0]?.id || '')

  const reserva = estado.reservas.find((r) => r.id === reservaId)
  const template = templates.find((t) => t.id === templateId)
  const cliente = reserva && clientes[reserva.clienteId]
  const texto = reserva && template ? preencherTemplate(template.texto, { reserva, cliente, imovel: imoveis[reserva.imovelId], config }) : ''
  const link = cliente && whatsappDe(cliente.telefone, texto)

  const tEdit = templates.find((t) => t.id === editando)
  const salvarTemplates = (lista) => db.salvarConfig({ templates: lista })
  const editar = (patch) => salvarTemplates(templates.map((t) => (t.id === editando ? { ...t, ...patch } : t)))

  const novo = () => {
    const t = { id: uid(), nome: 'Nova mensagem', texto: 'Olá, {cliente}! ' }
    salvarTemplates([...templates, t])
    setEditando(t.id)
  }
  const excluir = () => {
    if (templates.length <= 1 || !window.confirm(`Excluir o modelo “${tEdit.nome}”?`)) return
    const resto = templates.filter((t) => t.id !== editando)
    salvarTemplates(resto)
    setEditando(resto[0].id)
    if (templateId === editando) setTemplateId(resto[0].id)
  }
  const restaurar = () => {
    if (!window.confirm('Restaurar os modelos padrão? Suas alterações nos modelos serão perdidas.')) return
    salvarTemplates(TEMPLATES_PADRAO)
    setEditando(TEMPLATES_PADRAO[0].id)
    setTemplateId(TEMPLATES_PADRAO[0].id)
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      aviso('Mensagem copiada.')
    } catch {
      aviso('Não foi possível copiar. Selecione o texto e copie manualmente.', 'erro')
    }
  }

  return (
    <>
      <Cabecalho titulo="Mensagens" descricao="Modelos de WhatsApp preenchidos automaticamente com os dados da reserva." />

      <div className="grade-2">
        <Painel titulo="Enviar mensagem">
          {reservas.length ? (
            <div className="form-grade">
              <Campo label="Reserva" largo>
                <select value={reservaId} onChange={(e) => setReservaId(e.target.value)}>
                  {reservas.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.codigo} — {clientes[r.clienteId]?.nome} · {imoveis[r.imovelId]?.nome} · {fmtData(r.checkin)}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Modelo" largo>
                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
                  {templates.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </Campo>
              <div className="campo-largo">
                <span className="campo-label">Prévia</span>
                <div className="previa-whats">{texto}</div>
              </div>
              <div className="campo-largo botoes">
                <button type="button" className="btn" onClick={copiar} disabled={!texto}><Copy size={16} aria-hidden="true" /> Copiar</button>
                {link ? (
                  <a className="btn btn-whats" href={link} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> Abrir no WhatsApp</a>
                ) : <span className="muted">O cliente não tem telefone cadastrado.</span>}
              </div>
            </div>
          ) : <Vazio icone={MessageCircle} titulo="Crie uma reserva para enviar mensagens." />}
        </Painel>

        <Painel
          titulo="Modelos"
          acoes={
            <>
              <button type="button" className="btn btn-sm" onClick={restaurar}><RotateCcw size={14} aria-hidden="true" /> Padrões</button>
              <button type="button" className="btn btn-sm btn-primario" onClick={novo}><Plus size={14} aria-hidden="true" /> Novo</button>
            </>
          }
        >
          <div className="chips">
            {templates.map((t) => (
              <button key={t.id} type="button" className={`chip${t.id === editando ? ' chip-ativo' : ''}`} onClick={() => setEditando(t.id)}>{t.nome}</button>
            ))}
          </div>
          {tEdit && (
            <div className="form-grade">
              <Campo label="Nome do modelo" largo>
                <input value={tEdit.nome} onChange={(e) => editar({ nome: e.target.value })} />
              </Campo>
              <Campo label="Texto" largo dica="Salvo automaticamente. Use *texto* para negrito no WhatsApp.">
                <textarea rows={10} value={tEdit.texto} onChange={(e) => editar({ texto: e.target.value })} />
              </Campo>
              <div className="campo-largo">
                <span className="campo-label">Variáveis disponíveis (clique para inserir)</span>
                <div className="chips">
                  {VARIAVEIS_TEMPLATE.map((v) => (
                    <button key={v} type="button" className="chip chip-var" onClick={() => editar({ texto: `${tEdit.texto}{${v}}` })}>{`{${v}}`}</button>
                  ))}
                </div>
              </div>
              <div className="campo-largo">
                <button type="button" className="btn btn-perigo-txt btn-sm" onClick={excluir} disabled={templates.length <= 1}><Trash2 size={14} aria-hidden="true" /> Excluir modelo</button>
              </div>
            </div>
          )}
        </Painel>
      </div>
    </>
  )
}
