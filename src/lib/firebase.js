// Conexão com o Firebase do projeto "sitio-iluminado".
// Esta configuração é pública por natureza: quem protege os dados são as regras em firestore.rules.

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
