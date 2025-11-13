# 🔥 Como Aplicar as Regras do Firestore

## Passo a Passo

### 1. Acesse o Firebase Console
- Vá para https://console.firebase.google.com/
- Selecione seu projeto **new-pr-app**

### 2. Navegue até Firestore Database
- No menu lateral esquerdo, clique em **Firestore Database**
- Clique na aba **Rules** (Regras)

### 3. Substitua as Regras Atuais
Você verá algo assim:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ Isso bloqueia tudo!
    }
  }
}
```

**DELETE TUDO** e cole as novas regras abaixo:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função auxiliar para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função auxiliar para verificar se o usuário é o dono do recurso
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Regras para coleção de usuários
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      // Subcoleção de periodizações
      match /periodizations/{periodizationId} {
        allow read, write: if isOwner(userId);
      }
      
      // Subcoleção de treinos
      match /workouts/{workoutId} {
        allow read, write: if isOwner(userId);
      }
      
      // Subcoleção de exercícios
      match /exercises/{exerciseId} {
        allow read, write: if isOwner(userId);
      }
      
      // Subcoleção de PRs
      match /prs/{prId} {
        allow read, write: if isOwner(userId);
      }
      
      // Subcoleção de relação treinos-exercícios
      match /workoutExercises/{workoutExerciseId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

### 4. Publique as Regras
- Clique no botão **Publish** (Publicar) no canto superior direito
- Aguarde a confirmação de que as regras foram publicadas

### 5. Teste as Regras (Opcional)
O Firebase Console tem um simulador de regras. Para testá-lo:

1. Clique na aba **Rules Playground** (ao lado de Rules)
2. Configure um teste:
   - **Location**: `/periodizations/test123`
   - **Auth**: Selecione "Authenticated" e adicione um `uid` (ex: `user123`)
   - **Request type**: `get`
   - Clique em **Run**

Se as regras estiverem corretas, você verá:
- ✅ **Allowed** para operações com usuário autenticado e `userId` correto
- ❌ **Denied** para operações sem autenticação ou com `userId` diferente

---

## ✅ O que as Novas Regras Fazem

### 🔐 Segurança Garantida
- ✅ **Exige autenticação** para todas as operações
- ✅ **Isolamento total** entre usuários - cada um só vê seus dados
- ✅ **Validação de propriedade** - não pode editar dados de outros
- ✅ **Proteção contra acesso não autorizado**

### 📋 Permissões por Coleção

**Estrutura Hierárquica:**
```
users/{userId}/
  ├── periodizations/
  ├── workouts/
  ├── exercises/
  ├── prs/
  └── workoutExercises/
```

Todas as subcoleções herdam a mesma regra:
- ✅ Usuário autenticado pode ler e escrever apenas suas **próprias** subcoleções
- ✅ Total isolamento entre usuários
- ✅ Não precisa verificar `userId` em cada documento

---

## 🧪 Como Testar o App Após Aplicar

1. Execute o app:
```bash
npm run dev
```

2. Faça login (Google ou Convidado)

3. Teste criar uma periodização:
   - Clique em **Nova periodização**
   - Preencha o formulário
   - Clique em **Criar**

4. Verifique no Firebase Console:
   - Vá em **Firestore Database → Data**
   - Você deve ver a coleção `users` → `{seu UID}` → `periodizations`
   - A periodização está dentro do seu documento de usuário ✅

---

## ⚠️ Problemas Comuns

### Erro: "Missing or insufficient permissions"
**Causa**: As regras antigas ainda estão ativas ou você não publicou as novas.

**Solução**: 
1. Verifique se você clicou em **Publish**
2. Aguarde alguns segundos para as regras propagarem
3. Faça hard refresh no navegador (Ctrl+Shift+R)

### Erro: "The query requires an index"
**Causa**: Firestore precisa de índices compostos para algumas queries.

**Solução**:
1. O console mostrará um link no erro
2. Clique no link - ele criará o índice automaticamente
3. Aguarde alguns minutos até o índice ser criado

### Nenhum dado aparece após login
**Causa**: Pode ser que você ainda não tenha criado dados.

**Solução**:
1. Crie uma periodização primeiro
2. Depois crie exercícios e treinos
3. Por fim, registre PRs

---

## 📞 Precisa de Ajuda?

Se após aplicar as regras o app ainda não funcionar:

1. Abra o **Console do navegador** (F12)
2. Procure por erros relacionados a Firestore
3. Copie a mensagem de erro completa
4. Verifique se o Firebase Auth está funcionando (usuário logado)

---

## 🎉 Pronto!

Após aplicar as regras, seu app estará **100% funcional** e **totalmente seguro**! 

Todas as operações de CRUD (criar, ler, atualizar, deletar) funcionarão corretamente, respeitando as permissões de cada usuário.

