# New PR 💪

**New PR** é um aplicativo web mobile-first voltado para registro e acompanhamento de **Personal Records (PRs)** em exercícios físicos. O app permite o monitoramento da evolução ao longo do tempo, oferecendo gráficos de progresso por exercício e gestão inteligente de periodizações de treino.

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Firebase** (Authentication + Firestore Database)
- **Stripe** (Sistema de Pagamento)
- **Tailwind CSS** (Estilização)
- **Recharts** (Gráficos)
- **React Router** (Navegação)
- **Lucide React** (Ícones)

## 📋 Funcionalidades

### ✅ Implementadas

- 🔐 **Autenticação Firebase** (Google + Conta Convidado)
- 📊 **Dashboard** com resumo de periodização ativa e gráficos de volume
- 🏋️ **Gestão de Periodizações** (Base, Shock, Deload, etc.)
  - Criar nova periodização
  - Ativar/desativar periodizações
  - Visualizar histórico
- 💪 **Gestão de Treinos**
  - Criar treinos personalizados
  - Adicionar exercícios aos treinos
  - Visualizar lista de treinos
- 🎯 **Gestão de Exercícios**
  - Criar exercícios customizados
  - Buscar exercícios por nome
  - Visualizar detalhes e histórico
- 📈 **Registro de PRs**
  - Registrar peso, repetições e data
  - Cálculo automático de volume
  - Histórico completo de PRs
  - Gráficos de evolução
  - Insights automáticos baseados em desempenho
- 🔄 **Sincronização em tempo real** com Firestore
- 💳 **Sistema de Pagamento** com Stripe
  - Assinatura obrigatória para uso do aplicativo
  - Checkout integrado
  - Verificação de status de assinatura em tempo real

### 🔮 Próximas Features

- Exportação de dados históricos
- Modo offline com sincronização posterior
- Comparativos entre periodizações
- Metas e notificações de progresso

---

## 🛠️ Setup do Projeto

### Pré-requisitos

- Node.js 18+ e npm
- Conta no Firebase (com projeto configurado)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd "new pr"
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Firebase
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRICE_ID=price_...
```

**Nota:** Para mais detalhes sobre configuração do Stripe, consulte [STRIPE_SETUP.md](./STRIPE_SETUP.md).

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

5. Acesse `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

---

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── layout/        # Layout e navegação
│   └── modals/        # Modais de criação/edição
├── config/            # Configuração do Firebase
├── contexts/          # Contextos React (Auth)
├── features/          # Features organizadas por domínio
│   ├── dashboard/     # Dashboard e estatísticas
│   ├── exercises/     # Gestão de exercícios
│   ├── periodizations/# Gestão de periodizações
│   └── workouts/      # Gestão de treinos
├── hooks/             # Custom hooks (Firestore)
├── pages/             # Páginas da aplicação
└── services/          # Serviços de integração Firestore
```

---

## 🗄️ Estrutura do Firestore

Para entender como os dados são organizados no Firestore, consulte [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md).

**Coleções principais:**
- `users` - Dados dos usuários
  - `users/{userId}/subscription/current` - Dados de assinatura
- `periodizations` - Periodizações de treino
- `workouts` - Treinos criados
- `exercises` - Exercícios customizados
- `prs` - Registros de Personal Records
- `workoutExercises` - Relação treinos ↔ exercícios

---

## 🎨 Regras de Negócio

Para entender as regras de negócio do app, consulte [.cursorrules](./.cursorrules).

**Principais regras:**
- Apenas uma periodização pode estar ativa por vez
- Todos os PRs são registrados na periodização ativa
- Treinos podem conter múltiplos exercícios
- Exercícios podem aparecer em múltiplos treinos
- Volume = Peso × Repetições

---

## 🔒 Segurança

O app utiliza **Firebase Authentication** e **Firestore Security Rules** para garantir que:
- Usuários só acessam seus próprios dados
- Todas as operações exigem autenticação
- Validação de dados no backend (Firestore Rules)

---

## 📱 PWA e Mobile

O app é otimizado para dispositivos móveis e pode ser instalado como PWA (Progressive Web App) em smartphones.

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

Desenvolvido com 💪 por [Seu Nome]
