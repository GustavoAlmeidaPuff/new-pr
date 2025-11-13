# Estrutura do Firestore - New PR

Este documento descreve a estrutura de coleções e documentos no Firestore Database utilizado pelo app **New PR**.

## 📂 Estrutura Hierárquica

Todos os dados do usuário estão organizados como **subcoleções** dentro do documento do usuário:

```
users/{userId}/
  ├── periodizations/{periodizationId}
  ├── workouts/{workoutId}
  ├── exercises/{exerciseId}
  ├── prs/{prId}
  └── workoutExercises/{workoutExerciseId}
```

---

## Coleções

### 1. `users/{userId}`

Documento raiz que armazena informações básicas dos usuários autenticados.

**Campos:**
- `displayName` (string): Nome do usuário
- `email` (string): Email do usuário
- `photoURL` (string | null): URL da foto de perfil
- `createdAt` (timestamp): Data de criação do documento
- `updatedAt` (timestamp): Data da última atualização

**Documento ID:** `{userId}` (UID do Firebase Auth)

---

### 2. `users/{userId}/periodizations/{periodizationId}`

Subcoleção que armazena as periodizações de treino do usuário (Base, Shock, Deload, etc.).

**Campos:**
- `name` (string): Nome da periodização (ex: "Base", "Shock")
- `status` (string): Status da periodização - `"active"`, `"completed"`, ou `"upcoming"`
- `startDate` (string): Data de início no formato ISO (YYYY-MM-DD)
- `durationDays` (number): Duração em dias
- `completedAt` (timestamp | null): Data de conclusão (apenas se status = "completed")
- `prs` (number): Contador de PRs registrados nesta periodização
- `progressPercent` (number): Percentual de progresso (calculado)
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data da última atualização

**Regras:**
- Apenas uma periodização pode ter `status: "active"` por usuário
- Ao criar/ativar uma nova periodização, todas as outras do usuário são marcadas como `"completed"`

---

### 3. `users/{userId}/workouts/{workoutId}`

Subcoleção que armazena os treinos criados pelo usuário (Treino A, B, C, etc.).

**Campos:**
- `name` (string): Nome do treino (ex: "Treino A - Upper")
- `description` (string): Descrição do treino (ex: "Peito, Ombros, Tríceps")
- `exerciseCount` (number): Contador de exercícios no treino
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data da última atualização

---

### 4. `users/{userId}/workoutExercises/{workoutExerciseId}`

Subcoleção que relaciona exercícios a treinos (tabela intermediária muitos-para-muitos).

**Campos:**
- `workoutId` (string): ID do treino
- `exerciseId` (string): ID do exercício
- `order` (number): Ordem do exercício no treino (para permitir reordenação)
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data da última atualização

---

### 5. `users/{userId}/exercises/{exerciseId}`

Subcoleção que armazena os exercícios criados pelo usuário.

**Campos:**
- `name` (string): Nome do exercício (ex: "Supino Reto")
- `muscleGroup` (string): Grupo muscular principal (ex: "Peito")
- `muscles` (array de strings): Lista de músculos trabalhados (ex: ["Peito", "Tríceps"])
- `notes` (string): Observações sobre o exercício
- `createdAt` (timestamp): Data de criação
- `updatedAt` (timestamp): Data da última atualização

---

### 6. `users/{userId}/prs/{prId}`

Subcoleção que armazena os registros de PRs de cada exercício.

**Campos:**
- `exerciseId` (string): ID do exercício relacionado
- `periodizationId` (string): ID da periodização ativa no momento do registro
- `weight` (number): Peso utilizado (em kg)
- `reps` (number): Número de repetições
- `volume` (number): Volume total (weight * reps)
- `date` (string): Data do PR no formato ISO (YYYY-MM-DD)
- `notes` (string): Observações sobre o PR
- `createdAt` (timestamp): Data de criação do registro
- `updatedAt` (timestamp): Data da última atualização

**Nota:** Não há mais campo `userId` pois os dados já estão dentro de `users/{userId}`

---

## Fluxo de Dados

### Criar Periodização
1. Busca todas as periodizações ativas do usuário
2. Marca todas como `"completed"` e define `completedAt`
3. Cria nova periodização com `status: "active"`

### Registrar PR
1. Busca a periodização ativa do usuário
2. Cria novo documento em `prs` com o `periodizationId`
3. Incrementa o contador `prs` da periodização
4. Calcula estatísticas (volume, tendências, insights)

### Adicionar Exercício ao Treino
1. Cria documento em `workoutExercises` relacionando workout e exercise
2. Incrementa `exerciseCount` do treino

---

## Consultas Principais

### Dashboard
```typescript
// Busca periodização ativa
const periodizationsPath = `users/${userId}/periodizations`;
query(
  collection(firestore, periodizationsPath),
  where("status", "==", "active")
)

// Busca PRs da periodização
const prsPath = `users/${userId}/prs`;
query(
  collection(firestore, prsPath),
  orderBy("date", "desc")
)
```

### Detalhes do Exercício
```typescript
// Busca PRs do exercício
const prsPath = `users/${userId}/prs`;
query(
  collection(firestore, prsPath),
  orderBy("date", "desc")
)
// Filtra localmente por exerciseId
```

### Lista de Treinos
```typescript
// Busca treinos do usuário
const workoutsPath = `users/${userId}/workouts`;
query(
  collection(firestore, workoutsPath),
  orderBy("createdAt", "desc")
)
```

---

## Regras de Segurança (Firestore Rules)

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
    
    // Usuários podem ler e escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      // Todas as subcoleções herdam a mesma regra
      match /periodizations/{periodizationId} {
        allow read, write: if isOwner(userId);
      }
      
      match /workouts/{workoutId} {
        allow read, write: if isOwner(userId);
      }
      
      match /exercises/{exerciseId} {
        allow read, write: if isOwner(userId);
      }
      
      match /prs/{prId} {
        allow read, write: if isOwner(userId);
      }
      
      match /workoutExercises/{workoutExerciseId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

**Vantagens da Estrutura Hierárquica:**
- ✅ Regras de segurança mais simples e diretas
- ✅ Isolamento automático de dados entre usuários
- ✅ Não precisa filtrar por `userId` em queries
- ✅ Mais eficiente e organizado
- ✅ Facilita exclusão de todos os dados de um usuário

---

## Backup e Exportação

O app permite exportação de dados históricos do usuário através de:
- Backup manual via interface do app
- Exportação automática agendada (futuro)

---

## Vantagens da Estrutura Hierárquica

1. **Segurança Simplificada**: Não precisa verificar `userId` em cada documento
2. **Queries Mais Simples**: Não precisa filtrar por `userId` nas queries
3. **Organização Clara**: Todos os dados do usuário ficam juntos
4. **Performance**: Firestore otimiza queries em subcoleções
5. **Escalabilidade**: Facilita adicionar novos tipos de dados por usuário

## Observações

- Todos os timestamps são gerados com `serverTimestamp()` do Firestore
- Datas de PRs e periodizações usam formato ISO (YYYY-MM-DD) para facilitar ordenação e filtragem
- O volume é sempre calculado como `weight * reps`
- Tendências são calculadas no frontend comparando volumes entre PRs consecutivos
- **Importante**: Não há mais campo `userId` nos documentos, pois o caminho já identifica o dono

