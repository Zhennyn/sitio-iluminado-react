import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useDb } from '../data/store'
import { resumoMes, serieMeses } from '../data/selectors'
import { baixarCSV } from '../lib/arquivos'
import { brl, fmtMes, fmtMesCurto, mesAtual, num, pct } from '../lib/format'
import { Cabecalho, ImovelThumb, MesPicker, Painel } from '../ui/components'

const METRICAS = {
  faturamento: { label: 'Faturamento', fmt: brl },
  recebido: { label: 'Recebido', fmt: brl },
  comissao: { label: 'Comissão / lucro', fmt: brl },
  reservas: { label: 'Reservas', fmt: num },
  hospedes: { label: 'Hóspedes', fmt: num },
  ocupacao: { label: 'Ocupação', fmt: pct },
}

export default function Relatorios() {
  const estado = useDb()
  const [ym, setYm] = useState(mesAtual())
  const [metrica, setMetrica] = useState('faturamento')
  const [meses, setMeses] = useState(12)

  const serie = useMemo(() => serieMeses(estado, ym, meses), [estado, ym, meses])
  const mes = serie[serie.length - 1]
  const porImovel = estado.imoveis.map((im) => ({
    im,
    ...resumoMes({ ...estado, imoveis: [{ ...im, ativo: true }], reservas: estado.reservas.filter((r) => r.imovelId === im.id), despesas: estado.despesas.filter((d) => d.imovelId === im.id) }, ym),
  }))
  const m = METRICAS[metrica]
  const max = Math.max(...serie.map((s) => s[metrica]), 1)

  const exportar = () =>
    baixarCSV(
      `relatorio-${serie[0].ym}-a-${ym}.csv`,
      ['Mês', 'Reservas', 'Canceladas', 'Hóspedes', 'Faturamento', 'Recebido', 'Comissão/lucro', 'Repasse', 'Despesas', 'Ocupação %'],
      serie.map((s) => [fmtMes(s.ym), s.reservas, s.canceladas, s.hospedes, s.faturamento, s.recebido, s.comissao, s.repasse, s.despesas, Math.round(s.ocupacao)]),
    )

  return (
    <>
      <Cabecalho titulo="Relatórios" descricao="Faturamento e reservas consideram a data de check-in; “recebido” considera a data do pagamento.">
        <MesPicker valor={ym} onChange={setYm} />
        <button type="button" className="btn" onClick={exportar}><Download size={16} aria-hidden="true" /> Exportar CSV</button>
      </Cabecalho>

      <div className="resumo-cards">
        {Object.entries(METRICAS).map(([k, v]) => (
          <button key={k} type="button" className={`resumo-card${metrica === k ? ' ativo' : ''}`} onClick={() => setMetrica(k)}>
            <span>{v.label}</span>
            <strong>{v.fmt(mes[k])}</strong>
          </button>
        ))}
      </div>

      <Painel
        titulo={`${m.label} — últimos ${meses} meses`}
        acoes={
          <div className="segmentado" role="group" aria-label="Período do gráfico">
            {[6, 12].map((n) => <button key={n} type="button" className={meses === n ? 'ativo' : ''} onClick={() => setMeses(n)}>{n} meses</button>)}
          </div>
        }
      >
        <div className="grafico-barras" role="img" aria-label={`${m.label} por mês`}>
          {serie.map((s) => (
            <div key={s.ym} className={`gb-col${s.ym === ym ? ' atual' : ''}`}>
              <span className="gb-valor">{s[metrica] ? m.fmt(s[metrica]) : ''}</span>
              <span className="gb-barra" style={{ height: `${(s[metrica] / max) * 100}%` }} />
              <span className="gb-mes">{fmtMesCurto(s.ym)}</span>
            </div>
          ))}
        </div>
      </Painel>

      <Painel titulo={`Por imóvel — ${fmtMes(ym)}`}>
        <div className="tabela-scroll">
          <table className="tabela">
            <thead>
              <tr><th>Imóvel</th><th className="num">Reservas</th><th className="num">Hóspedes</th><th className="num">Faturamento</th><th className="num">Comissão / lucro</th><th className="num">Repasse</th><th className="num">Despesas</th><th className="num">Ocupação</th></tr>
            </thead>
            <tbody>
              {porImovel.map((l) => (
                <tr key={l.im.id}>
                  <td><span className="celula-cliente"><ImovelThumb imovel={l.im} tamanho={28} /> {l.im.nome}</span></td>
                  <td className="num">{l.reservas}</td>
                  <td className="num">{num(l.hospedes)}</td>
                  <td className="num">{brl(l.faturamento)}</td>
                  <td className="num">{brl(l.comissao)}</td>
                  <td className="num">{brl(l.repasse)}</td>
                  <td className="num">{brl(l.despesas)}</td>
                  <td className="num">{pct(l.ocupacao)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <th className="num">{mes.reservas}</th>
                <th className="num">{num(mes.hospedes)}</th>
                <th className="num">{brl(mes.faturamento)}</th>
                <th className="num">{brl(mes.comissao)}</th>
                <th className="num">{brl(mes.repasse)}</th>
                <th className="num">{brl(mes.despesas)}</th>
                <th className="num">{pct(mes.ocupacao)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </Painel>
    </>
  )
}
