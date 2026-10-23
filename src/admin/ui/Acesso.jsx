import { useEffect, useState } from 'react'
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { LogIn, LogOut } from 'lucide-react'
import { auth, sair } from '../lib/auth'
import { conectar, desconectar, ehAdmin, useCarregado } from '../data/store'
import { Campo } from './components'

const MENSAGENS = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Este usuário foi desativado.',
  'auth/too-many-requests': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
}

// Login por e-mail e senha. Os usuários são criados no console do Firebase (Authentication) e só
// entram no painel se o e-mail também estiver na coleção `admins` do Firestore.
export default function Acesso({ children }) {
  const [usuario, setUsuario] = useState(undefined)
  const [autorizado, setAutorizado] = useState(null)
  const carregado = useCarregado()

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUsuario(u)
        setAutorizado(null)
        if (!u) {
          desconectar()
          return
        }
        const ok = await ehAdmin(u.email)
        setAutorizado(ok)
        if (ok) conectar()
      }),
    [],
  )

  if (usuario === undefined || (usuario && autorizado === null) || (autorizado && !carregado)) {
    return <div className="acesso"><p className="acesso-carregando">Carregando painel…</p></div>
  }

  if (!usuario) return <FormLogin />

  if (!autorizado) {
    return (
      <div className="acesso">
        <div className="acesso-card">
          <h1>Acesso não autorizado</h1>
          <p>O usuário <strong>{usuario.email}</strong> não tem permissão para usar o painel. Peça ao administrador para liberar este e-mail.</p>
          <button type="button" className="btn" onClick={sair}><LogOut size={16} aria-hidden="true" /> Entrar com outro usuário</button>
        </div>
      </div>
    )
  }

  return children
}

function FormLogin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState(null)

  const entrar = async (e) => {
    e.preventDefault()
    setMsg(null)
    setEnviando(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha)
    } catch (err) {
      setMsg({ erro: true, texto: MENSAGENS[err.code] || 'Não foi possível entrar. Tente novamente.' })
      setEnviando(false)
    }
  }

  const esqueci = async () => {
    if (!email.trim()) {
      setMsg({ erro: true, texto: 'Digite seu e-mail acima para receber o link de nova senha.' })
      return
    }
    try {
      await sendPasswordResetEmail(auth, email.trim())
    } catch {
      // Não revela se o e-mail existe ou não.
    }
    setMsg({ erro: false, texto: 'Se este e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.' })
  }

  return (
    <div className="acesso">
      <meta name="robots" content="noindex, nofollow" />
      <form className="acesso-card" onSubmit={entrar}>
        <span className="acesso-marca" aria-hidden="true">☀</span>
        <h1>Painel Hospeda Temporada</h1>
        <p>Entre para acessar reservas, clientes e financeiro.</p>
        <div className="acesso-campos">
          <Campo label="E-mail">
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Campo>
          <Campo label="Senha">
            <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </Campo>
        </div>
        <button type="submit" className="btn btn-primario acesso-entrar" disabled={enviando}>
          <LogIn size={16} aria-hidden="true" /> {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" className="acesso-link" onClick={esqueci}>Esqueci minha senha</button>
        {msg && <p className={msg.erro ? 'acesso-erro' : 'acesso-ok'} role={msg.erro ? 'alert' : 'status'}>{msg.texto}</p>}
      </form>
    </div>
  )
}
