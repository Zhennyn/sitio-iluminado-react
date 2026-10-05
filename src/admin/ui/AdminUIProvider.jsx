import { useCallback, useMemo, useRef, useState } from 'react'
import { AdminUIContext } from './context'

export default function AdminUIProvider({ children }) {
  const [modal, setModal] = useState(null)
  const [avisos, setAvisos] = useState([])
  const seq = useRef(0)

  const abrir = useCallback((tipo, props = {}) => setModal({ tipo, props, chave: ++seq.current }), [])
  const fechar = useCallback(() => setModal(null), [])
  const aviso = useCallback((texto, tipo = 'ok') => {
    const id = ++seq.current
    setAvisos((a) => [...a, { id, texto, tipo }])
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3800)
  }, [])

  const valor = useMemo(() => ({ modal, abrir, fechar, aviso }), [modal, abrir, fechar, aviso])

  return (
    <AdminUIContext.Provider value={valor}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast-${a.tipo}`}>{a.texto}</div>
        ))}
      </div>
    </AdminUIContext.Provider>
  )
}
