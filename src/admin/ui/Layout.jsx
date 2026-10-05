import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, BarChart3, Building2, CalendarDays, CalendarPlus, ClipboardList, ExternalLink, FileText, Handshake,
  LayoutDashboard, Menu, MessageSquare, Search, Settings, UserPlus, Users, Wallet, X,
} from 'lucide-react'
import { db, useDb } from '../data/store'
import { indexar, tarefasDe } from '../data/selectors'
import { fmtData, normalizar } from '../lib/format'
import { useAdminUI } from './context'
import { Avatar } from './components'
import ModalHost from './ModalHost'

const MENU = [
  { to: '/admin', end: true, icone: LayoutDashboard, label: 'Painel' },
  { to: '/admin/calendario', icone: CalendarDays, label: 'Calendário' },
  { to: '/admin/reservas', icone: ClipboardList, label: 'Reservas', badge: 'reservas' },
  { to: '/admin/imoveis', icone: Building2, label: 'Imóveis' },
  { to: '/admin/clientes', icone: Users, label: 'Clientes' },
  { to: '/admin/financeiro', icone: Wallet, label: 'Financeiro' },
  { to: '/admin/repasse', icone: Handshake, label: 'Repasse' },
  { to: '/admin/contratos', icone: FileText, label: 'Contratos', badge: 'contratos' },
  { to: '/admin/mensagens', icone: MessageSquare, label: 'Mensagens' },
  { to: '/admin/relatorios', icone: BarChart3, label: 'Relatórios' },
  { to: '/admin/configuracoes', icone: Settings, label: 'Configurações' },
]

const TITULOS = Object.fromEntries(MENU.map((m) => [m.to, m.label]))

