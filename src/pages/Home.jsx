import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Bath, BedDouble, Beef, Car, Church, Clock, Droplets, Flame, Goal, MapPin, PartyPopper,
  Pizza, Play, Route, ShoppingBag, Sparkles, Tv, Users, Volleyball, Waves, Wifi, CircleDot,
} from 'lucide-react'
import Calculadora from '../components/Calculadora'
import { WhatsAppIcon, InstagramIcon } from '../components/BrandIcons'
import {
  INSTAGRAM_HANDLE, INSTAGRAM_URL, PROPRIETARIO, VIDEO_URL, WHATSAPP_DISPLAY,
  foto, fotoSrcSet, whatsappLink,
} from '../data/site'
import './Home.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ANO_ATUAL = new Date().getFullYear()

// Cartas do hero: posição/tamanho em Home.css (.card-1 … .card-8).
const HERO_CARDS = [
  { img: 'casa', rot: -9, depth: 14 },
  { img: 'salao-lareira', rot: -5, depth: 10 },
  { img: 'area-gourmet', rot: -2, depth: 8 },
  { img: 'cozinha', rot: 3, depth: 12 },
  { img: 'piscina', rot: 0, depth: 6 },
  { img: 'salao-de-jogos', rot: 4, depth: 11 },
  { img: 'quadra-de-volei', rot: 7, depth: 9 },
  { img: 'capela', rot: -4, depth: 13 },
]

// Para onde cada carta se espalha ao rolar a página para fora do hero.
const SCROLL_SPREAD = [
  { x: -260, y: -40, rot: -25 }, { x: -200, y: 20, rot: -18 },
  { x: -120, y: 80, rot: -10 }, { x: -40, y: 120, rot: -4 },
  { x: 40, y: 120, rot: 4 }, { x: 120, y: 80, rot: 12 },
  { x: 200, y: 20, rot: 22 }, { x: 260, y: -40, rot: 28 },
]

const ESPACOS = [
  { img: 'piscina', nome: 'Piscina com cascata', desc: 'Hidromassagem e tratamento com ozônio.' },
  { img: 'area-gourmet', nome: 'Churrasqueira coberta', desc: 'Mesa grande e forno de pizza a lenha.' },
  { img: 'dormitorio', nome: 'Quartos', desc: '4 quartos e 4 banheiros completos.' },
  { img: 'sala-de-estar', nome: 'Sala de estar', desc: 'Sofás e TV para descansar.' },
  { img: 'salao-de-jogos', nome: 'Salão de jogos', desc: 'Sinuca, ping-pong e lareira.' },
  { img: 'quadra-de-volei', nome: 'Quadra de vôlei', desc: 'No meio da área verde.' },
  { img: 'campo-de-futebol', nome: 'Campo de futebol', desc: 'Gramado amplo para a turma.' },
  { img: 'capela', nome: 'Capela', desc: 'Cercada de pinheiros.' },
]

const ESTRUTURA = [
  {
    titulo: 'Acomodações',
    itens: [
      [Users, 'Até 22 pessoas com pernoite'],
      [BedDouble, '4 quartos: 4 camas de casal, 2 de solteiro e 1 beliche'],
      [Bath, '4 banheiros completos'],
      [PartyPopper, 'Levando colchões, já recebeu grupos de até 100 pessoas'],
    ],
  },
  {
    titulo: 'Piscina & lazer',
    itens: [
      [Waves, 'Piscina com cascata e hidromassagem'],
      [Sparkles, 'Água tratada com ozônio'],
      [Goal, 'Campo de futebol'],
      [Volleyball, 'Quadra de vôlei'],
      [Church, 'Capela e ampla área verde'],
    ],
  },
  {
    titulo: 'Gourmet & diversão',
    itens: [
      [Beef, 'Churrasqueira coberta'],
      [Pizza, 'Forno de pizza a lenha'],
      [PartyPopper, 'Salão de festas'],
      [CircleDot, 'Sinuca e ping-pong'],
      [Flame, 'Lareira'],
    ],
  },
  {
    titulo: 'Infraestrutura',
    itens: [
      [Wifi, 'Wi-Fi de alta velocidade'],
      [Tv, 'TV a cabo'],
      [Droplets, 'Água filtrada em toda a propriedade'],
      [Car, 'Estacionamento para até 100 veículos'],
      [Route, 'Asfalto até a porta'],
    ],
  },
]

