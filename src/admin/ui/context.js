import { createContext, useContext } from 'react'

export const AdminUIContext = createContext(null)

// abrir(tipo, props): abre um modal (ver ModalHost). aviso(texto, tipo): mostra um toast.
export const useAdminUI = () => useContext(AdminUIContext)
