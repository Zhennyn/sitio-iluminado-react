// Camada de dados do painel, sobre o Firestore.
//
// O painel lê tudo de uma vez (são poucos registros) e mantém uma cópia em memória, então as telas
// continuam síncronas: `useDb()` devolve o estado e `db.*` grava. Cada gravação atualiza a cópia
// local na hora e é enviada ao Firestore em seguida; os listeners trazem de volta o que mudar por
// fora (outra aba, outro computador).
//
// Reservas e bloqueios também são espelhados em `ocupacao/{id}` (só imóvel e datas), que é a única
// coleção que o site público pode ler.

import { useSyncExternalStore } from 'react'
import { collection, doc, getDoc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { firestore } from '../../lib/firebase'
import { CONFIG_PADRAO, IMOVEIS, VERSAO, criarSeed } from './seed'

export const COLECOES = ['imoveis', 'clientes', 'reservas', 'bloqueios', 'despesas', 'repasses']
const CONFIG_DOC = ['config', 'geral']
const CHAVE_LOCAL_ANTIGA = 'hospeda-temporada:admin'

function normalizar(dados) {
  const base = criarSeed({ vazio: true })
  const out = { ...base, versao: VERSAO, config: { ...CONFIG_PADRAO, ...dados.config } }
  for (const col of COLECOES) out[col] = Array.isArray(dados[col]) ? dados[col] : base[col]
  if (!Array.isArray(out.config.templates) || !out.config.templates.length) {
    out.config.templates = CONFIG_PADRAO.templates
  }
  return out
}

let estado = criarSeed({ vazio: true })
let carregado = false
// Erro ao ler do Firestore (ex.: regras bloqueando). A tela de acesso mostra em vez de ficar carregando.
let erroLeitura = null
let erroAoSalvar = false
const ouvintes = new Set()

function avisar() {
  ouvintes.forEach((fn) => fn())
}

function setLocal(proximo) {
  estado = proximo
  avisar()
}

// O Firestore não aceita `undefined`; o JSON também tira funções e datas inválidas.
const limpo = (obj) => JSON.parse(JSON.stringify(obj))

async function enviar(promessa) {
  try {
    await promessa
    if (erroAoSalvar) {
      erroAoSalvar = false
      avisar()
    }
  } catch (err) {
    console.error('Falha ao salvar no Firestore', err)
    erroAoSalvar = true
    avisar()
  }
}

// O que o site público enxerga de uma reserva ou bloqueio. null = não ocupa a agenda.
function ocupacaoDe(colecao, item) {
  if (item.demo) return null
  if (colecao === 'reservas') {
    return item.status === 'cancelada' ? null : { imovelId: item.imovelId, inicio: item.checkin, fim: item.checkout }
  }
  if (colecao === 'bloqueios') return { imovelId: item.imovelId, inicio: item.inicio, fim: item.fim }
  return undefined
}

function gravarItem(batch, colecao, item) {
  batch.set(doc(firestore, colecao, item.id), limpo(item))
  const oc = ocupacaoDe(colecao, item)
  if (oc) batch.set(doc(firestore, 'ocupacao', item.id), oc)
  else if (oc === null) batch.delete(doc(firestore, 'ocupacao', item.id))
}

function apagarItem(batch, colecao, id) {
  batch.delete(doc(firestore, colecao, id))
  if (colecao === 'reservas' || colecao === 'bloqueios') batch.delete(doc(firestore, 'ocupacao', id))
}

// Lotes do Firestore aceitam até 500 operações; usamos 400 por segurança.
async function emLotes(operacoes) {
  for (let i = 0; i < operacoes.length; i += 400) {
    const batch = writeBatch(firestore)
    operacoes.slice(i, i + 400).forEach((op) => op(batch))
    await batch.commit()
  }
}

// Substitui todo o conteúdo do banco por `novo` (importação, limpeza…).
function substituirTudo(novo) {
  const anterior = estado
  setLocal(novo)
  const ops = []
  for (const col of COLECOES) {
    const ids = new Set(novo[col].map((i) => i.id))
    for (const item of anterior[col]) if (!ids.has(item.id)) ops.push((b) => apagarItem(b, col, item.id))
    for (const item of novo[col]) ops.push((b) => gravarItem(b, col, item))
  }
  ops.push((b) => b.set(doc(firestore, ...CONFIG_DOC), limpo({ ...novo.config, versao: VERSAO })))
  return enviar(emLotes(ops))
}

// ---------------------------------------------------------------------------
// Conexão: chamada pela tela de acesso depois de confirmar que o usuário é administrador.

let cancelar = []

function falhaLeitura(err) {
  console.error('Falha ao ler do Firestore', err)
  erroLeitura = err.code || 'erro'
  avisar()
}

export function conectar() {
  if (cancelar.length) return
  const pendentes = new Set([...COLECOES, 'config'])
  const recebeu = (nome) => {
    if (!pendentes.delete(nome) || pendentes.size) return
    carregado = true
    primeiroAcesso()
    avisar()
  }

  cancelar = COLECOES.map((col) =>
    onSnapshot(collection(firestore, col), (snap) => {
      estado = { ...estado, [col]: snap.docs.map((d) => ({ ...d.data(), id: d.id })) }
      recebeu(col)
      avisar()
    }, falhaLeitura),
  )
  cancelar.push(
    onSnapshot(doc(firestore, ...CONFIG_DOC), (snap) => {
      estado = { ...estado, configExiste: snap.exists(), config: normalizar({ config: snap.data() || {} }).config }
      recebeu('config')
      avisar()
    }, falhaLeitura),
  )
}

export function desconectar() {
  cancelar.forEach((fn) => fn())
  cancelar = []
  carregado = false
  erroLeitura = null
  estado = criarSeed({ vazio: true })
  avisar()
}

// Banco vazio: começa com o portfólio e, se este navegador tinha dados da versão sem banco
// (localStorage), traz os registros reais (sem os de exemplo). Banco antigo: inclui imóveis novos.
function primeiroAcesso() {
  const vazio = COLECOES.every((col) => !estado[col].length)
  if (!estado.configExiste && !vazio) {
    // Dados sem o documento de configuração: só recria a configuração, sem tocar no resto.
    enviar(setDoc(doc(firestore, ...CONFIG_DOC), limpo({ ...estado.config, versao: VERSAO })))
    return
  }
  if (!estado.configExiste) {
    let base = criarSeed({ vazio: true })
    try {
      const salvo = localStorage.getItem(CHAVE_LOCAL_ANTIGA)
      if (salvo) {
        const antigo = normalizar(JSON.parse(salvo))
        for (const col of COLECOES) antigo[col] = antigo[col].filter((i) => !i.demo)
        const ids = new Set(antigo.imoveis.map((i) => i.id))
        antigo.imoveis = [...antigo.imoveis, ...base.imoveis.filter((i) => !ids.has(i.id))]
        base = antigo
      }
    } catch {
      // sem dados antigos legíveis: segue com o portfólio padrão
    }
    substituirTudo({ ...base, versao: VERSAO })
    return
  }
  if ((estado.config.versao || 1) < VERSAO) {
    const ids = new Set(estado.imoveis.map((i) => i.id))
    const novos = IMOVEIS.filter((i) => !ids.has(i.id)).map((i) => ({ ...i, criadoEm: new Date().toISOString() }))
    const batch = writeBatch(firestore)
    novos.forEach((i) => gravarItem(batch, 'imoveis', i))
    batch.set(doc(firestore, ...CONFIG_DOC), { versao: VERSAO }, { merge: true })
    setLocal({ ...estado, imoveis: [...estado.imoveis, ...novos], config: { ...estado.config, versao: VERSAO } })
    enviar(batch.commit())
  }
}

// Confere se o e-mail está na lista `admins` (documento com o e-mail como ID, criado no console).
export async function ehAdmin(email) {
  try {
    return (await getDoc(doc(firestore, 'admins', email.toLowerCase()))).exists()
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const aplicar = (item, patch) => ({ ...item, ...(typeof patch === 'function' ? patch(item) : patch) })

export const db = {
  get: () => estado,
  carregado: () => carregado,
  erroLeitura: () => erroLeitura,
  falhouAoSalvar: () => erroAoSalvar,

  inserir(colecao, dados) {
    const item = { id: uid(), criadoEm: new Date().toISOString(), ...dados }
    setLocal({ ...estado, [colecao]: [...estado[colecao], item] })
    const batch = writeBatch(firestore)
    gravarItem(batch, colecao, item)
    enviar(batch.commit())
    return item
  },

  atualizar(colecao, id, patch) {
    const atual = estado[colecao].find((i) => i.id === id)
    if (!atual) return
    const novo = aplicar(atual, patch)
    setLocal({ ...estado, [colecao]: estado[colecao].map((i) => (i.id === id ? novo : i)) })
    const batch = writeBatch(firestore)
    gravarItem(batch, colecao, novo)
    enviar(batch.commit())
  },

  remover(colecao, id) {
    setLocal({ ...estado, [colecao]: estado[colecao].filter((i) => i.id !== id) })
    const batch = writeBatch(firestore)
    apagarItem(batch, colecao, id)
    enviar(batch.commit())
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
    setLocal({
      ...estado,
      reservas: [...estado.reservas, item],
      config: { ...estado.config, proximoCodigo: n + 1 },
    })
    const batch = writeBatch(firestore)
    gravarItem(batch, 'reservas', item)
    batch.set(doc(firestore, ...CONFIG_DOC), { proximoCodigo: n + 1 }, { merge: true })
    enviar(batch.commit())
    return item
  },

  salvarConfig(patch) {
    setLocal({ ...estado, config: { ...estado.config, ...patch } })
    enviar(setDoc(doc(firestore, ...CONFIG_DOC), limpo(patch), { merge: true }))
  },

  exportar: () => {
    const { configExiste: _, ...dados } = estado
    return JSON.stringify({ ...dados, exportadoEm: new Date().toISOString() }, null, 2)
  },

  importar(texto) {
    const dados = JSON.parse(texto)
    if (!dados || typeof dados !== 'object' || !Array.isArray(dados.reservas)) {
      throw new Error('Arquivo de backup inválido.')
    }
    return substituirTudo(normalizar(dados))
  },

  removerExemplos() {
    const proximo = { ...estado }
    for (const col of COLECOES) proximo[col] = estado[col].filter((i) => !i.demo)
    return substituirTudo(proximo)
  },

  apagarTudo() {
    return substituirTudo({
      ...criarSeed({ vazio: true }),
      imoveis: estado.imoveis,
      config: { ...estado.config, proximoCodigo: 1 },
    })
  },
}

const assinar = (fn) => {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

export function useDb() {
  return useSyncExternalStore(assinar, db.get)
}

export function useErroLeitura() {
  return useSyncExternalStore(assinar, db.erroLeitura)
}

export function useCarregado() {
  return useSyncExternalStore(assinar, db.carregado)
}