const IDEAL_PARA = [
  'Finais de semana e feriados', 'Férias e temporada', 'Famílias grandes e grupos',
  'Aniversários e formaturas', 'Confraternizações e retiros', 'Eventos corporativos',
]

export default function Home() {
  const containerRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 768px)',
        pointer: '(hover: hover) and (pointer: fine)',
      },
      (ctx) => {
        const { motion, mobile, pointer } = ctx.conditions
        if (!motion) return

        const hero = containerRef.current.querySelector('.hero')
        const slots = gsap.utils.toArray('.card-slot')
        const cards = slots.map((s) => s.querySelector('.card'))
        const restRot = (el) => parseFloat(el.dataset.rot) || 0
        const cleanups = []
        let introDone = false

        gsap.set(cards, { rotation: (i, el) => restRot(el) })

        // ---- Entrada ----
        gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            introDone = true
            // Flutuação contínua, só depois que a entrada termina (evita disputa pelo mesmo "y").
            cards.forEach((card, i) => {
              gsap.to(card, {
                y: `+=${8 + (i % 3) * 5}`,
                rotation: restRot(card) + (i % 2 === 0 ? 1.5 : -1.5),
                duration: 3 + (i % 4) * 0.5,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
              })
            })
          },
        })
          .from('.small-team .word > span', { yPercent: 105, duration: 0.9, stagger: 0.08 }, 0.2)
          .from('.big-results .letter', { y: 80, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'back.out(1.6)' }, 0.45)
          .from(cards, {
            y: -800, opacity: 0, scale: 0.7,
            rotation: (i, el) => restRot(el) + 25,
            duration: 1.1, stagger: { each: 0.08, from: 'center' }, ease: 'back.out(1.4)',
          }, 0.7)
          .from('#subline', { opacity: 0, y: 20, duration: 0.8 }, 1.5)

        // ---- Parallax com o mouse + inclinação 3D (só em telas com mouse) ----
        if (pointer && !mobile) {
          const movers = slots.map((slot) => {
            const par = slot.querySelector('.card-par')
            return {
              depth: parseFloat(slot.dataset.depth) || 8,
              x: gsap.quickTo(par, 'x', { duration: 1.2, ease: 'power3' }),
              y: gsap.quickTo(par, 'y', { duration: 1.2, ease: 'power3' }),
            }
          })
          const onMove = (e) => {
            const r = hero.getBoundingClientRect()
            const mx = ((e.clientX - r.left) / r.width - 0.5) * 2
            const my = ((e.clientY - r.top) / r.height - 0.5) * 2
            movers.forEach((m) => { m.x(mx * m.depth); m.y(my * m.depth * 0.5) })
          }
          const onLeave = () => movers.forEach((m) => { m.x(0); m.y(0) })
          hero.addEventListener('mousemove', onMove)
          hero.addEventListener('mouseleave', onLeave)
          cleanups.push(() => {
            hero.removeEventListener('mousemove', onMove)
            hero.removeEventListener('mouseleave', onLeave)
          })

          slots.forEach((slot, i) => {
            const card = cards[i]
            const onCardMove = (e) => {
              if (!introDone) return
              const r = card.getBoundingClientRect()
              const px = (e.clientX - r.left) / r.width - 0.5
              const py = (e.clientY - r.top) / r.height - 0.5
              slot.style.zIndex = 20
              gsap.to(card, {
                rotateX: -py * 16, rotateY: px * 16, scale: 1.12,
                duration: 0.4, ease: 'power2.out', transformPerspective: 700, overwrite: 'auto',
              })
            }
            const onCardLeave = () => {
              slot.style.zIndex = ''
              gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
            }
            card.addEventListener('mousemove', onCardMove)
            card.addEventListener('mouseleave', onCardLeave)
            cleanups.push(() => {
              card.removeEventListener('mousemove', onCardMove)
              card.removeEventListener('mouseleave', onCardLeave)
              slot.style.zIndex = ''
            })
          })
        }

        // ---- Saída do hero ao rolar ----
        const spread = mobile ? 0.6 : 1
        const exit = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
        })
        exit
          .to('.big-results', { scale: 1.15, opacity: 0.6, duration: 1 }, 0)
          .to('.small-team', { y: -60, opacity: 0, duration: 0.65 }, 0)
          .fromTo('#subline', { opacity: 1 }, { opacity: 0, duration: 0.5, immediateRender: false }, 0)
        slots.forEach((slot, i) => {
          const m = SCROLL_SPREAD[i]
          exit.to(slot, { x: m.x * spread, y: m.y, rotation: m.rot, duration: 1 }, 0)
        })

        // ---- Revelações das seções ----
        const reveal = (targets, trigger, vars = {}) =>
          gsap.from(targets, {
            opacity: 0, y: 40, duration: 0.9, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger, start: 'top 82%' },
            ...vars,
          })

        reveal('.team-head > *', '.team-head')
        reveal('.t-card', '.team-grid', {
          y: 80, scale: 0.92, rotation: (i) => (i % 2 === 0 ? -3 : 3), duration: 1, stagger: 0.07, ease: 'back.out(1.3)',
        })
        reveal('.amenity-col', '.amenities')
        reveal('.ideal-list li', '.ideal', { y: 16, stagger: 0.05 })
        reveal('.stats-inner', '.stats', { y: 60, scale: 0.97, duration: 1.2 })
        reveal('.contact-card', '.contact', { y: 60, duration: 1.1 })

        // Contadores dos destaques
        gsap.utils.toArray('.stat-block .num [data-count]').forEach((el) => {
          gsap.from(el, {
            textContent: 0, duration: 2, ease: 'power2.out', snap: { textContent: 1 },
            scrollTrigger: { trigger: '.stats', start: 'top 75%' },
          })
        })

        return () => cleanups.forEach((fn) => fn())
      },
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef}>
      <div className="grain" aria-hidden="true"></div>

      <header className={`nav${scrolled ? ' is-scrolled' : ''}`} id="nav">
        <a href="#topo" className="logo" aria-label="Sítio Iluminado — início">
          <span className="logo-dot" aria-hidden="true"></span>
          SÍTIO ILUMINADO
        </a>
        <nav aria-label="Seções">
          <ul className="nav-links">
            <li><a href="#estrutura">Estrutura</a></li>
            <li><a href="#destaques">Destaques</a></li>
            <li><a href="#orcamento">Orçamento</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </nav>
        <a href="#orcamento" className="nav-cta">Reservar</a>
      </header>

      <main id="topo">
        {/* ============ HERO ============ */}
        <section className="hero" aria-labelledby="hero-title">
          <h1 className="small-team" id="hero-title">
            <span className="sr-only">Sítio Iluminado — </span>
            <span className="word"><span>Natureza,</span></span>{' '}
            <span className="word"><span>conforto,</span></span><br />
            <span className="word"><span className="gold-text">inesquecível.</span></span>
          </h1>

          <div className="big-results-wrap" aria-hidden="true">
            <div className="big-results">
              {'SÍTIO'.split('').map((l, i) => <span className="letter" key={i}>{l}</span>)}
            </div>
          </div>

          <div className="cards-row" aria-hidden="true">
            {HERO_CARDS.map((c, i) => (
              <div className={`card-slot card-${i + 1}`} data-depth={c.depth} key={c.img}>
                <div className="card-par">
                  <div className="card" data-rot={c.rot} style={{ transform: `rotate(${c.rot}deg)` }}>
                    <img src={foto(c.img, 500)} alt="" width="500" height="375" decoding="async" fetchPriority={i === 4 ? 'high' : undefined} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="subline" id="subline">
            <a href="#orcamento" className="arrow-pill">
              Simular orçamento
              <span className="ar" aria-hidden="true">↘</span>
            </a>
            <p className="subline-text">Biritiba Mirim · Mogi das Cruzes · 1h de São Paulo</p>
          </div>
        </section>

        {/* ============ ESTRUTURA ============ */}
        <section className="team-section" id="estrutura" aria-labelledby="estrutura-title">
          <div className="team-head">
            <div>
              <div className="eyebrow">A 1 km do centro</div>
              <h2 id="estrutura-title">Lazer e conforto<br />para <em>toda a família</em>.</h2>
            </div>
            <div className="team-head-side">
              <p>Piscina com cascata, churrasqueira, salão de jogos, quadras e muito verde — tudo a 20 minutos do Mogi Shopping e com asfalto até a porta.</p>
              <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer" className="video-link">
                <span className="video-play" aria-hidden="true"><Play size={14} fill="currentColor" /></span>
                Ver o sítio em vídeo
              </a>
            </div>
          </div>

          <ul className="team-grid">
            {ESPACOS.map((e) => (
              <li className="t-card" key={e.img}>
                <img
                  src={foto(e.img, 500)}
                  srcSet={fotoSrcSet(e.img)}
                  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  alt={e.nome}
                  loading="lazy"
                  decoding="async"
                />
                <div className="t-meta">
                  <div className="nm">{e.nome}</div>
                  <div className="rl">{e.desc}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="amenities">
            {ESTRUTURA.map((col) => (
              <div className="amenity-col" key={col.titulo}>
                <h3>{col.titulo}</h3>
                <ul>
                  {col.itens.map(([Icon, txt]) => (
                    <li key={txt}><Icon size={18} aria-hidden="true" /> {txt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="ideal">
            <h3>Ideal para</h3>
            <ul className="ideal-list">
              {IDEAL_PARA.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </section>

        {/* ============ DESTAQUES ============ */}
        <section className="stats" id="destaques" aria-labelledby="destaques-title">
          <div className="stats-inner">
            <h2 id="destaques-title">Espaço <em>ideal</em><br />para o seu encontro.</h2>
            <div className="stat-block">
              <div className="num"><span data-count="22">22</span></div>
              <div className="lbl">Pessoas com pernoite</div>
            </div>
            <div className="stat-block">
              <div className="num"><span data-count="4">4</span></div>
              <div className="lbl">Quartos e banheiros</div>
            </div>
            <div className="stat-block">
              <div className="num"><span data-count="100">100</span></div>
              <div className="lbl">Vagas de estacionamento</div>
            </div>
            <div className="stat-block">
              <div className="num"><span>1</span><small>h</small></div>
              <div className="lbl">De São Paulo</div>
            </div>
          </div>
        </section>

        {/* ============ ORÇAMENTO ============ */}
        <section className="calc-section" id="orcamento">
          <Calculadora />
        </section>

        {/* ============ CONTATO ============ */}
        <section className="contact" id="contato" aria-labelledby="contato-title">
          <div className="contact-card">
            <div className="contact-text">
              <div className="eyebrow">Atendimento direto</div>
              <h2 id="contato-title">Fale com o {PROPRIETARIO}.</h2>
              <p>O sítio é administrado pelo próprio proprietário — sem intermediários, com atendimento personalizado e resposta rápida pelo WhatsApp.</p>
              <ul className="contact-facts">
                <li><MapPin size={16} aria-hidden="true" /> Biritiba Mirim / Mogi das Cruzes — SP</li>
                <li><Clock size={16} aria-hidden="true" /> Cerca de 1h de São Paulo, pela Rodovia Ayrton Senna</li>
                <li><ShoppingBag size={16} aria-hidden="true" /> 1 km do centro: mercados, padarias e farmácias</li>
              </ul>
            </div>
            <div className="contact-actions">
              <a
                className="contact-wa"
                href={whatsappLink(`Olá ${PROPRIETARIO}! Gostaria de informações sobre o Sítio Iluminado.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={26} />
                <span>
                  <strong>Chamar no WhatsApp</strong>
                  <small>{WHATSAPP_DISPLAY}</small>
                </span>
              </a>
              <a className="contact-ig" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <InstagramIcon size={22} />
                <span>
                  <strong>Instagram</strong>
                  <small>{INSTAGRAM_HANDLE}</small>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ============ RODAPÉ ============ */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-dot" aria-hidden="true"></span>
            SÍTIO ILUMINADO
          </div>
          <p className="footer-loc">Biritiba Mirim / Mogi das Cruzes — SP</p>
          <p className="footer-notice">Consulte a disponibilidade antes de confirmar sua reserva.</p>
          <p className="footer-copy">© {ANO_ATUAL} Sítio Iluminado</p>
        </div>
      </footer>
    </div>
  )
}
