// Gera e baixa arquivos (CSV para planilhas, JSON para backup).

export function baixar(nome, conteudo, tipo) {
  const blob = new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// CSV com ";" e BOM, que é o formato que o Excel em português abre direto.
export function baixarCSV(nome, cabecalho, linhas) {
  const cel = (v) => {
    const s = v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : String(v)
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const texto = [cabecalho, ...linhas].map((l) => l.map(cel).join(';')).join('\r\n')
  baixar(nome, `﻿${texto}`, 'text/csv;charset=utf-8')
}
