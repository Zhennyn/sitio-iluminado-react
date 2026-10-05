import { useState } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { db, useDb } from '../data/store'
import { CATEGORIAS_DESPESA, conflitosDe } from '../data/selectors'
import { addDias, brl, diffDias, fmtData, hoje } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Campo, ImovelThumb, Modal, Vazio } from '../ui/components'

const numero = (v) => Number(String(v).replace(',', '.')) || 0

export function ImovelForm({ imovel }) {
  const estado = useDb()
  const { fechar, aviso } = useAdminUI()
  const [f, setF] = useState({
    nome: imovel?.nome || '',
    cidade: imovel?.cidade || '',
    quartos: String(imovel?.quartos ?? ''),
    banheiros: String(imovel?.banheiros ?? ''),
    capacidade: String(imovel?.capacidade ?? ''),
    diaria: String(imovel?.diaria ?? ''),
    usaTabela: imovel?.usaTabela ?? false,
    proprio: imovel?.proprio ?? false,
    comissaoPct: String(imovel?.comissaoPct ?? 20),
    proprietario: imovel?.proprietario || '',
    foto: imovel?.foto || '',
    cor: imovel?.cor || '#2563eb',
    ativo: imovel?.ativo ?? true,
  })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const salvar = (e) => {
    e.preventDefault()
    if (!f.nome.trim()) {
      setErro('Informe o nome.')
      return
    }
    const dados = {
      ...f,
      nome: f.nome.trim(),
      cidade: f.cidade.trim(),
      quartos: numero(f.quartos),
      banheiros: numero(f.banheiros),
      capacidade: numero(f.capacidade),
      diaria: numero(f.diaria),
      comissaoPct: f.proprio ? 0 : numero(f.comissaoPct),
      proprietario: f.proprietario.trim(),
      foto: f.foto.trim(),
    }
    if (imovel) db.atualizar('imoveis', imovel.id, dados)
    else db.inserir('imoveis', dados)
    aviso(imovel ? 'Imóvel atualizado.' : 'Imóvel cadastrado.')
    fechar()
  }

  const excluir = () => {
    if (estado.reservas.some((r) => r.imovelId === imovel.id)) {
      aviso('Este imóvel tem reservas. Desative-o em vez de excluir.', 'erro')
      return
    }
    if (!window.confirm(`Excluir o imóvel ${imovel.nome}?`)) return
    db.remover('imoveis', imovel.id)
    fechar()
    aviso('Imóvel excluído.')
  }

  return (
    <Modal
      titulo={imovel ? `Editar ${imovel.nome}` : 'Novo imóvel'}
      onClose={fechar}
      largura="lg"
      rodape={
        <>
          {imovel && <button type="button" className="btn btn-perigo-txt" onClick={excluir}><Trash2 size={16} aria-hidden="true" /> Excluir</button>}
          <span className="espaco" />
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" form="form-imovel" className="btn btn-primario">Salvar</button>
        </>
      }
    >
      <form id="form-imovel" className="form-grade" onSubmit={salvar} noValidate>
        <Campo label="Nome" erro={erro}><input value={f.nome} onChange={set('nome')} /></Campo>
        <Campo label="Cidade / região"><input value={f.cidade} onChange={set('cidade')} placeholder="Ex.: Guararema - SP" /></Campo>
        <div className="form-grade form-grade-3 campo-largo">
          <Campo label="Quartos"><input type="number" min="0" value={f.quartos} onChange={set('quartos')} /></Campo>
          <Campo label="Banheiros"><input type="number" min="0" value={f.banheiros} onChange={set('banheiros')} /></Campo>
          <Campo label="Capacidade (pessoas)"><input type="number" min="0" value={f.capacidade} onChange={set('capacidade')} /></Campo>
        </div>
        <Campo label="Diária (R$)" dica="Usada para sugerir o valor das reservas">
          <input type="number" min="0" step="0.01" value={f.diaria} onChange={set('diaria')} />
        </Campo>
        <label className="check">
          <input type="checkbox" checked={f.usaTabela} onChange={set('usaTabela')} />
          <span>Usar a tabela de pacotes do site (para locais que têm tabela)</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={f.proprio} onChange={set('proprio')} />
          <span>Imóvel próprio (sem repasse a proprietário)</span>
        </label>
        <label className="check">
          <input type="checkbox" checked={f.ativo} onChange={set('ativo')} />
          <span>Ativo (aparece no calendário e nas novas reservas)</span>
        </label>
        {!f.proprio && (
          <>
            <Campo label="Proprietário"><input value={f.proprietario} onChange={set('proprietario')} /></Campo>
            <Campo label="Comissão da administradora (%)"><input type="number" min="0" max="100" value={f.comissaoPct} onChange={set('comissaoPct')} /></Campo>
          </>
        )}
        <Campo label="Foto (endereço da imagem)" dica="Ex.: /img/piscina-500.webp">
          <input value={f.foto} onChange={set('foto')} />
        </Campo>
        <Campo label="Cor no calendário"><input type="color" value={f.cor} onChange={set('cor')} /></Campo>
      </form>
    </Modal>
  )
}

