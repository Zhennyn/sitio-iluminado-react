// Camada de dados do painel.
//
// Por enquanto tudo fica no localStorage do navegador. Toda leitura/escrita passa por aqui,
// então ligar um banco de dados depois significa trocar só este arquivo.

import { useSyncExternalStore } from 'react'
import { CONFIG_PADRAO, IMOVEIS, VERSAO, criarSeed } from './seed'

const CHAVE = 'hospeda-temporada:admin'
export const COLECOES = ['imoveis', 'clientes', 'reservas', 'bloqueios', 'despesas', 'repasses']

function normalizar(dados) {
  const base = criarSeed({ vazio: true })
  const out = { ...base, versao: VERSAO, config: { ...CONFIG_PADRAO, ...dados.config } }
  for (const col of COLECOES) out[col] = Array.isArray(dados[col]) ? dados[col] : base[col]
  // Versão 2: inclui os locais novos do portfólio em dados salvos antes deles existirem.
  if ((dados.versao || 1) < 2) {
    const ids = new Set(out.imoveis.map((i) => i.id))
    const novos = IMOVEIS.filter((i) => !ids.has(i.id)).map((i) => ({ ...i, criadoEm: new Date().toISOString() }))
    out.imoveis = [...out.imoveis, ...novos]
  }
  if (!Array.isArray(out.config.templates) || !out.config.templates.length) {
    out.config.templates = CONFIG_PADRAO.templates
  }
  return out
}

function carregar() {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo) return normalizar(JSON.parse(salvo))
  } catch {
    // dados corrompidos ou storage bloqueado: começa com os dados de exemplo
  }
  return criarSeed()
}

let estado = carregar()
let erroAoSalvar = false
const ouvintes = new Set()

function avisar() {
  ouvintes.forEach((fn) => fn())
}

function commit(proximo) {
  estado = proximo
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
    erroAoSalvar = false
  } catch {
    erroAoSalvar = true
  }
  avisar()
}

// Mantém abas abertas ao mesmo tempo em sincronia.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CHAVE || !e.newValue) return
    try {
      estado = normalizar(JSON.parse(e.newValue))
      avisar()
    } catch {
      // ignora alterações inválidas vindas de outra aba
    }
  })
}

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const aplicar = (item, patch) => ({ ...item, ...(typeof patch === 'function' ? patch(item) : patch) })

export const db = {
  get: () => estado,
  falhouAoSalvar: () => erroAoSalvar,

  inserir(colecao, dados) {
    const item = { id: uid(), criadoEm: new Date().toISOString(), ...dados }
    commit({ ...estado, [colecao]: [...estado[colecao], item] })
    return item
  },

  atualizar(colecao, id, patch) {
    commit({ ...estado, [colecao]: estado[colecao].map((i) => (i.id === id ? aplicar(i, patch) : i)) })
  },

  remover(colecao, id) {
    commit({ ...estado, [colecao]: estado[colecao].filter((i) => i.id !== id) })
  },

  // Cria uma reserva já com o próximo código sequencial (R-0001, R-0002…).
  inserirReserva(dados) {
    const n = estado.config.proximoCodigo || 1
    const item = {
      id: uid(),
      criadoEm: new Date().toISOString(),
      codigo: `R-${String(n).padStart(4, '0')}`,
      pagamentos: [],
      contrato: 'pendente',
      ...dados,
    }
    commit({
      ...estado,
      reservas: [...estado.reservas, item],
      config: { ...estado.config, proximoCodigo: n + 1 },
    })
    return item
  },

  salvarConfig(patch) {
    commit({ ...estado, config: { ...estado.config, ...patch } })
  },

  exportar: () => JSON.stringify({ ...estado, exportadoEm: new Date().toISOString() }, null, 2),

  importar(texto) {
    const dados = JSON.parse(texto)
    if (!dados || typeof dados !== 'object' || !Array.isArray(dados.reservas)) {
      throw new Error('Arquivo de backup inválido.')
    }
    commit(normalizar(dados))
  },

  removerExemplos() {
    const proximo = { ...estado }
    for (const col of COLECOES) proximo[col] = estado[col].filter((i) => !i.demo)
    commit(proximo)
  },

  restaurarExemplos() {
    commit(criarSeed())
  },

  apagarTudo() {
    commit({ ...criarSeed({ vazio: true }), imoveis: estado.imoveis, config: { ...estado.config, proximoCodigo: 1 } })
  },
}

const assinar = (fn) => {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

export function useDb() {
  return useSyncExternalStore(assinar, db.get)
}
