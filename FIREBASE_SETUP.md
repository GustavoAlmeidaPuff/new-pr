# Configuração do Firebase - New PR

Este documento contém instruções para configurar o Firebase para o app **New PR**.

---

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Escolha um nome para o projeto (ex: "new-pr-app")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

---

## 2. Configurar Authentication

1. No menu lateral, vá em **Authentication**
2. Clique em **Get Started**
3. Na aba **Sign-in method**, habilite:
   - **Google** (configure OAuth com seu email)
   - **Email/Password** (para conta convidado)

### Criar Conta Convidado (Opcional)

1. Na aba **Users**, clique em **Add user**
2. Email: `convidado@newpr.com`
3. Password: `ggamestv27122007` (ou sua senha preferida)

---

## 3. Configurar Firestore Database

1. No menu lateral, vá em **Firestore Database**
2. Clique em **Create database**
3. Escolha o local do servidor (ex: `southamerica-east1` para São Paulo)
4. Inicie em **production mode**

### 3.1 Configurar Regras de Segurança

1. Na aba **Rules**, cole o conteúdo do arquivo `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    match /periodizations/{periodizationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /workouts/{workoutId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /workoutExercises/{workoutExerciseId} {
      allow read, write: if isAuthenticated();
    }
    
    match /exercises/{exerciseId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    match /prs/{prId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
  }
}
```

2. Clique em **Publish**

### 3.2 Criar Índices Compostos

Na aba **Indexes**, crie os seguintes índices compostos para otimizar as consultas:

#### Índice 1: PRs por usuário e exercício
- **Collection ID:** `prs`
- **Fields:**
  - `userId` (Ascending)
  - `exerciseId` (Ascending)
  - `date` (Descending)

#### Índice 2: PRs por usuário e periodização
- **Collection ID:** `prs`
- **Fields:**
  - `userId` (Ascending)
  - `periodizationId` (Ascending)
  - `date` (Descending)

#### Índice 3: Periodizações por usuário e status
- **Collection ID:** `periodizations`
- **Fields:**
  - `userId` (Ascending)
  - `status` (Ascending)
  - `createdAt` (Descending)

#### Índice 4: Treinos por usuário
- **Collection ID:** `workouts`
- **Fields:**
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### Índice 5: Exercícios por usuário
- **Collection ID:** `exercises`
- **Fields:**
  - `userId` (Ascending)
  - `name` (Ascending)

---

## 4. Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem → **Project settings**
2. Na aba **General**, role até **Your apps**
3. Clique no ícone **</>** (Web)
4. Registre o app com um nickname (ex: "new-pr-web")
5. Copie as credenciais do Firebase Config

Exemplo:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "new-pr-app.firebaseapp.com",
  projectId: "new-pr-app",
  storageBucket: "new-pr-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-ABC123XYZ"
};
```

---

## 5. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=new-pr-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=new-pr-app
VITE_FIREBASE_STORAGE_BUCKET=new-pr-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
```

> ⚠️ **Importante:** Não commite o arquivo `.env` no repositório. Ele já está no `.gitignore`.

---

## 6. Estrutura de Coleções

O Firestore será populado automaticamente quando você usar o app. As coleções criadas serão:

- `users` - Dados dos usuários
- `periodizations` - Periodizações de treino
- `workouts` - Treinos criados
- `exercises` - Exercícios customizados
- `prs` - Registros de Personal Records
- `workoutExercises` - Relação treinos ↔ exercícios

Para mais detalhes, consulte [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md).

---

## 7. Teste a Configuração

1. Execute o app localmente:
```bash
npm run dev
```

2. Acesse `http://localhost:5173`
3. Faça login com Google ou conta convidado
4. Crie uma periodização
5. Verifique no Firebase Console se os dados foram salvos

---

## 8. Deploy (Opcional)

### 8.1 Firebase Hosting

1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Faça login:
```bash
firebase login
```

3. Inicialize o projeto:
```bash
firebase init hosting
```

4. Configure:
   - Public directory: `dist`
   - Single-page app: `Yes`
   - GitHub Actions: `No`

5. Build e deploy:
```bash
npm run build
firebase deploy
```

### 8.2 Outros Serviços

Você também pode fazer deploy em:
- **Vercel** (recomendado para React)
- **Netlify**
- **GitHub Pages**

---

## 9. Monitoramento e Logs

- Acesse **Firestore Database → Usage** para ver estatísticas
- Acesse **Authentication → Users** para ver usuários cadastrados
- Configure alertas em **Project settings → Integrations**

---

## 🔧 Troubleshooting

### Erro: "Missing or insufficient permissions"
- Verifique se as regras do Firestore estão publicadas corretamente
- Certifique-se de que o usuário está autenticado

### Erro: "The query requires an index"
- Clique no link fornecido no erro do console
- Isso criará automaticamente o índice necessário

### Erro: "Firebase: Error (auth/popup-blocked)"
- Desabilite bloqueadores de popup no navegador
- Tente usar o método de login por redirecionamento

---

## 📞 Suporte

Para mais informações, consulte:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Firestore](https://firebase.google.com/docs/firestore)
- [Documentação do Firebase Auth](https://firebase.google.com/docs/auth)

