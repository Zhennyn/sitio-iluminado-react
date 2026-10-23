// Login do painel (e-mail e senha). Quem libera o acesso é a lista `admins` no Firestore.
import { getAuth, signOut } from 'firebase/auth'
import { app } from '../../lib/firebase'

export const auth = getAuth(app)
auth.languageCode = 'pt'

export const sair = () => signOut(auth)
