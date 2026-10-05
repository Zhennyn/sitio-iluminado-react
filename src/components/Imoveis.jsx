import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, Users, X } from 'lucide-react'
import { WhatsAppIcon } from './BrandIcons'
import CATALOGO from '../data/catalogo.json'
import { LOCAIS, aPartirDe, capacidadeDe, formatBRL } from '../data/locais'
import { PROPRIETARIO, foto, whatsappLink } from '../data/site'
import { useDb } from '../admin/data/store'
import { diasOcupados } from '../admin/data/selectors'
import { addDias, fmtData, fmtDataCurta, hoje } from '../admin/lib/format'

// Fotos hospedadas nos anúncios do Temporada Livre, que oferece as variantes thumb_, mobile_ e desktop_.
const fotoTL = (caminho, variante) => {
  const i = caminho.lastIndexOf('/')
  return `https://s.temporadalivre.com/uploads/picture/mv_files/image/${caminho.slice(0, i)}/${variante}_${caminho.slice(i + 1)}`
}

const CAPA_PROPRIA = { 'sitio-iluminado': foto('piscina', 500) }

const regiaoDe = (local) => local.regiao || local.cidade
const CIDADES = [...new Set(Object.values(LOCAIS).map(regiaoDe))]
// Agrupados por região, na ordem em que as regiões aparecem.
const IMOVEIS = Object.entries(LOCAIS)
  .map(([id, local]) => ({ id, local, ...CATALOGO[id] }))
  .sort((a, b) => CIDADES.indexOf(regiaoDe(a.local)) - CIDADES.indexOf(regiaoDe(b.local)))

const livreEntre = (ocupados, ini, fim) => {
  for (let d = ini; d <= fim; d = addDias(d, 1)) if (ocupados.has(d)) return false
  return true
}

