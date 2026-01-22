# Configuração do Stripe

Este documento explica como configurar o sistema de pagamento com Stripe no aplicativo.

## ⚠️ IMPORTANTE: Método Atual

O sistema agora usa **Firebase Functions** para criar sessões de checkout dinamicamente. Isso é mais seguro e flexível do que usar Payment Links.

**Para configurar, siga as instruções em [FIREBASE_FUNCTIONS_SETUP.md](./FIREBASE_FUNCTIONS_SETUP.md)**

## 📋 Pré-requisitos

1. Conta no Stripe (https://stripe.com)
2. Produto e Price criados no dashboard do Stripe

## 🔑 Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env.local`:

```env
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRICE_ID=price_...
```

### Obtendo as Chaves

1. **Chave Pública (Publishable Key)**:
   - Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
   - Vá em **Developers** > **API keys**
   - Copie a **Publishable key** (começa com `pk_live_` ou `pk_test_`)

2. **Price ID**:
   - Vá em **Products** no dashboard
   - Crie um produto ou selecione um existente
   - Crie um Price para o produto (recurring para assinatura ou one-time para pagamento único)
   - Copie o **Price ID** (começa com `price_`)

## 🏗️ Estrutura de Dados no Firestore

O sistema armazena os dados de assinatura em:

```
users/{userId}/subscription/current
```

**Campos:**
- `status`: Status da assinatura (`active`, `canceled`, `past_due`, `incomplete`, `trialing`, `unpaid`, ou `null`)
- `stripeCustomerId`: ID do cliente no Stripe
- `stripeSubscriptionId`: ID da assinatura no Stripe
- `currentPeriodEnd`: Data de término do período atual
- `cancelAtPeriodEnd`: Se a assinatura será cancelada ao final do período
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

## 🔄 Fluxo de Pagamento

1. **Usuário acessa o app** → Verifica autenticação
2. **Sistema verifica assinatura** → Se não tiver assinatura ativa, redireciona para `/checkout`
3. **Usuário clica em "Assinar"** → Redireciona para o Stripe Checkout
4. **Usuário completa o pagamento** → Stripe redireciona para `/checkout/success`
5. **Sistema atualiza status** → Marca assinatura como `active` no Firestore
6. **Usuário acessa o app** → Agora tem acesso completo

## ⚠️ Importante: Webhooks (Recomendado para Produção)

Para um sistema robusto em produção, você deve configurar **Webhooks do Stripe** para:

- Atualizar automaticamente o status da assinatura quando houver mudanças
- Processar cancelamentos
- Lidar com renovações
- Gerenciar falhas de pagamento

### Configurando Webhooks

1. No dashboard do Stripe, vá em **Developers** > **Webhooks**
2. Adicione um endpoint (ex: `https://seu-backend.com/api/stripe/webhook`)
3. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Exemplo de Webhook Handler (Backend)

```typescript
// Este código deve estar no seu BACKEND, não no frontend
import Stripe from 'stripe';
import { updateSubscriptionData } from './services/subscription.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

app.post('/api/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Atualizar assinatura no Firestore
      await updateSubscriptionData(session.customer, {
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
      });
      break;
    
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateSubscriptionData(subscription.customer, {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
      break;
    
    // ... outros eventos
  }

  res.json({ received: true });
});
```

## 🧪 Modo de Teste

Para testar sem fazer pagamentos reais:

1. Use as chaves de **teste** do Stripe (`pk_test_...`)
2. Use cartões de teste do Stripe:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
   - Mais cartões: https://stripe.com/docs/testing

## 🔒 Segurança

- **NUNCA** exponha a chave secreta (`sk_live_...`) no frontend
- A chave secreta deve estar apenas no backend
- Use HTTPS em produção
- Valide sempre os webhooks usando o `stripe-signature` header

## 📚 Recursos

- [Documentação do Stripe](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
