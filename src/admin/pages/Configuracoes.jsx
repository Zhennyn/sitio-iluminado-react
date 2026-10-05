import { useRef, useState } from 'react'
import { DatabaseBackup, Download, Eraser, RotateCcw, Save, Trash2, Upload } from 'lucide-react'
import { db, useDb } from '../data/store'
import { baixar } from '../lib/arquivos'
import { hoje } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Cabecalho, Campo, Painel } from '../ui/components'

const CAMPOS_TEXTO = ['empresa', 'responsavel', 'documento', 'telefone', 'email', 'pix', 'cidadeForo', 'horaCheckin', 'horaCheckout']
const CAMPOS_NUMERO = ['taxaLimpeza', 'percentSinal', 'prazoSaldoDias', 'prazoSinalDias']

const valoresDe = (config) => Object.fromEntries([...CAMPOS_TEXTO, ...CAMPOS_NUMERO].map((k) => [k, String(config[k] ?? '')]))

export default function Configuracoes() {
  const estado = useDb()
  // Recria o formulário quando a configuração muda por fora (importação, restauração…).
  return <ConfiguracoesForm key={JSON.stringify(valoresDe(estado.config))} />
}

function ConfiguracoesForm() {
  const estado = useDb()
  const { aviso } = useAdminUI()
  const arquivo = useRef(null)
  const [f, setF] = useState(() => valoresDe(estado.config))
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const temExemplos = ['clientes', 'reservas', 'despesas', 'bloqueios'].some((c) => estado[c].some((i) => i.demo))

  const salvar = (e) => {
    e.preventDefault()
    const patch = {}
    for (const k of CAMPOS_TEXTO) patch[k] = f[k].trim()
    for (const k of CAMPOS_NUMERO) patch[k] = Math.max(0, Number(String(f[k]).replace(',', '.')) || 0)
    if (!patch.empresa) patch.empresa = 'Hospeda Temporada'
    patch.percentSinal = Math.min(100, patch.percentSinal)
    db.salvarConfig(patch)
    aviso('Configurações salvas.')
  }

  const exportar = () => {
    baixar(`backup-painel-${hoje()}.json`, db.exportar(), 'application/json')
    aviso('Backup baixado. Guarde o arquivo em local seguro.')
  }

  const importar = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!window.confirm('Importar este backup vai SUBSTITUIR todos os dados atuais do painel. Continuar?')) return
    try {
      db.importar(await file.text())
      aviso('Backup importado.')
    } catch (err) {
      aviso(err.message || 'Não foi possível ler o arquivo.', 'erro')
    }
  }

  const removerExemplos = () => {
    if (!window.confirm('Remover todas as reservas, clientes, despesas e bloqueios de exemplo? Seus dados cadastrados são mantidos.')) return
    db.removerExemplos()
    aviso('Dados de exemplo removidos.')
  }
  const restaurarExemplos = () => {
    if (!window.confirm('Isso APAGA tudo e volta aos dados de exemplo. Continuar?')) return
    db.restaurarExemplos()
    aviso('Dados de exemplo restaurados.')
  }
  const apagarTudo = () => {
    if (window.prompt('Para apagar todas as reservas, clientes e lançamentos, digite APAGAR:') !== 'APAGAR') return
    db.apagarTudo()
    aviso('Dados apagados. Imóveis e configurações foram mantidos.')
  }

  return (
    <>
      <Cabecalho titulo="Configurações" descricao="Dados usados nos contratos, nas mensagens e nos cálculos." />

      <form onSubmit={salvar}>
        <div className="grade-2">
          <Painel titulo="Empresa e responsável">
            <div className="form-grade">
              <Campo label="Nome da empresa"><input value={f.empresa} onChange={set('empresa')} /></Campo>
              <Campo label="Responsável"><input value={f.responsavel} onChange={set('responsavel')} /></Campo>
              <Campo label="CPF / CNPJ do locador" dica="Aparece no contrato"><input value={f.documento} onChange={set('documento')} /></Campo>
              <Campo label="Telefone"><input value={f.telefone} onChange={set('telefone')} /></Campo>
              <Campo label="E-mail"><input type="email" value={f.email} onChange={set('email')} /></Campo>
              <Campo label="Chave Pix" dica="Usada nas mensagens e no contrato"><input value={f.pix} onChange={set('pix')} /></Campo>
              <Campo label="Foro (cidade/UF)" largo><input value={f.cidadeForo} onChange={set('cidadeForo')} /></Campo>
            </div>
          </Painel>

          <Painel titulo="Regras das reservas">
            <div className="form-grade">
              <Campo label="Taxa de limpeza padrão (R$)"><input type="number" min="0" step="0.01" value={f.taxaLimpeza} onChange={set('taxaLimpeza')} /></Campo>
              <Campo label="Sinal (% do total)"><input type="number" min="0" max="100" value={f.percentSinal} onChange={set('percentSinal')} /></Campo>
              <Campo label="Saldo até (dias antes do check-in)"><input type="number" min="0" value={f.prazoSaldoDias} onChange={set('prazoSaldoDias')} /></Campo>
              <Campo label="Prazo para pagar o sinal (dias)" dica="Depois disso aparece como “sinal vencido”"><input type="number" min="0" value={f.prazoSinalDias} onChange={set('prazoSinalDias')} /></Campo>
              <Campo label="Horário padrão de check-in"><input type="time" value={f.horaCheckin} onChange={set('horaCheckin')} /></Campo>
              <Campo label="Horário padrão de check-out"><input type="time" value={f.horaCheckout} onChange={set('horaCheckout')} /></Campo>
            </div>
          </Painel>
        </div>
        <div className="barra-salvar">
          <button type="submit" className="btn btn-primario"><Save size={16} aria-hidden="true" /> Salvar configurações</button>
        </div>
      </form>

      <Painel titulo="Dados e backup">
        <div className="alerta alerta-info">
          <DatabaseBackup size={18} aria-hidden="true" />
          <div>
            Por enquanto os dados ficam <strong>somente neste navegador</strong>. Se limpar os dados do navegador ou trocar de
            computador, eles não vão junto. Faça backups com frequência — o mesmo arquivo poderá ser importado no banco de dados depois.
          </div>
        </div>
        <div className="botoes botoes-config">
          <button type="button" className="btn btn-primario" onClick={exportar}><Download size={16} aria-hidden="true" /> Baixar backup</button>
          <button type="button" className="btn" onClick={() => arquivo.current?.click()}><Upload size={16} aria-hidden="true" /> Importar backup</button>
          <input ref={arquivo} type="file" accept="application/json,.json" hidden onChange={importar} />
          {temExemplos && <button type="button" className="btn" onClick={removerExemplos}><Eraser size={16} aria-hidden="true" /> Remover dados de exemplo</button>}
          <button type="button" className="btn" onClick={restaurarExemplos}><RotateCcw size={16} aria-hidden="true" /> Restaurar exemplos</button>
          <button type="button" className="btn btn-perigo" onClick={apagarTudo}><Trash2 size={16} aria-hidden="true" /> Apagar tudo</button>
        </div>
      </Painel>
    </>
  )
}
