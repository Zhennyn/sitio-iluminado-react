import { BedDouble, Pencil, Plus, Users } from 'lucide-react'
import { useDb } from '../data/store'
import { ativa, resumoMes, totalDe } from '../data/selectors'
import { brl, hoje, mesAtual, pct } from '../lib/format'
import { useAdminUI } from '../ui/context'
import { Badge, Cabecalho, ImovelThumb } from '../ui/components'

export default function Imoveis() {
  const estado = useDb()
  const { abrir } = useAdminUI()
  const dia = hoje()
  const ym = mesAtual()

  return (
    <>
      <Cabecalho titulo="Imóveis" descricao="Imóveis administrados, capacidade, diária e comissão.">
        <button type="button" className="btn btn-primario" onClick={() => abrir('imovel-form')}><Plus size={16} aria-hidden="true" /> Novo imóvel</button>
      </Cabecalho>

      <div className="cards-imoveis">
        {estado.imoveis.map((im) => {
          const doImovel = estado.reservas.filter((r) => r.imovelId === im.id && ativa(r))
          const proxima = doImovel.filter((r) => r.checkout >= dia).sort((a, b) => a.checkin.localeCompare(b.checkin))[0]
          const soImovel = { ...estado, imoveis: [{ ...im, ativo: true }] }
          const mes = resumoMes(soImovel, ym)
          const receitaAno = doImovel.filter((r) => r.checkin.slice(0, 4) === dia.slice(0, 4)).reduce((s, r) => s + totalDe(r), 0)
          return (
            <article key={im.id} className={`card-imovel${im.ativo ? '' : ' inativo'}`}>
              <div className="card-imovel-topo" style={{ '--cor': im.cor }}>
                {im.foto ? <img src={im.foto} alt="" loading="lazy" /> : <ImovelThumb imovel={im} tamanho={64} />}
                <div className="card-imovel-badges">
                  {im.proprio ? <Badge cor="green">Próprio</Badge> : <Badge cor="blue">Comissão {im.comissaoPct}%</Badge>}
                  {!im.ativo && <Badge cor="gray">Inativo</Badge>}
                </div>
              </div>
              <div className="card-imovel-corpo">
                <h2>{im.nome}</h2>
                <p className="muted">{im.cidade}</p>
                <ul className="card-imovel-info">
                  <li><BedDouble size={15} aria-hidden="true" /> {im.quartos || '—'} quartos</li>
                  <li><Users size={15} aria-hidden="true" /> até {im.capacidade || '—'} pessoas</li>
                  <li>{im.usaTabela ? 'Tabela de pacotes' : im.diaria ? `${brl(im.diaria)}/dia` : 'Sem diária'}</li>
                </ul>
                <dl className="card-imovel-nums">
                  <div><dt>Ocupação no mês</dt><dd>{pct(mes.ocupacao)}</dd></div>
                  <div><dt>Reservas no mês</dt><dd>{mes.reservas}</dd></div>
                  <div><dt>Receita no ano</dt><dd>{brl(receitaAno)}</dd></div>
                </dl>
                <p className="card-imovel-prox">
                  {proxima ? <>Próxima: <button type="button" className="link-forte" onClick={() => abrir('reserva', { id: proxima.id })}>{proxima.codigo}</button> em {proxima.checkin.split('-').reverse().join('/')}</> : 'Sem reservas futuras'}
                </p>
                {!im.proprio && <p className="muted">Proprietário: {im.proprietario || 'não informado'}</p>}
              </div>
              <footer className="card-imovel-acoes">
                <button type="button" className="btn btn-sm" onClick={() => abrir('imovel-form', { imovel: im })}><Pencil size={14} aria-hidden="true" /> Editar</button>
                <button type="button" className="btn btn-sm btn-primario" onClick={() => abrir('reserva-form', { inicial: { imovelId: im.id } })} disabled={!im.ativo}><Plus size={14} aria-hidden="true" /> Reserva</button>
              </footer>
            </article>
          )
        })}
      </div>
    </>
  )
}
