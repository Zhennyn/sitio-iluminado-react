// Datas ocupadas de cada imóvel, para o calendário e a busca do site público.
// Lê só a coleção `ocupacao` (imóvel + datas), mantida pelo painel; nada de dados de clientes.
// O Firebase é baixado sob demanda para não pesar o carregamento da página.

import { useSyncExternalStore } from 'react'
import { addDias } from '../admin/lib/format'

const VAZIO = new Set()
let porImovel = new Map()
let iniciado = false
const ouvintes = new Set()

async function iniciar() {
  iniciado = true
  try {
    const [{ firestore }, { collection, onSnapshot }] = await Promise.all([
      import('./firebase'),
      import('firebase/firestore'),
    ])
    onSnapshot(
      collection(firestore, 'ocupacao'),
      (snap) => {
        const mapa = new Map()
        for (const d of snap.docs) {
          const { imovelId, inicio, fim } = d.data()
          if (!imovelId || !inicio || !fim) continue
          if (!mapa.has(imovelId)) mapa.set(imovelId, new Set())
          const dias = mapa.get(imovelId)
          for (let dia = inicio; dia <= fim; dia = addDias(dia, 1)) dias.add(dia)
        }
        porImovel = mapa
        ouvintes.forEach((fn) => fn())
      },
      (err) => console.error('Não foi possível carregar a disponibilidade', err),
    )
  } catch (err) {
    console.error('Não foi possível carregar a disponibilidade', err)
  }
}

const assinar = (fn) => {
  if (!iniciado) iniciar()
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

// Mapa imóvel → Set de dias "AAAA-MM-DD" ocupados (check-in até check-out, inclusive).
export function useOcupacao() {
  return useSyncExternalStore(assinar, () => porImovel)
}

export const diasDe = (mapa, imovelId) => mapa.get(imovelId) || VAZIO
