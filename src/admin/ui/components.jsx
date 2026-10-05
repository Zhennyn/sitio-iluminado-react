import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CONTRATO, STATUS, statusDe } from '../data/selectors'
import { fmtMes, iniciais, mesAtual, addMes } from '../lib/format'

export function Modal({ titulo, subtitulo, onClose, children, rodape, largura = 'md' }) {
  const ref = useRef(null)
  const tituloId = useId()
  const fecharRef = useRef(onClose)
  useEffect(() => { fecharRef.current = onClose })

  // Só na montagem: foco inicial, Esc e trava da rolagem do fundo.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') fecharRef.current() }
    window.addEventListener('keydown', onKey)
    const anterior = document.activeElement
    const alvo = ref.current?.querySelector('[data-autofocus], input:not([type=hidden]), select, textarea')
    ;(alvo || ref.current)?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      anterior?.focus?.({ preventScroll: true })
    }
  }, [])

  return (
    <div className="modal-fundo" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal modal-${largura}`} role="dialog" aria-modal="true" aria-labelledby={tituloId} ref={ref} tabIndex={-1}>
        <header className="modal-cab">
          <div>
            <h2 id={tituloId}>{titulo}</h2>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button type="button" className="btn-icone" onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>
        <div className="modal-corpo">{children}</div>
        {rodape && <footer className="modal-rodape">{rodape}</footer>}
      </div>
    </div>
  )
}

export function Campo({ label, dica, erro, children, largo }) {
  return (
    <label className={`campo${largo ? ' campo-largo' : ''}${erro ? ' campo-erro' : ''}`}>
      <span className="campo-label">{label}</span>
      {children}
      {erro ? <span className="campo-msg">{erro}</span> : dica ? <span className="campo-dica">{dica}</span> : null}
    </label>
  )
}

export const Badge = ({ cor = 'gray', children }) => <span className={`badge badge-${cor}`}>{children}</span>

export function StatusBadge({ reserva }) {
  const s = STATUS[statusDe(reserva)]
  return <Badge cor={s.cor}>{s.label}</Badge>
}

export function ContratoBadge({ status }) {
  const c = CONTRATO[status] || CONTRATO.pendente
  return <Badge cor={c.cor}>{c.label}</Badge>
}

export function Kpi({ icone: Icone, cor, label, valor, to, link = 'Ver detalhes', onClick }) {
  const conteudo = (
    <>
      <span className={`kpi-icone bg-${cor}`}><Icone size={22} aria-hidden="true" /></span>
      <span className="kpi-info">
        <span className="kpi-label">{label}</span>
        <strong className="kpi-valor">{valor}</strong>
        {(to || onClick) && <span className="kpi-link">{link}</span>}
      </span>
    </>
  )
  if (to) return <Link className="kpi" to={to}>{conteudo}</Link>
  if (onClick) return <button type="button" className="kpi" onClick={onClick}>{conteudo}</button>
  return <div className="kpi">{conteudo}</div>
}

export function Sparkline({ valores, cor = 'var(--a-azul)', altura = 48 }) {
  const w = 160
  const max = Math.max(...valores, 1)
  const min = Math.min(...valores, 0)
  const pts = valores.map((v, i) => {
    const x = valores.length > 1 ? (i / (valores.length - 1)) * w : w / 2
    const y = altura - 4 - ((v - min) / (max - min || 1)) * (altura - 8)
    return [x, y]
  })
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${altura}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L${w},${altura} L0,${altura} Z`} fill={cor} opacity="0.08" />
      <path d={d} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Variacao({ atual, anterior, sufixo = 'em relação ao mês anterior' }) {
  if (!anterior) return <span className="variacao">Sem dados do mês anterior</span>
  const v = ((atual - anterior) / anterior) * 100
  return (
    <span className={`variacao ${v >= 0 ? 'pos' : 'neg'}`}>
      {v >= 0 ? '▲' : '▼'} {Math.abs(Math.round(v))}% <span>{sufixo}</span>
    </span>
  )
}

export function Vazio({ icone: Icone, titulo, children }) {
  return (
    <div className="vazio">
      {Icone && <Icone size={32} aria-hidden="true" />}
      <strong>{titulo}</strong>
      {children && <div className="vazio-txt">{children}</div>}
    </div>
  )
}

export function MesPicker({ valor, onChange }) {
  return (
    <div className="mes-picker">
      <button type="button" className="btn-icone" onClick={() => onChange(addMes(valor, -1))} aria-label="Mês anterior"><ChevronLeft size={18} /></button>
      <span>{fmtMes(valor)}</span>
      <button type="button" className="btn-icone" onClick={() => onChange(addMes(valor, 1))} aria-label="Próximo mês"><ChevronRight size={18} /></button>
      {valor !== mesAtual() && <button type="button" className="btn btn-sm" onClick={() => onChange(mesAtual())}>Atual</button>}
    </div>
  )
}

export function ImovelThumb({ imovel, tamanho = 40 }) {
  if (!imovel) return null
  return imovel.foto ? (
    <img className="thumb" src={imovel.foto} alt="" width={tamanho} height={tamanho} style={{ width: tamanho, height: tamanho }} />
  ) : (
    <span className="thumb thumb-ini" style={{ width: tamanho, height: tamanho, background: imovel.cor || '#64748b' }} aria-hidden="true">
      {iniciais(imovel.nome.replace(/^S[íi]tio\s+/i, ''))}
    </span>
  )
}

export const Avatar = ({ nome }) => <span className="avatar" aria-hidden="true">{iniciais(nome)}</span>

export function Progresso({ pct, cor = 'green' }) {
  return (
    <span className="progresso" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span className={`bg-${cor}`} style={{ width: `${pct}%` }} />
    </span>
  )
}

export function Painel({ titulo, acoes, children, className = '' }) {
  return (
    <section className={`painel ${className}`}>
      {(titulo || acoes) && (
        <header className="painel-cab">
          {titulo && <h2>{titulo}</h2>}
          {acoes && <div className="painel-acoes">{acoes}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export function Cabecalho({ titulo, descricao, children }) {
  return (
    <div className="pagina-cab">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p>{descricao}</p>}
      </div>
      {children && <div className="pagina-acoes">{children}</div>}
    </div>
  )
}
