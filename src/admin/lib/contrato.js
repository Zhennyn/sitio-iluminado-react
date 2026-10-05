import { financeiroDe } from '../data/selectors'
import { brl, fmtData, fmtHora, MESES } from './format'
import { CANCELAMENTO, REGRAS_CASA } from '../../data/regras'

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const linha = '___________________________'

// Monta o contrato de locação por temporada e abre numa nova aba pronto para imprimir/salvar em PDF.
// Retorna false se o navegador bloqueou a nova aba.
export function abrirContrato({ reserva, cliente, imovel, config }) {
  const f = financeiroDe(reserva, config)
  const hoje = new Date()
  const locador = [config.responsavel, config.empresa].filter(Boolean).map(esc).join(' — ')
  const docLocador = config.documento ? ` — CPF/CNPJ ${esc(config.documento)}` : ''
  const locatario = esc(cliente?.nome) || linha
  const docLocatario = cliente?.documento ? ` — CPF/CNPJ ${esc(cliente.documento)}` : ''
  const nomeImovel = esc(imovel?.nome)
  const cidadeImovel = esc(imovel?.cidade)
  const cidadeAssinatura = esc((config.cidadeForo || '').split('/')[0] || imovel?.cidade || '')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Contrato ${esc(reserva.codigo)} — ${nomeImovel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #111; background: #fff; padding: 60px; max-width: 860px; margin: 0 auto; }
    h1 { font-size: 18px; text-align: center; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .subtitle { text-align: center; font-size: 13px; color: #555; margin-bottom: 40px; }
    hr { border: none; border-top: 1px solid #ccc; margin: 28px 0; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; color: #333; }
    p { margin-bottom: 14px; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    td { padding: 6px 12px; border: 1px solid #ddd; font-size: 13px; }
    td:first-child { font-weight: bold; width: 38%; background: #f7f7f7; }
    .sig-area { display: flex; gap: 60px; margin-top: 70px; }
    .sig-box { flex: 1; text-align: center; border-top: 1px solid #333; padding-top: 8px; font-size: 12px; color: #555; }
    .btn { display: block; margin: 40px auto 0; padding: 12px 40px; background: #111; color: #fff; border: none; font-size: 14px; cursor: pointer; font-family: inherit; }
    @media print { .btn { display: none; } body { padding: 30px; } }
  </style>
</head>
<body>
  <h1>Contrato de Locação para Temporada</h1>
  <div class="subtitle">${nomeImovel} — ${cidadeImovel} · Reserva ${esc(reserva.codigo)}</div>
  <hr />

  <h2>Partes</h2>
  <table>
    <tr><td>Locador</td><td>${locador || linha}${docLocador}</td></tr>
    <tr><td>Locatário</td><td>${locatario}${docLocatario}</td></tr>
    <tr><td>Telefone do locatário</td><td>${esc(cliente?.telefone) || linha}</td></tr>
    <tr><td>Imóvel</td><td>${nomeImovel} — ${cidadeImovel}</td></tr>
  </table>

  <h2>Período e ocupação</h2>
  <table>
    <tr><td>Check-in</td><td>${fmtData(reserva.checkin)} às ${fmtHora(reserva.horaCheckin)}</td></tr>
    <tr><td>Check-out</td><td>${fmtData(reserva.checkout)} até ${fmtHora(reserva.horaCheckout)}</td></tr>
    <tr><td>Nº máximo de pessoas</td><td>${esc(reserva.hospedes)} pessoas${reserva.convidados ? ` + ${esc(reserva.convidados)} convidados sem pernoite` : ''}</td></tr>
  </table>

  <h2>Valores</h2>
  <table>
    <tr><td>Hospedagem / pacote</td><td>${brl(reserva.valor)}</td></tr>
    <tr><td>Taxa de limpeza</td><td>${brl(reserva.taxaLimpeza)}</td></tr>
    ${Number(reserva.extras) ? `<tr><td>Adicionais</td><td>${brl(reserva.extras)}</td></tr>` : ''}
    <tr><td>Valor total</td><td><strong>${brl(f.total)}</strong></td></tr>
    <tr><td>Sinal (${config.percentSinal}%)</td><td>${brl(f.sinal)}</td></tr>
    <tr><td>Já pago</td><td>${brl(f.pago)}</td></tr>
    <tr><td>Saldo</td><td>${brl(f.saldo)}${config.pix ? ` — Pix: ${esc(config.pix)}` : ''}</td></tr>
  </table>

  <hr />
  <h2>Cláusulas e condições</h2>

  <p><strong>Cláusula 1ª — Objeto.</strong> O Locador cede ao Locatário, a título oneroso e por temporada, o imóvel <em>${nomeImovel}</em>, situado em ${cidadeImovel}, de ${fmtData(reserva.checkin)} (check-in às ${fmtHora(reserva.horaCheckin)}) a ${fmtData(reserva.checkout)} (check-out até ${fmtHora(reserva.horaCheckout)}), para uso exclusivamente residencial/recreativo.</p>

  <p><strong>Cláusula 2ª — Valor e pagamento.</strong> O valor total acordado é de <strong>${brl(f.total)}</strong>, sendo ${config.percentSinal}% (${brl(f.sinal)}) pagos como sinal para garantia da data, e o saldo pago até ${config.prazoSaldoDias} dias antes do check-in. O não pagamento no prazo implicará o cancelamento da reserva, sem devolução do sinal.</p>

  <p><strong>Cláusula 3ª — Capacidade.</strong> O imóvel será ocupado por no máximo ${esc(reserva.hospedes)} pessoas${reserva.convidados ? `, além de ${esc(reserva.convidados)} convidados sem pernoite` : ''}. O excesso de ocupantes sem anuência prévia do Locador autoriza a rescisão imediata do contrato, sem devolução de valores.</p>

  <p><strong>Cláusula 4ª — Silêncio.</strong> É proibido som automotivo ou amplificado em volume que perturbe a vizinhança após as 00h00 (meia-noite). O descumprimento sujeitará o Locatário às penalidades legais cabíveis.</p>

  <p><strong>Cláusula 5ª — Conservação.</strong> O Locatário se compromete a zelar pelo imóvel e seus bens móveis, responsabilizando-se por danos causados durante a locação. Qualquer avaria deverá ser comunicada imediatamente ao Locador e será cobrada separadamente.</p>

  <p><strong>Cláusula 6ª — Limpeza.</strong> A taxa de limpeza de ${brl(reserva.taxaLimpeza)} cobre a limpeza pós-estadia. Deixar o imóvel em condições visivelmente precárias ou com lixo excessivo poderá ensejar cobrança adicional.</p>

  <p><strong>Cláusula 7ª — Cancelamento.</strong> ${esc(CANCELAMENTO)}</p>

  <p><strong>Cláusula 8ª — Regras da casa.</strong> O Locatário declara conhecer e se compromete a cumprir, e a fazer cumprir por todo o grupo, as seguintes regras:</p>
  <ul>${REGRAS_CASA.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>

  <p><strong>Cláusula 9ª — Foro.</strong> As partes elegem o foro da Comarca de ${esc(config.cidadeForo || 'Mogi das Cruzes/SP')} para dirimir quaisquer litígios oriundos deste instrumento.</p>

  ${reserva.obs ? `<p><strong>Observações.</strong> ${esc(reserva.obs)}</p>` : ''}

  <hr />
  <p style="text-align:center;font-size:13px;color:#555;">${cidadeAssinatura}, ${hoje.getDate()} de ${MESES[hoje.getMonth()].toLowerCase()} de ${hoje.getFullYear()}.</p>

  <div class="sig-area">
    <div class="sig-box">Locador — ${locador || ''}</div>
    <div class="sig-box">Locatário — ${locatario}</div>
  </div>

  <button class="btn" onclick="window.print()">Imprimir / Salvar PDF</button>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  return true
}
