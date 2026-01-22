# Configuração do Firebase Functions para Stripe

Este guia explica como configurar Firebase Functions para criar sessões de checkout do Stripe dinamicamente.

## Pré-requisitos

1. Node.js 20+ instalado
2. Firebase CLI instalado: `npm install -g firebase-tools`
3. Conta no Firebase e Stripe configuradas

## Passo 1: Instalar Dependências

```bash
cd functions
npm install
```

## Passo 2: Fazer Login no Firebase

```bash
firebase login
```

## Passo 3: Inicializar Firebase Functions (se ainda não foi feito)

```bash
firebase init functions
```

Quando perguntado:
- Use JavaScript (não TypeScript)
- Instale dependências? Sim

## Passo 4: Instalar dependência CORS

```bash
cd functions
npm install cors
cd ..
```

## Passo 5: Configurar Chave Secreta do Stripe

```bash
firebase functions:config:set stripe.secret_key="sua_chave_secreta_aqui"
```

**IMPORTANTE**: 
- Substitua `sua_chave_secreta_aqui` pela sua chave secreta real do Stripe
- A chave secreta começa com `sk_live_...` (produção) ou `sk_test_...` (teste)
- **NUNCA** commite chaves secretas no repositório

## Passo 6: Fazer Deploy das Functions

```bash
firebase deploy --only functions
```

## Passo 7: Verificar se Funcionou

Após o deploy, você verá uma URL como:
```
https://us-central1-new-pr-app.cloudfunctions.net/createCheckoutSession
```

## Testando Localmente (Opcional)

Para testar localmente antes de fazer deploy:

```bash
cd functions
npm run serve
```

Isso iniciará o emulador do Firebase Functions na porta 5001.

## Solução de Problemas

### Erro de CORS
Se você receber um erro de CORS, certifique-se de:
1. Fazer o deploy das functions novamente após instalar o `cors`
2. Verificar se a região das functions está correta (us-central1)
3. Limpar o cache do navegador

### Erro: "functions/not-found"
- Certifique-se de que fez o deploy das functions
- Verifique se o nome da função está correto: `createCheckoutSession`
- Execute: `firebase deploy --only functions`

### Erro: "unauthenticated"
- Certifique-se de que o usuário está autenticado no Firebase Auth

### Erro: "invalid-argument"
- Verifique se o `priceId` está sendo enviado corretamente

### Firebase CLI não instalado
Se o comando `firebase` não for encontrado:
```bash
npm install -g firebase-tools
```

## Estrutura de Arquivos

```
functions/
├── index.js          # Código das Cloud Functions
├── package.json      # Dependências
└── node_modules/     # Dependências instaladas
```

## Próximos Passos

Após configurar as Functions, o checkout funcionará automaticamente. O frontend já está configurado para usar a função `createCheckoutSession`.