export function DespesaForm({ despesa }) {
  const estado = useDb()
  const { fechar, aviso } = useAdminUI()
  const [f, setF] = useState({
    data: despesa?.data || hoje(),
    imovelId: despesa?.imovelId ?? '',
    categoria: despesa?.categoria || CATEGORIAS_DESPESA[0],
    descricao: despesa?.descricao || '',
    valor: String(despesa?.valor ?? ''),
  })
  const [erro, setErro] = useState('')
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const salvar = (e) => {
    e.preventDefault()
    if (!(numero(f.valor) > 0) || !f.data) {
      setErro('Informe a data e um valor maior que zero.')
      return
    }
    const dados = { ...f, descricao: f.descricao.trim(), valor: numero(f.valor) }
    if (despesa) db.atualizar('despesas', despesa.id, dados)
    else db.inserir('despesas', dados)
    aviso(despesa ? 'Despesa atualizada.' : 'Despesa lançada.')
    fechar()
  }

  const excluir = () => {
    if (!window.confirm('Excluir esta despesa?')) return
    db.remover('despesas', despesa.id)
    fechar()
    aviso('Despesa excluída.')
  }

  return (
    <Modal
      titulo={despesa ? 'Editar despesa' : 'Nova despesa'}
      onClose={fechar}
      rodape={
        <>
          {despesa && <button type="button" className="btn btn-perigo-txt" onClick={excluir}><Trash2 size={16} aria-hidden="true" /> Excluir</button>}
          <span className="espaco" />
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" form="form-despesa" className="btn btn-primario">Salvar</button>
        </>
      }
    >
      <form id="form-despesa" className="form-grade" onSubmit={salvar} noValidate>
        <Campo label="Data"><input type="date" value={f.data} onChange={set('data')} /></Campo>
        <Campo label="Valor (R$)" erro={erro}><input type="number" min="0" step="0.01" value={f.valor} onChange={set('valor')} data-autofocus /></Campo>
        <Campo label="Imóvel" dica="Despesas de imóveis de terceiros são descontadas do repasse">
          <select value={f.imovelId} onChange={set('imovelId')}>
            <option value="">Geral (administração)</option>
            {estado.imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </Campo>
        <Campo label="Categoria">
          <select value={f.categoria} onChange={set('categoria')}>
            {CATEGORIAS_DESPESA.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo label="Descrição" largo><input value={f.descricao} onChange={set('descricao')} /></Campo>
      </form>
    </Modal>
  )
}

export function BloqueioForm({ bloqueio, inicial = {} }) {
  const estado = useDb()
  const { fechar, aviso } = useAdminUI()
  const [f, setF] = useState({
    imovelId: bloqueio?.imovelId || inicial.imovelId || estado.imoveis[0]?.id || '',
    inicio: bloqueio?.inicio || inicial.inicio || hoje(),
    fim: bloqueio?.fim || inicial.fim || inicial.inicio || hoje(),
    motivo: bloqueio?.motivo || '',
  })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const conflitos = conflitosDe(estado, { imovelId: f.imovelId, checkin: f.inicio, checkout: f.fim, ignorarId: bloqueio?.id })

  const salvar = (e) => {
    e.preventDefault()
    if (f.fim < f.inicio) {
      aviso('A data final deve ser igual ou posterior à inicial.', 'erro')
      return
    }
    if (conflitos.length) {
      aviso('Já existe reserva ou bloqueio nestas datas.', 'erro')
      return
    }
    const dados = { ...f, motivo: f.motivo.trim() }
    if (bloqueio) db.atualizar('bloqueios', bloqueio.id, dados)
    else db.inserir('bloqueios', dados)
    aviso('Datas bloqueadas.')
    fechar()
  }

  const excluir = () => {
    db.remover('bloqueios', bloqueio.id)
    fechar()
    aviso('Bloqueio removido.')
  }

  return (
    <Modal
      titulo={bloqueio ? 'Editar bloqueio' : 'Bloquear datas'}
      subtitulo="Use para manutenção, uso pessoal ou datas que não serão alugadas."
      onClose={fechar}
      rodape={
        <>
          {bloqueio && <button type="button" className="btn btn-perigo-txt" onClick={excluir}><Trash2 size={16} aria-hidden="true" /> Desbloquear</button>}
          <span className="espaco" />
          <button type="button" className="btn" onClick={fechar}>Cancelar</button>
          <button type="submit" form="form-bloqueio" className="btn btn-primario">Salvar</button>
        </>
      }
    >
      <form id="form-bloqueio" className="form-grade" onSubmit={salvar} noValidate>
        <Campo label="Imóvel" largo>
          <select value={f.imovelId} onChange={set('imovelId')}>
            {estado.imoveis.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
        </Campo>
        <Campo label="De"><input type="date" value={f.inicio} onChange={set('inicio')} /></Campo>
        <Campo label="Até"><input type="date" value={f.fim} min={f.inicio} onChange={set('fim')} /></Campo>
        <Campo label="Motivo" largo><input value={f.motivo} onChange={set('motivo')} placeholder="Ex.: Manutenção da piscina" /></Campo>
        {conflitos.length > 0 && <div className="alerta alerta-erro campo-largo">Há reservas ou bloqueios nestas datas.</div>}
      </form>
    </Modal>
  )
}

export function Disponibilidade() {
  const estado = useDb()
  const { fechar, abrir } = useAdminUI()
  const [f, setF] = useState({ checkin: hoje(), checkout: addDias(hoje(), 1), pessoas: '' })
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))
  const valido = f.checkin && f.checkout && f.checkout >= f.checkin
  const pessoas = Number(f.pessoas) || 0

  const resultado = valido
    ? estado.imoveis
      .filter((i) => i.ativo)
      .map((i) => ({ imovel: i, conflitos: conflitosDe(estado, { imovelId: i.id, checkin: f.checkin, checkout: f.checkout }) }))
    : []
  const noites = valido ? diffDias(f.checkin, f.checkout) : 0

  return (
    <Modal titulo="Buscar disponibilidade" onClose={fechar} largura="lg">
      <div className="form-grade form-grade-3">
        <Campo label="Check-in"><input type="date" value={f.checkin} onChange={set('checkin')} /></Campo>
        <Campo label="Check-out"><input type="date" value={f.checkout} min={f.checkin} onChange={set('checkout')} /></Campo>
        <Campo label="Pessoas"><input type="number" min="1" value={f.pessoas} onChange={set('pessoas')} placeholder="Opcional" /></Campo>
      </div>
      {!valido ? <Vazio icone={Search} titulo="Escolha um período válido." /> : (
        <ul className="lista-disp">
          {resultado.map(({ imovel, conflitos }) => {
            const cabe = !pessoas || !imovel.capacidade || pessoas <= imovel.capacidade
            const livre = !conflitos.length
            return (
              <li key={imovel.id} className={livre && cabe ? 'livre' : 'ocupado'}>
                <ImovelThumb imovel={imovel} tamanho={44} />
                <div>
                  <strong>{imovel.nome}</strong>
                  <small>
                    {imovel.cidade} · até {imovel.capacidade} pessoas
                    {imovel.diaria ? ` · ${brl(imovel.diaria)}/dia (≈ ${brl(imovel.diaria * Math.max(1, noites))})` : ''}
                  </small>
                  {!livre && <small className="txt-vermelho">Ocupado: {conflitos.map(({ item }) => `${fmtData(item.checkin || item.inicio)}–${fmtData(item.checkout || item.fim)}`).join(', ')}</small>}
                  {livre && !cabe && <small className="txt-laranja">Capacidade insuficiente para {pessoas} pessoas</small>}
                </div>
                {livre && (
                  <button
                    type="button"
                    className="btn btn-sm btn-primario"
                    onClick={() => abrir('reserva-form', { inicial: { imovelId: imovel.id, checkin: f.checkin, checkout: f.checkout, hospedes: f.pessoas } })}
                  >
                    Reservar
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
