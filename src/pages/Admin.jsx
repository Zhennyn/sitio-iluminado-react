import React, { useState } from 'react';
import './Admin.css';
import { Menu, Search, MessageSquare, Bell, Calendar, Home, Users, DollarSign, FileText, Settings, Plus, X } from 'lucide-react';

const defaultForm = {
  imovel: 'Sítio Iluminado',
  cliente: '',
  checkin: '',
  checkout: '',
  valor: '',
  hospedes: '',
};

function gerarContrato(dados) {
  const { imovel, cliente, checkin, checkout, valor, hospedes } = dados;

  const fmt = (d) => {
    if (!d) return '___/___/______';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  };

  const valorNum = parseFloat(valor) || 0;
  const sinal = (valorNum * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  const totalFmt = valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Contrato — ${imovel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Georgia', serif; font-size: 14px; line-height: 1.7; color: #111; background: #fff; padding: 60px; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 18px; text-align: center; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .subtitle { text-align: center; font-size: 13px; color: #555; margin-bottom: 40px; }
    .divider { border: none; border-top: 1px solid #ccc; margin: 28px 0; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; color: #333; }
    p { margin-bottom: 14px; text-align: justify; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 6px 12px; border: 1px solid #ddd; font-size: 13px; }
    .info-table td:first-child { font-weight: bold; width: 38%; background: #f7f7f7; }
    .sig-area { display: flex; gap: 60px; margin-top: 60px; }
    .sig-box { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #333; margin-bottom: 8px; padding-top: 8px; font-size: 12px; color: #555; }
    .btn-print { display: block; margin: 40px auto 0; padding: 12px 40px; background: #111; color: #fff; border: none; font-size: 14px; cursor: pointer; font-family: inherit; letter-spacing: 0.05em; }
    .btn-print:hover { background: #333; }
    @media print {
      .btn-print { display: none; }
      body { padding: 30px; }
    }
  </style>
</head>
<body>
  <h1>Contrato de Locação para Temporada</h1>
  <div class="subtitle">${imovel} — Biritiba Mirim / Mogi das Cruzes - SP</div>
  <hr class="divider" />

  <h2>Partes</h2>
  <table class="info-table">
    <tr><td>Locador</td><td>Sítio Iluminado — CNPJ/CPF a identificar</td></tr>
    <tr><td>Locatário</td><td>${cliente || '___________________________'}</td></tr>
    <tr><td>Imóvel</td><td>${imovel} — Biritiba Mirim / Mogi das Cruzes - SP</td></tr>
  </table>

  <hr class="divider" />
  <h2>Período e Hóspedes</h2>
  <table class="info-table">
    <tr><td>Check-in</td><td>${fmt(checkin)}</td></tr>
    <tr><td>Check-out</td><td>${fmt(checkout)}</td></tr>
    <tr><td>Nº de Hóspedes</td><td>${hospedes || '___'} pessoas</td></tr>
  </table>

  <hr class="divider" />
  <h2>Valores</h2>
  <table class="info-table">
    <tr><td>Valor Total</td><td>R$ ${totalFmt}</td></tr>
    <tr><td>Sinal (50% — antecipado)</td><td>R$ ${sinal}</td></tr>
    <tr><td>Taxa de Limpeza</td><td>R$ 300,00 (já inclusa no valor total)</td></tr>
  </table>

  <hr class="divider" />
  <h2>Cláusulas e Condições</h2>

  <p><strong>Cláusula 1ª — Objeto.</strong> O Locador cede ao Locatário, a título oneroso e por temporada, o imóvel denominado <em>${imovel}</em>, situado em Biritiba Mirim/SP, pelo período compreendido entre ${fmt(checkin)} (check-in às 10h) e ${fmt(checkout)} (check-out até 18h), para uso exclusivamente residencial/recreativo.</p>

  <p><strong>Cláusula 2ª — Valor e Pagamento.</strong> O valor total acordado é de <strong>R$ ${totalFmt}</strong>, sendo 50% (R$ ${sinal}) pagos como sinal no ato da assinatura deste instrumento, e o saldo remanescente pago até 7 dias antes da data do check-in. O não pagamento no prazo acordado implicará cancelamento automático da reserva, sem devolução do sinal.</p>

  <p><strong>Cláusula 3ª — Capacidade máxima.</strong> O imóvel comporta, no máximo, ${hospedes || '___'} pessoas, incluídos hóspedes com pernoite e visitantes diurnos. O excesso de ocupantes sem anuência prévia do Locador autoriza a rescisão imediata do contrato, sem devolução de valores.</p>

  <p><strong>Cláusula 4ª — Silêncio noturno.</strong> Fica expressamente proibido barulho, som automotivo ou amplificado em volumes que perturbem a vizinhança após as 00h00 (meia-noite). O descumprimento sujeitará o Locatário às penalidades legais cabíveis.</p>

  <p><strong>Cláusula 5ª — Conservação e responsabilidade.</strong> O Locatário se compromete a zelar pelo imóvel e seus bens móveis, responsabilizando-se por danos causados durante o período de locação. Qualquer avaria deverá ser comunicada imediatamente ao Locador e será cobrada separadamente.</p>

  <p><strong>Cláusula 6ª — Taxa de limpeza.</strong> A taxa de limpeza de R$ 300,00 já está inclusa no valor total e cobre a limpeza pós-estadia. Deixar o imóvel em condições visivelmente precárias ou com lixo excessivo poderá ensejar cobrança adicional.</p>

  <p><strong>Cláusula 7ª — Foro.</strong> As partes elegem o Foro da Comarca de Mogi das Cruzes/SP para dirimir quaisquer litígios oriundos do presente instrumento, com renúncia a qualquer outro, por mais privilegiado que seja.</p>

  <hr class="divider" />

  <p style="text-align:center;font-size:13px;color:#555;">Biritiba Mirim, ______ de __________________ de 2026.</p>

  <div class="sig-area">
    <div class="sig-box">
      <div style="height:60px;"></div>
      <div class="sig-line">Locador — Sítio Iluminado</div>
    </div>
    <div class="sig-box">
      <div style="height:60px;"></div>
      <div class="sig-line">Locatário — ${cliente || '___________________________'}</div>
    </div>
  </div>

  <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export default function Admin() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleGerar = () => {
    gerarContrato(form);
    setModalOpen(false);
  };

  return (
    <div className="admin-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-area">
          🏠 Hospeda <span>Temporada</span>
        </div>
        <nav className="nav-menu">
          <a className="nav-item active"><div className="nav-item-left"><Home size={18}/> Painel</div></a>
          <a className="nav-item"><div className="nav-item-left"><Calendar size={18}/> Calendário</div></a>
          <a className="nav-item"><div className="nav-item-left"><FileText size={18}/> Reservas</div></a>
          <a className="nav-item"><div className="nav-item-left"><Home size={18}/> Imóveis</div></a>
          <a className="nav-item"><div className="nav-item-left"><Users size={18}/> Clientes</div></a>
          <a className="nav-item"><div className="nav-item-left"><DollarSign size={18}/> Financeiro</div></a>
          <a className="nav-item"><div className="nav-item-left"><FileText size={18}/> Contratos</div></a>
          <a className="nav-item"><div className="nav-item-left"><MessageSquare size={18}/> Mensagens</div> <span className="badge">12</span></a>
          <a className="nav-item"><div className="nav-item-left"><Settings size={18}/> Configurações</div></a>
        </nav>

        <div className="shortcuts">
          <h4>Atalhos Rápidos</h4>
          <button className="btn-shortcut action-green"><Plus size={16}/> Nova Reserva</button>
          <button className="btn-shortcut action-yellow" onClick={() => setModalOpen(true)}>
            <FileText size={16}/> Gerar Contrato
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Menu size={20}/> Painel
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Buscar reservas, clientes ou imóveis..." />
            <Search size={18} color="#9ca3af" />
          </div>
          <div className="topbar-right">
            <MessageSquare size={20} color="#10b981" />
            <Bell size={20} color="#ef4444" />
            <div className="user-profile">
              <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.20.jpeg" alt="Admin" />
              <div>
                <div style={{fontSize: '0.8rem'}}>Hospeda Temporada</div>
                <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Administrador</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-scroll">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon" style={{background: 'var(--blue)'}}><Calendar size={20}/></div>
              <div className="kpi-info"><p>Check-ins hoje</p><h3>4</h3></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{background: 'var(--green)'}}><Calendar size={20}/></div>
              <div className="kpi-info"><p>Check-outs hoje</p><h3>3</h3></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{background: 'var(--yellow)'}}><DollarSign size={20}/></div>
              <div className="kpi-info"><p>A receber</p><h3>R$ 12.400,00</h3></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{background: 'var(--blue)'}}><Users size={20}/></div>
              <div className="kpi-info"><p>Hóspedes (mês)</p><h3>127</h3></div>
            </div>
          </div>

          <div className="main-grid">
            <div className="panel-card">
              <div className="panel-header">
                <h2>Calendário de Disponibilidade</h2>
              </div>
              <div className="calendar-container">
                <table className="calendar-table">
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left', width: '200px'}}>Imóvel</th>
                      <th>14 TER</th><th>15 QUA</th><th>16 QUI</th><th>17 SEX</th><th>18 SÁB</th><th>19 DOM</th><th>20 SEG</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="prop-info">
                          <img src="/Fotos/WhatsApp Image 2026-09-30 at 11.41.21.jpeg" alt="Sítio" />
                          <div><strong>Sítio Iluminado</strong><span>Mogi das Cruzes</span></div>
                        </div>
                      </td>
                      <td colSpan="7" style={{padding: '10px 0'}}>
                        <div className="timeline-cell">
                          <div className="timeline-bg">
                            <div className="day-slot"></div><div className="day-slot"></div><div className="day-slot"></div><div className="day-slot"></div><div className="day-slot"></div><div className="day-slot"></div><div className="day-slot"></div>
                          </div>
                          <div className="reservation res-red" style={{left: '14%', width: '30%'}}>João e Família</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Contrato */}
      {modalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📄 Gerar Modelo de Contrato</h2>
              <button className="btn-close" onClick={() => setModalOpen(false)}><X size={24}/></button>
            </div>

            <div className="form-group">
              <label>Imóvel</label>
              <select name="imovel" value={form.imovel} onChange={handleChange}>
                <option value="Sítio Iluminado">Sítio Iluminado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nome do Cliente / Locatário</label>
              <input
                type="text"
                name="cliente"
                placeholder="Ex: João da Silva"
                value={form.cliente}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div>
                <label>Data de Check-in</label>
                <input type="date" name="checkin" value={form.checkin} onChange={handleChange} />
              </div>
              <div>
                <label>Data de Check-out</label>
                <input type="date" name="checkout" value={form.checkout} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <div>
                <label>Valor Total (R$)</label>
                <input
                  type="number"
                  name="valor"
                  placeholder="Ex: 2300"
                  value={form.valor}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Nº de Hóspedes</label>
                <input
                  type="number"
                  name="hospedes"
                  placeholder="Ex: 15"
                  value={form.hospedes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn-generate" onClick={handleGerar}>
              📄 Gerar e Abrir Contrato
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
