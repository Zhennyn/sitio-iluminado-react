import { CANCELAMENTO, CONDICOES, REGRAS_CASA } from '../data/regras'

export default function Regras() {
  return (
    <div className="regras-inner">
      <div className="eyebrow">Antes de reservar</div>
      <h2 id="regras-title">Regras e <em>condições</em></h2>
      <div className="regras-grid">
        <div className="regras-bloco">
          <h3>Pagamento e valores</h3>
          <ul>{CONDICOES.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="regras-bloco">
          <h3>Cancelamento</h3>
          <p>{CANCELAMENTO}</p>
        </div>
        <details className="regras-bloco regras-casa">
          <summary><h3>Regras da casa</h3></summary>
          <ul>{REGRAS_CASA.map((t) => <li key={t}>{t}</li>)}</ul>
        </details>
      </div>
    </div>
  )
}
