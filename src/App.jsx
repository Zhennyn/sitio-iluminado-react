import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import { WhatsAppIcon } from './components/BrandIcons'
import { whatsappLink } from './data/site'

// O painel só é baixado quando alguém acessa /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function WhatsAppFAB() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  return (
    <a
      className="wa-fab"
      href={whatsappLink('Olá! Gostaria de informações sobre o Sítio Iluminado.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <WhatsAppIcon size={32} />
    </a>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="carregando-admin">Carregando painel…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
      <WhatsAppFAB />
    </BrowserRouter>
  )
}
