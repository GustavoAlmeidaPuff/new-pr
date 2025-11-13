# Como Usar o Firebase

O Firebase foi integrado com sucesso ao projeto! Aqui estão exemplos de como usá-lo:

## Configuração

A configuração do Firebase está em `src/config/firebase.ts` e é automaticamente inicializada quando o app inicia.

## Exemplos de Uso

### Importar o Firebase em qualquer componente:

```typescript
import { app, analytics } from './config/firebase';
```

### Adicionar Autenticação:

```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from './config/firebase';

const auth = getAuth(app);

// Login
const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuário logado:', userCredential.user);
  } catch (error) {
    console.error('Erro ao fazer login:', error);
  }
};
```

### Adicionar Firestore (Banco de Dados):

```typescript
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { app } from './config/firebase';

const db = getFirestore(app);

// Adicionar documento
const addData = async () => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name: 'João',
      email: 'joao@example.com'
    });
    console.log('Documento criado com ID:', docRef.id);
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
  }
};

// Ler documentos
const getData = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
  });
};
```

### Adicionar Storage:

```typescript
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './config/firebase';

const storage = getStorage(app);

// Upload de arquivo
const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    console.log('Arquivo disponível em:', url);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
  }
};
```

## Serviços Disponíveis

- ✅ **Analytics**: Já configurado
- 🔐 **Authentication**: Pronto para usar
- 📦 **Firestore**: Pronto para usar
- 📁 **Storage**: Pronto para usar
- 🔔 **Cloud Messaging**: Pronto para usar
- ⚡ **Functions**: Pronto para usar

## Nota sobre Node.js

⚠️ **Importante**: O projeto requer Node.js versão 20.19+ ou 22.12+ devido ao Vite 7. Atualize sua versão do Node.js para executar o projeto:

```bash
# Usando nvm (recomendado)
nvm install 20
nvm use 20

# Ou baixe diretamente do site oficial
# https://nodejs.org/
```