export default function Imoveis({ onSimular }) {
  const estado = useDb()
  const [cidade, setCidade] = useState('')
  const [ini, setIni] = useState('')
  const [fim, setFim] = useState('')
  const [busca, setBusca] = useState(null)
  const [aberto, setAberto] = useState(null)

  const livres = useMemo(() => {
    if (!busca) return null
    return new Set(IMOVEIS.filter((i) => livreEntre(diasOcupados(estado, i.id), busca.ini, busca.fim)).map((i) => i.id))
  }, [estado, busca])

  const visiveis = IMOVEIS.filter((i) => (!cidade || regiaoDe(i.local) === cidade) && (!livres || livres.has(i.id)))

  const buscar = (e) => {
    e.preventDefault()
    if (ini && fim && fim >= ini) setBusca({ ini, fim })
  }
  const limpar = () => {
    setIni('')
    setFim('')
    setBusca(null)
  }
  const simular = (id) => {
    setAberto(null)
    onSimular(id, busca?.ini, busca?.fim)
  }

  return (
    <div className="imoveis-inner">
      <div className="imoveis-head">
        <div className="eyebrow">Portfólio Hospeda Temporada</div>
        <h2 id="imoveis-title">Nossos <em>imóveis</em></h2>
        <p>Além do Sítio Iluminado, o {PROPRIETARIO} administra chácaras em várias cidades de São Paulo. Veja fotos, compare e simule o valor de cada uma.</p>
      </div>

      <form className="imoveis-busca" onSubmit={buscar}>
        <div className="field">
          <label htmlFor="busca-ini">Check-in</label>
          <input id="busca-ini" type="date" min={hoje()} value={ini} onChange={(e) => setIni(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="busca-fim">Check-out</label>
          <input id="busca-fim" type="date" min={ini || hoje()} value={fim} onChange={(e) => setFim(e.target.value)} required />
        </div>
        <button type="submit" className="imoveis-btn primario">Buscar imóveis livres</button>
        {busca && <button type="button" className="imoveis-btn" onClick={limpar}>Limpar datas</button>}
      </form>
      <p className="imoveis-status" role="status">
        {busca &&
          (livres.size
            ? `${livres.size} ${livres.size > 1 ? 'imóveis livres' : 'imóvel livre'} de ${fmtData(busca.ini)} a ${fmtData(busca.fim)}.`
            : 'Nenhum imóvel livre em todo esse período. Tente outras datas ou fale pelo WhatsApp.')}
      </p>

      <div className="imoveis-filtros" role="group" aria-label="Filtrar por cidade">
        <button type="button" aria-pressed={!cidade} onClick={() => setCidade('')}>Todas</button>
        {CIDADES.map((c) => (
          <button key={c} type="button" aria-pressed={cidade === c} onClick={() => setCidade(c)}>
            {c} <small>{IMOVEIS.filter((i) => regiaoDe(i.local) === c).length}</small>
          </button>
        ))}
      </div>

      <div className="imoveis-grid">
        {visiveis.map((i) => {
          const preco = aPartirDe(i.local)
          const capa = CAPA_PROPRIA[i.id] || (i.fotos?.length ? fotoTL(i.fotos[0], 'thumb') : null)
          return (
            <article key={i.id} className="imovel-card">
              <button type="button" className="imovel-capa" onClick={() => setAberto(i.id)} aria-label={`Ver fotos e detalhes de ${i.local.nome}`}>
                {capa ? <img src={capa} alt="" loading="lazy" decoding="async" /> : <ImageOff size={32} aria-hidden="true" />}
                {i.fotos?.length > 0 && <span className="imovel-qtd">{i.fotos.length} fotos</span>}
                {busca && <span className="imovel-livre">Livre {fmtDataCurta(busca.ini)}–{fmtDataCurta(busca.fim)}</span>}
              </button>
              <div className="imovel-corpo">
                <span className="imovel-cidade">{i.local.cidade}</span>
                <h3>{i.local.nome}</h3>
                <p className="imovel-meta">
                  <Users size={14} aria-hidden="true" /> Até {capacidadeDe(i.local)} pessoas
                  <span aria-hidden="true">·</span>
                  {preco ? <>a partir de <strong>{formatBRL(preco)}</strong></> : 'valores sob consulta'}
                </p>
                <div className="imovel-acoes">
                  <button type="button" className="imoveis-btn" onClick={() => setAberto(i.id)}>Fotos e detalhes</button>
                  <button type="button" className="imoveis-btn primario" onClick={() => simular(i.id)}>Simular valor</button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {aberto && (
        <ImovelDetalhe imovel={IMOVEIS.find((i) => i.id === aberto)} onFechar={() => setAberto(null)} onSimular={simular} />
      )}
    </div>
  )
}

function ImovelDetalhe({ imovel, onFechar, onSimular }) {
  const ref = useRef(null)
  const [atual, setAtual] = useState(0)
  const fotos = imovel.fotos || []
  const n = fotos.length

  // Sem cleanup: ao desmontar, o <dialog> sai do DOM e da camada modal sozinho.
  useEffect(() => {
    if (!ref.current.open) ref.current.showModal()
  }, [])

  const ir = (k) => setAtual((a) => (a + k + n) % n)
  const teclas = (e) => {
    if (!n) return
    if (e.key === 'ArrowRight') ir(1)
    if (e.key === 'ArrowLeft') ir(-1)
  }

  return (
    <dialog ref={ref} className="imovel-dialog" onClose={onFechar} onKeyDown={teclas} aria-labelledby="imovel-dialog-titulo">
      <header className="imovel-dialog-head">
        <div>
          <span className="imovel-cidade">{imovel.local.cidade}</span>
          <h3 id="imovel-dialog-titulo">{imovel.titulo || imovel.local.nome}</h3>
        </div>
        <button type="button" className="imovel-fechar" onClick={onFechar} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      {n > 0 && (
        <div className="galeria">
          <div className="galeria-principal">
            <img
              key={atual}
              src={fotoTL(fotos[atual], 'desktop')}
              srcSet={`${fotoTL(fotos[atual], 'mobile')} 640w, ${fotoTL(fotos[atual], 'desktop')} 1200w`}
              sizes="(max-width: 768px) 100vw, 900px"
              alt={`${imovel.local.nome} — foto ${atual + 1} de ${n}`}
            />
            <button type="button" className="galeria-nav ant" onClick={() => ir(-1)} aria-label="Foto anterior">
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" className="galeria-nav prox" onClick={() => ir(1)} aria-label="Próxima foto">
              <ChevronRight size={22} aria-hidden="true" />
            </button>
            <span className="galeria-contador">{atual + 1} / {n}</span>
          </div>
          <div className="galeria-miniaturas">
            {fotos.map((f, k) => (
              <button key={f} type="button" aria-current={k === atual} aria-label={`Foto ${k + 1}`} onClick={() => setAtual(k)}>
                <img src={fotoTL(f, 'thumb')} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      )}

      {imovel.descricao && <div className="imovel-descricao">{imovel.descricao}</div>}

      <footer className="imovel-dialog-acoes">
        <button type="button" className="imoveis-btn primario" onClick={() => onSimular(imovel.id)}>Simular valor e datas</button>
        <a
          className="imoveis-btn wa"
          href={whatsappLink(`Olá! Tenho interesse no imóvel *${imovel.local.nome}* (${imovel.local.cidade}).`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon size={18} /> WhatsApp
        </a>
        {imovel.anuncio && (
          <a className="imoveis-btn" href={imovel.anuncio} target="_blank" rel="noopener noreferrer">
            Anúncio no Temporada Livre <ExternalLink size={14} aria-hidden="true" />
          </a>
        )}
        <a className="imoveis-link" href="#regras" onClick={onFechar}>Regras e condições</a>
      </footer>
    </dialog>
  )
}
