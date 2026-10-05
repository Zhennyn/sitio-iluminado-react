import { Navigate, Route, Routes } from 'react-router-dom'
import AdminUIProvider from './ui/AdminUIProvider'
import Layout from './ui/Layout'
import Painel from './pages/Painel'
import Calendario from './pages/Calendario'
import Reservas from './pages/Reservas'
import Imoveis from './pages/Imoveis'
import Clientes from './pages/Clientes'
import Financeiro from './pages/Financeiro'
import Repasse from './pages/Repasse'
import Contratos from './pages/Contratos'
import Mensagens from './pages/Mensagens'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import './admin.css'

export default function AdminApp() {
  return (
    <AdminUIProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Painel />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="imoveis" element={<Imoveis />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="repasse" element={<Repasse />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="mensagens" element={<Mensagens />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminUIProvider>
  )
}
