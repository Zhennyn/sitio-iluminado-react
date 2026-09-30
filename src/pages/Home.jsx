import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef();
  
  const whatsappNumber = "5511941942210";
  const [tipo, setTipo] = useState('hospedagem');
  const [periodo, setPeriodo] = useState('sab_dom');
  const [numPessoas, setNumPessoas] = useState(15);
  const [convidados, setConvidados] = useState(0);

  const handleCalculate = () => {
    let valBase = 0; let pessoasStr = ""; let erroSobConsulta = false; const taxaLimpeza = 300;
    if (tipo === 'hospedagem') {
      if(numPessoas <= 15) { valBase = periodo === 'sab_dom' ? 1700 : 2000; pessoasStr = "Até 15 Pessoas"; }
      else if(numPessoas <= 20) { valBase = periodo === 'sab_dom' ? 2200 : 2500; pessoasStr = "Até 20 Pessoas"; }
      else if(numPessoas <= 25) { valBase = periodo === 'sab_dom' ? 2300 : 2500; pessoasStr = "Até 25 Pessoas"; }
      else { valBase = periodo === 'sab_dom' ? 2700 : 2900; pessoasStr = "Até 30 Pessoas"; }
    } else if (tipo === 'feriado_2') {
      if(numPessoas <= 15) { valBase = periodo === 'sab_dom' ? 1900 : 2100; pessoasStr = "Até 15 Pessoas"; }
      else if(numPessoas <= 20) { valBase = periodo === 'sab_dom' ? 2200 : 2400; pessoasStr = "Até 20 Pessoas"; }
      else if(numPessoas <= 25) { valBase = periodo === 'sab_dom' ? 2500 : 2800; pessoasStr = "Até 25 Pessoas"; }
      else { valBase = periodo === 'sab_dom' ? 2900 : 3200; pessoasStr = "Até 30 Pessoas"; }
    } else if (tipo === 'feriado_3') {
      if(numPessoas <= 15) { valBase = 2500; pessoasStr = "Até 15 Pessoas"; }
      else if(numPessoas <= 20) { valBase = 2800; pessoasStr = "Até 20 Pessoas"; }
      else if(numPessoas <= 25) { valBase = 3200; pessoasStr = "Até 25 Pessoas"; }
      else { valBase = 3400; pessoasStr = "Até 30 Pessoas"; }
    } else if (tipo === 'feriado_4') {
      if(numPessoas <= 10) { valBase = 2800; pessoasStr = "Até 10 Pessoas"; }
      else if(numPessoas <= 15) { valBase = 3500; pessoasStr = "Até 15 Pessoas"; }
      else if(numPessoas <= 20) { valBase = 3800; pessoasStr = "Até 20 Pessoas"; }
      else if(numPessoas <= 25) { valBase = 4200; pessoasStr = "Até 25 Pessoas"; }
      else { valBase = 4600; pessoasStr = "Até 30 Pessoas"; }
    } else if (tipo === 'natal_2026' || tipo === 'carnaval_2027') {
      if(numPessoas <= 20) { valBase = 15000; pessoasStr = "Até 20 Pessoas"; }
      else if(numPessoas <= 25) { valBase = 18000; pessoasStr = "Até 25 Pessoas"; }
      else { valBase = tipo === 'natal_2026' ? 21000 : 20000; pessoasStr = "Até 30 Pessoas"; }
    } else if (tipo === 'ferias_2027') {
      if(numPessoas <= 10) { valBase = 5000; pessoasStr = "Até 10 Pessoas"; }
      else if(numPessoas <= 15) { valBase = 7000; pessoasStr = "Até 15 Pessoas"; }
      else if(numPessoas <= 20) { valBase = 8000; pessoasStr = "Até 20 Pessoas"; }
      else { erroSobConsulta = true; }
    } else if (tipo === 'evento') {
      if(numPessoas <= 50) { valBase = 2000; pessoasStr = "Até 50 Pessoas"; }
      else if(numPessoas <= 100) { valBase = 2500; pessoasStr = "51 a 100 Pessoas"; }
      else if(numPessoas <= 150) { valBase = 3000; pessoasStr = "101 a 150 Pessoas"; }
      else if(numPessoas <= 200) { valBase = 4000; pessoasStr = "151 a 200 Pessoas"; }
      else { valBase = 5500; pessoasStr = "201 a 250 Pessoas"; }
    }
    const valConvidados = tipo === 'evento' ? 0 : convidados * 30;
    const total = valBase + valConvidados + taxaLimpeza;
    return { valBase, pessoasStr, erroSobConsulta, valConvidados, total, taxaLimpeza };
  };
  const results = handleCalculate();

  const handleWhatsApp = () => {
    let msg = `Olá! Gostaria de fazer uma reserva no Sítio Iluminado.\n\n*Hóspedes:* ${numPessoas} pessoas`;
    if(tipo === 'hospedagem' || tipo === 'feriado_2') {
      msg += `\n*Período:* ${periodo === 'sab_dom' ? 'Sábado a Domingo' : 'Sexta a Domingo'}`;
    }
    if(tipo !== 'evento' && convidados > 0) msg += `\n*Convidados Extras:* ${convidados} pessoas`;
    msg += `\n\n*Valor Estimado:* R$ ${results.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n\nPodemos confirmar a disponibilidade?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.set("#nav", { opacity: 0, y: -20 });
      gsap.set(".small-team .word > span", { y: "105%" });
      gsap.set(".big-results .letter", { y: 80, opacity: 0 });
      gsap.set("#subline", { opacity: 0, y: 20 });
      gsap.set(".t-card", { opacity: 0 });
      gsap.set(".stats-inner", { opacity: 0 });

      const cards = gsap.utils.toArray('.card');
      cards.forEach((card) => {
        const rot = parseFloat(card.dataset.rot) || 0;
        card.dataset.restRot = rot;
        gsap.set(card, { y: -800, rotation: rot + 25, opacity: 0, scale: 0.7 });
      });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to("#nav", { opacity: 1, y: 0, duration: 0.8 }, 0.1)
        .to(".small-team .word > span", { y: "0%", duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.3)
        .to(".big-results .letter", { y: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "back.out(1.6)" }, 0.55)
        .to(".card", {
          y: 0, opacity: 1, scale: 1,
          rotation: (i, el) => parseFloat(el.dataset.restRot) || 0,
          duration: 1.1, stagger: { each: 0.08, from: "center" }, ease: "back.out(1.4)"
        }, 0.8)
        .to("#subline", { opacity: 1, y: 0, duration: 0.8 }, 1.6);

      cards.forEach((card, i) => {
        const rot = parseFloat(card.dataset.restRot) || 0;
        gsap.to(card, {
          y: `+=${8 + (i % 3) * 5}`,
          rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
          duration: 3 + (i % 4) * 0.5,
          delay: 1.8 + i * 0.1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      const hero = document.querySelector(".hero");
      let mx = 0, my = 0, tx = 0, ty = 0;
      let req;
      
      const isMobile = window.innerWidth <= 768;

      if (!isMobile) {
        const moveHandler = (e) => {
          const r = hero.getBoundingClientRect();
          mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          my = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        const leaveHandler = () => { mx = 0; my = 0; };
        hero.addEventListener("mousemove", moveHandler);
        hero.addEventListener("mouseleave", leaveHandler);

        const parallax = () => {
          tx += (mx - tx) * 0.05;
          ty += (my - ty) * 0.05;
          cards.forEach((card) => {
            const d = parseFloat(card.dataset.depth) || 8;
            card.style.transform = `translate(${tx * d}px, ${ty * d * 0.5}px) rotate(${card.dataset.restRot}deg)`;
          });
          req = requestAnimationFrame(parallax);
        };
        parallax();
      }

      cards.forEach((card) => {
        if(!isMobile) {
          card.addEventListener("mousemove", (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, {
              rotateX: -py * 16, rotateY: px * 16, scale: 1.12, zIndex: 20,
              duration: 0.4, ease: "power2.out", transformPerspective: 700, overwrite: "auto"
            });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              rotateX: 0, rotateY: 0, scale: 1, zIndex: card.style.zIndex || "",
              duration: 0.8, ease: "elastic.out(1, 0.6)", overwrite: "auto"
            });
          });
        }
      });

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(".big-results", { scale: 1 + 0.15 * p, opacity: 1 - 0.4 * p });
          gsap.set(".small-team", { y: -60 * p, opacity: 1 - p * 1.5 });
          
          const factorX = isMobile ? 0.6 : 1; 
          const moves = [
            { x: -260 * factorX, y: -40, rot: -25 }, { x: -200 * factorX, y: 20, rot: -18 },
            { x: -120 * factorX, y: 80, rot: -10 }, { x: -40 * factorX, y: 120, rot: -4 },
            { x: 40 * factorX, y: 120, rot: 4 }, { x: 120 * factorX, y: 80, rot: 12 },
            { x: 200 * factorX, y: 20, rot: 22 }, { x: 260 * factorX, y: -40, rot: 28 }
          ];
          cards.forEach((card, i) => {
            const m = moves[i];
            const rest = parseFloat(card.dataset.restRot) || 0;
            gsap.set(card, { x: m.x * p, y: m.y * p, rotation: rest + m.rot * p });
          });
          gsap.set("#subline", { opacity: 1 - p * 2 });
        }
      });

      gsap.from(".eyebrow, .team-head h2, .team-head p", {
        opacity: 0, y: 30, duration: 0.9, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".team-head", start: "top 80%" }
      });
      gsap.to(".t-card", {
        opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: ".team-grid", start: "top 80%" }
      });
      gsap.from(".t-card", {
        y: 80, scale: 0.9, rotation: (i) => (i % 2 === 0 ? -3 : 3), duration: 1, stagger: 0.08,
        ease: "back.out(1.3)", scrollTrigger: { trigger: ".team-grid", start: "top 80%" }
      });

      gsap.to(".stats-inner", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".stats", start: "top 80%" } });
      gsap.from(".stats-inner", { y: 60, scale: 0.97, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".stats", start: "top 80%" } });
      
      ScrollTrigger.create({
        trigger: ".stats", start: "top 75%", once: true,
        onEnter: () => {
          document.querySelectorAll(".stat-block .num").forEach((el) => {
            const target = parseFloat(el.dataset.count);
            const span = el.querySelector("span");
            gsap.to({ v: 0 }, {
              v: target, duration: 2, ease: "power2.out",
              onUpdate: function () { span.textContent = Math.floor(this.targets()[0].v).toLocaleString(); }
            });
          });
        }
      });

      return () => {
        if (!isMobile) {
          cancelAnimationFrame(req);
        }
      };

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <div className="grain"></div>

      <nav className="nav" id="nav">
        <div className="logo">
          <span className="logo-dot"></span>
          SÍTIO ILUMINADO
        </div>
        <ul className="nav-links">
          <li><a href="#estrutura">Estrutura</a></li>
          <li><a href="#stats">Destaques</a></li>
          <li><a href="#orcamento">Orçamento</a></li>
        </ul>
        <Link to="/admin" className="nav-cta">
          Painel Admin
        </Link>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero">
        <h1 className="small-team" id="smallTeam">
          <span className="word"><span>Natureza,</span></span>&nbsp;
          <span className="word"><span>conforto,</span></span><br/>
          <span className="word"><span className="gold-text">inesquecível.</span></span>
        </h1>

        <div className="big-results-wrap">
          <div className="big-results" id="bigResults">
            <span className="letter">S</span><span className="letter">Í</span><span className="letter">T</span><span className="letter">I</span><span className="letter">O</span>
          </div>
        </div>

        <div className="cards-row" id="cardsRow">
          <div className="card card-1" data-rot="-9" data-depth="14"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.20.jpeg" alt="" /></div>
          <div className="card card-2" data-rot="-5" data-depth="10"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.21.jpeg" alt="" /></div>
          <div className="card card-3" data-rot="-2" data-depth="8"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.22 (1).jpeg" alt="" /></div>
          <div className="card card-4" data-rot="3" data-depth="12"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.22.jpeg" alt="" /></div>
          <div className="card card-5" data-rot="0" data-depth="6"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.20 (1).jpeg" alt="" /></div>
          <div className="card card-6" data-rot="4" data-depth="11"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.23.jpeg" alt="" /></div>
          <div className="card card-7" data-rot="7" data-depth="9"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.24.jpeg" alt="" /></div>
          <div className="card card-8" data-rot="-4" data-depth="13"><img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.21.jpeg" alt="" /></div>
        </div>

        <div className="subline" id="subline">
          <a href="#orcamento" className="arrow-pill">
            Ver Calculadora
            <span className="ar">↘</span>
          </a>
          <div className="subline-text">Finais de Semana. Feriados. Eventos.</div>
        </div>
      </section>

      {/* ============ ESTRUTURA ============ */}
      <section className="team-section" id="estrutura">
        <div className="team-head">
          <div>
            <div className="eyebrow">A 1km do Centro</div>
            <h2>Lazer e conforto<br />para <em>toda a família</em>.</h2>
          </div>
          <p>Uma infraestrutura completa de diversão com piscinas com ozônio, área verde, quadras e salão de jogos no coração de Biritiba Mirim.</p>
        </div>

        <div className="team-grid" id="teamGrid">
          <div className="t-card">
            <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.20.jpeg" alt="" />
            <div className="t-meta">
              <div className="nm">Piscina e Hidro</div>
              <div className="rl">Cascata com tratamento em ozônio.</div>
            </div>
          </div>
          <div className="t-card">
            <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.22 (1).jpeg" alt="" />
            <div className="t-meta">
              <div className="nm">Acomodações</div>
              <div className="rl">4 Dormitórios para até 22 pessoas.</div>
            </div>
          </div>
          <div className="t-card">
            <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.24.jpeg" alt="" />
            <div className="t-meta">
              <div className="nm">Espaço Gourmet</div>
              <div className="rl">Churrasqueira e Forno de Pizza.</div>
            </div>
          </div>
          <div className="t-card">
            <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.22.jpeg" alt="" />
            <div className="t-meta">
              <div className="nm">Salão de Jogos</div>
              <div className="rl">Sinuca, Ping-pong e Lareira.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats" id="stats">
        <div className="stats-inner">
          <h3>Espaço <em>ideal</em> <br/> para o seu evento.</h3>
          <div className="stat-block">
            <div className="num" data-count="22"><span>0</span></div>
            <div className="lbl">Acomodações</div>
          </div>
          <div className="stat-block">
            <div className="num" data-count="250"><span>0</span></div>
            <div className="lbl">Capacidade (Eventos)</div>
          </div>
          <div className="stat-block">
            <div className="num" data-count="1"><span>0</span><small>km</small></div>
            <div className="lbl">Do Centro</div>
          </div>
        </div>
      </section>

      {/* ============ CALCULADORA MINIMALISTA ============ */}
      <section className="calc-section" id="orcamento">
        <div className="calc-container">
          <h2>Orçamento</h2>
          <p style={{color: 'var(--mute)', textAlign: 'center', letterSpacing: '0.05em', fontWeight: 300}}>Simule sua reserva de forma simples e rápida.</p>
          
          <div className="form-grid">
            <div className="field full">
              <label>Categoria do Pacote</label>
              <select value={tipo} onChange={(e) => {
                  setTipo(e.target.value);
                  if(e.target.value === 'evento') setConvidados(0);
                }}>
                <option value="hospedagem">Final de Semana Comum</option>
                <option value="feriado_2">Feriado de 2 Dias</option>
                <option value="feriado_3">Feriado de 3 Dias</option>
                <option value="feriado_4">Feriados de 4 Dias</option>
                <option value="natal_2026">Natal 2026 (23/12 a 27/12)</option>
                <option value="ferias_2027">Férias Janeiro de 2027</option>
                <option value="carnaval_2027">Carnaval 2027</option>
                <option value="evento">Diária para Eventos (Sem Pernoite)</option>
              </select>
            </div>
            
            {(tipo === 'hospedagem' || tipo === 'feriado_2') && (
              <div className="field">
                <label>Check-in / Check-out</label>
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  <option value="sab_dom">Sábado (08h) a Domingo (18h)</option>
                  <option value="sex_dom">Sexta (18h) a Domingo (18h)</option>
                </select>
              </div>
            )}

            <div className="field">
              <label>Quantidade de Hóspedes</label>
              <input type="number" min="1" max="250" value={numPessoas} onChange={(e) => setNumPessoas(parseInt(e.target.value) || 0)} />
            </div>
            
            {tipo !== 'evento' && (
              <div className="field full">
                <label>Convidados Extras (Sem Pernoite)</label>
                <input type="number" min="0" value={convidados} onChange={(e) => setConvidados(parseInt(e.target.value) || 0)} />
              </div>
            )}
          </div>

          <div className="result-box">
            {results.erroSobConsulta ? (
               <div style={{color: 'var(--gold-4)', textAlign: 'center', fontWeight: '400', fontStyle: 'italic', fontSize: '1.2rem'}}>Para grupos maiores que 20 pessoas, valores sob consulta.</div>
            ) : (
              <>
                <div className="result-row">
                  <span>Pacote Base ({results.pessoasStr})</span>
                  <span>R$ {results.valBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                {results.valConvidados > 0 && (
                  <div className="result-row">
                    <span>Convidados Extras ({convidados}x)</span>
                    <span>R$ {results.valConvidados.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                <div className="result-row">
                  <span>Taxa de Limpeza Fixa</span>
                  <span>R$ 300,00</span>
                </div>
                <div className="result-row total">
                  <span>Valor Estimado</span>
                  <span>R$ {results.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <button className="button-primary" onClick={handleWhatsApp}>
                  Solicitar Datas <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span className="logo-dot"></span>
            SÍTIO ILUMINADO
          </div>
          <p className="footer-loc">Biritiba Mirim / Mogi das Cruzes — SP</p>
          <p className="footer-notice">Consulte disponibilidade antes de confirmar sua reserva.</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-wa"
          >
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.822 6.5L4 29l7.75-1.797A11.93 11.93 0 0 0 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3Z" fill="white"/>
              <path d="M22.003 19.25c-.302-.15-1.786-.882-2.063-.982-.276-.1-.477-.15-.678.15-.2.3-.776.982-.952 1.183-.175.2-.351.225-.652.075-.302-.15-1.274-.47-2.426-1.495-.896-.8-1.501-1.787-1.677-2.087-.175-.3-.019-.462.132-.611.135-.135.302-.351.452-.527.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.527-.075-.15-.678-1.633-.928-2.235-.244-.587-.493-.507-.678-.517l-.577-.01c-.2 0-.527.075-.803.375s-1.054 1.03-1.054 2.512 1.08 2.912 1.23 3.113c.15.2 2.126 3.247 5.152 4.553.72.31 1.282.496 1.72.635.722.23 1.38.197 1.9.12.58-.086 1.786-.73 2.038-1.435.252-.705.252-1.308.177-1.435-.075-.126-.276-.2-.577-.35Z" fill="#25d366"/>
            </svg>
            Falar pelo WhatsApp
          </a>
          <p className="footer-copy">© 2026 Sítio Iluminado</p>
        </div>
      </footer>

    </div>
  );
}
