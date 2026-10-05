import { useAdminUI } from './context'
import ReservaForm from '../forms/ReservaForm'
import ReservaDetalhe from '../forms/ReservaDetalhe'
import { ClienteDetalhe, ClienteForm } from '../forms/ClienteForms'
import { BloqueioForm, DespesaForm, Disponibilidade, ImovelForm } from '../forms/OutrosForms'

const MODAIS = {
  'reserva-form': ReservaForm,
  reserva: ReservaDetalhe,
  'cliente-form': ClienteForm,
  cliente: ClienteDetalhe,
  'imovel-form': ImovelForm,
  'despesa-form': DespesaForm,
  'bloqueio-form': BloqueioForm,
  disponibilidade: Disponibilidade,
}

export default function ModalHost() {
  const { modal } = useAdminUI()
  if (!modal) return null
  const Componente = MODAIS[modal.tipo]
  return Componente ? <Componente key={modal.chave} {...modal.props} /> : null
}
