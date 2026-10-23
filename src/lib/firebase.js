// Conexão com o Firebase do projeto "sitio-iluminado".
//
// Esta configuração NÃO é segredo e não é um vazamento: a apiKey do Firebase Web só identifica o
// projeto e vai de qualquer forma para o navegador de quem abre o site (esconder em .env não muda
// isso). O alerta de "secret scanning" do GitHub para ela é falso positivo.
// Quem protege os dados:
//   - as regras em firestore.rules (só a coleção `ocupacao` é pública; o resto exige um usuário
//     logado que esteja na coleção `admins`);
//   - cadastro de usuários desativado no console (Authentication → Configurações);
//   - a chave restrita aos domínios do site no Google Cloud Console (APIs e serviços → Credenciais).

import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBHcK57-KkJpLcLBSeooN-Fq-4k8GiPdgg',
  authDomain: 'sitio-iluminado.firebaseapp.com',
  projectId: 'sitio-iluminado',
  storageBucket: 'sitio-iluminado.firebasestorage.app',
  messagingSenderId: '1034337567992',
  appId: '1:1034337567992:web:8284b790428562b6fbe70d',
}

export const app = initializeApp(firebaseConfig)

// Cache local: o painel abre na hora com os últimos dados e continua funcionando sem internet.
export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