export default function Layout() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const { pathname } = useLocation()
  const [menuAberto, setMenuAberto] = useState(false)

  const tarefas = useMemo(() => tarefasDe(estado), [estado])
  const badges = {
    reservas: estado.reservas.filter((r) => r.status === 'pre' || r.status === 'aguardando_sinal').length,
    contratos: tarefas.find((t) => t.id === 'contrato').itens.length,
  }
  const titulo = TITULOS[pathname.replace(/\/$/, '')] || 'Painel'

  return (
    <div className={`adm${menuAberto ? ' menu-aberto' : ''}`}>
      <title>{`${titulo} — ${estado.config.empresa}`}</title>
      <meta name="robots" content="noindex, nofollow" />

      {/* No celular, o menu fecha ao escolher um item. */}
      <aside className="sidebar" aria-label="Menu do painel" onClick={(e) => { if (e.target.closest('a, .atalho')) setMenuAberto(false) }}>
        <div className="sidebar-logo">
          <span className="sidebar-marca" aria-hidden="true">☀</span>
          <span>
            {estado.config.empresa.split(' ')[0]}
            <strong>{estado.config.empresa.split(' ').slice(1).join(' ')}</strong>
          </span>
          <button type="button" className="btn-icone sidebar-fechar" onClick={() => setMenuAberto(false)} aria-label="Fechar menu"><X size={20} /></button>
        </div>

        <nav className="sidebar-nav">
          {MENU.map(({ to, end, icone: Icone, label, badge }) => (
            <NavLink key={to} to={to} end={end} className="sidebar-item">
              <Icone size={19} aria-hidden="true" />
              <span>{label}</span>
              {badge && badges[badge] > 0 && <span className="sidebar-badge">{badges[badge]}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-atalhos">
          <h4>Atalhos rápidos</h4>
          <button type="button" className="atalho" onClick={() => abrir('reserva-form')}><span className="bg-green"><CalendarPlus size={16} /></span> Nova reserva</button>
          <button type="button" className="atalho" onClick={() => abrir('disponibilidade')}><span className="bg-blue"><Search size={16} /></span> Buscar disponibilidade</button>
          <button type="button" className="atalho" onClick={() => abrir('cliente-form')}><span className="bg-purple"><UserPlus size={16} /></span> Novo cliente</button>
          <Link className="atalho" to="/admin/contratos"><span className="bg-yellow"><FileText size={16} /></span> Gerar contrato</Link>
        </div>

        <Link to="/" className="sidebar-site"><ExternalLink size={15} aria-hidden="true" /> Ver o site</Link>
      </aside>
      <div className="sidebar-fundo" onClick={() => setMenuAberto(false)} aria-hidden="true" />

      <div className="adm-main">
        <header className="topbar">
          <button type="button" className="btn-icone topbar-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <span className="topbar-titulo">{titulo}</span>
          <BuscaGlobal />
          <div className="topbar-dir">
            <Alertas tarefas={tarefas} />
            <div className="topbar-user">
              <Avatar nome={estado.config.responsavel || estado.config.empresa} />
              <span>
                <strong>{estado.config.responsavel || estado.config.empresa}</strong>
                <small>Administrador</small>
              </span>
            </div>
          </div>
        </header>

        {db.falhouAoSalvar() && (
          <div className="alerta alerta-erro faixa">Não foi possível salvar no navegador (armazenamento cheio ou bloqueado). Exporte um backup em Configurações.</div>
        )}

        <main className="adm-conteudo">
          <Outlet />
        </main>
      </div>

      <ModalHost />
    </div>
  )
}

function useFecharAoClicarFora(aberto, fechar) {
  const ref = useRef(null)
  useEffect(() => {
    if (!aberto) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) fechar() }
    const onKey = (e) => { if (e.key === 'Escape') fechar() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [aberto, fechar])
  return ref
}

function BuscaGlobal() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [aberto, setAberto] = useState(false)
  const ref = useFecharAoClicarFora(aberto, () => setAberto(false))

  const termo = normalizar(q.trim())
  const resultados = useMemo(() => {
    if (termo.length < 2) return []
    const clientes = indexar(estado.clientes)
    const imoveis = indexar(estado.imoveis)
    const out = []
    for (const r of estado.reservas) {
      const cli = clientes[r.clienteId]?.nome || ''
      if (normalizar(`${r.codigo} ${cli} ${r.titulo}`).includes(termo)) {
        out.push({ tipo: 'Reserva', id: r.id, titulo: `${r.codigo} — ${cli}`, sub: `${imoveis[r.imovelId]?.nome ?? ''} · ${fmtData(r.checkin)}`, acao: () => abrir('reserva', { id: r.id }) })
      }
    }
    for (const c of estado.clientes) {
      if (normalizar(`${c.nome} ${c.telefone} ${c.email}`).includes(termo)) {
        out.push({ tipo: 'Cliente', id: c.id, titulo: c.nome, sub: c.telefone, acao: () => abrir('cliente', { id: c.id }) })
      }
    }
    for (const i of estado.imoveis) {
      if (normalizar(`${i.nome} ${i.cidade}`).includes(termo)) {
        out.push({ tipo: 'Imóvel', id: i.id, titulo: i.nome, sub: i.cidade, acao: () => navigate('/admin/imoveis') })
      }
    }
    return out.slice(0, 12)
  }, [termo, estado, abrir, navigate])

  const escolher = (r) => {
    r.acao()
    setQ('')
    setAberto(false)
  }

  return (
    <div className="busca" ref={ref}>
      <Search size={17} aria-hidden="true" />
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setAberto(true) }}
        onFocus={() => setAberto(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && resultados[0]) escolher(resultados[0]) }}
        placeholder="Buscar reservas, clientes ou imóveis…"
        aria-label="Buscar reservas, clientes ou imóveis"
      />
      {aberto && termo.length >= 2 && (
        <div className="dropdown busca-res">
          {resultados.length ? resultados.map((r) => (
            <button type="button" key={`${r.tipo}-${r.id}`} onClick={() => escolher(r)}>
              <span className="busca-tipo">{r.tipo}</span>
              <span><strong>{r.titulo}</strong><small>{r.sub}</small></span>
            </button>
          )) : <p className="dropdown-vazio">Nada encontrado para “{q}”.</p>}
        </div>
      )}
    </div>
  )
}

function Alertas({ tarefas }) {
  const [aberto, setAberto] = useState(false)
  const navigate = useNavigate()
  const ref = useFecharAoClicarFora(aberto, () => setAberto(false))
  const pendentes = tarefas.filter((t) => t.itens.length)
  const total = pendentes.filter((t) => ['sinal-vencido', 'saldo', 'checkin-amanha'].includes(t.id)).reduce((s, t) => s + t.itens.length, 0)

  const ir = (t) => {
    setAberto(false)
    navigate(t.rota || (t.filtro ? `/admin/reservas?status=${t.filtro}` : '/admin/reservas'))
  }

  return (
    <div className="alertas" ref={ref}>
      <button type="button" className="btn-icone sino" onClick={() => setAberto((a) => !a)} aria-label={`Alertas${total ? ` (${total} urgentes)` : ''}`} aria-expanded={aberto}>
        <Bell size={20} />
        {total > 0 && <span className="sino-badge">{total}</span>}
      </button>
      {aberto && (
        <div className="dropdown alertas-lista">
          <h3>Tarefas e alertas</h3>
          {pendentes.length ? pendentes.map((t) => (
            <button type="button" key={t.id} onClick={() => ir(t)}>
              <span>{t.label}</span>
              <span className={`contador bg-${t.cor}`}>{t.itens.length}</span>
            </button>
          )) : <p className="dropdown-vazio">Tudo em dia! 🎉</p>}
        </div>
      )}
    </div>
  )
}
