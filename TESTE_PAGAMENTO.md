# Guia de Teste do Sistema de Pagamento

Este documento explica como testar o sistema de pagamento completo.

## ✅ Pré-requisitos

1. Servidor de desenvolvimento rodando: `npm run dev`
2. Payment Link configurado no `.env.local`
3. Usuário autenticado no app

## 🧪 Passo a Passo para Testar

### 1. Verificar Configuração

Certifique-se de que o Payment Link está configurado:

```bash
# Verificar se o Payment Link está no .env.local
cat .env.local | grep VITE_STRIPE_PAYMENT_LINK
```

Deve mostrar:
```
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/28E28s3x7dCu10PdD00RG00
```

### 2. Configurar URLs no Payment Link

**IMPORTANTE**: No dashboard do Stripe, configure as URLs de redirecionamento:

1. Acesse: https://dashboard.stripe.com/payment-links
2. Clique no seu Payment Link
3. Configure:
   - **URL de sucesso**: `http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - **URL de cancelamento**: `http://localhost:5173/checkout/cancel`

### 3. Testar o Fluxo Completo

#### Passo 1: Acessar o Checkout
- Acesse `http://localhost:5173/checkout`
- Você deve ver a página "Acesso Premium Necessário"
- Clique em "Assinar Agora"

#### Passo 2: Ser Redirecionado
- Você deve ser redirecionado para a página de pagamento do Stripe
- Verifique se a URL começa com `https://buy.stripe.com/...`

#### Passo 3: Preencher Dados de Teste

Use um **cartão de teste** do Stripe:

**Cartão de Sucesso:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura (ex: `12/34`)
- CVC: Qualquer 3 dígitos (ex: `123`)
- Nome: Qualquer nome
- Email: Seu email de teste

**Outros Cartões de Teste:**
- Falha de autenticação: `4000 0025 0000 3155`
- Cartão recusado: `4000 0000 0000 0002`
- Cartão insuficiente: `4000 0000 0000 9995`

#### Passo 4: Completar o Pagamento
- Preencha os dados do cartão
- Clique em "Assinar"
- Aguarde o processamento

#### Passo 5: Verificar Redirecionamento
- Após o pagamento, você deve ser redirecionado para `/checkout/success`
- Deve aparecer a mensagem "Assinatura Confirmada!"
- Após 2 segundos, deve redirecionar para a página inicial (`/`)

### 4. Verificar no Firestore

Após o pagamento bem-sucedido, verifique se a assinatura foi salva:

1. Acesse o Firebase Console: https://console.firebase.google.com
2. Vá em **Firestore Database**
3. Navegue até: `users/{seu-user-id}/subscription/current`
4. Verifique se existe um documento com:
   - `status: "active"`
   - `stripeSubscriptionId: "cs_test_..."` (ou similar)

### 5. Testar Acesso ao App

Após a assinatura ser ativada:
- Você deve conseguir acessar todas as páginas do app
- Não deve mais ser redirecionado para `/checkout`
- O status da assinatura deve aparecer como "active"

### 6. Testar Cancelamento

Para testar o fluxo de cancelamento:
- No checkout do Stripe, clique em "Cancelar" ou feche a página
- Você deve ser redirecionado para `/checkout/cancel`
- Deve aparecer a mensagem "Checkout Cancelado"

## 🔍 Verificações Adicionais

### Verificar Console do Navegador

Abra o DevTools (F12) e verifique:
- Não há erros no console
- As requisições estão sendo feitas corretamente
- O redirecionamento está funcionando

### Verificar Logs do Stripe

1. Acesse: https://dashboard.stripe.com/logs
2. Verifique se há eventos de checkout
3. Verifique se há erros ou avisos

### Verificar Status da Assinatura

No app, você pode verificar o status da assinatura:
- Acesse qualquer página do app
- O sistema deve verificar automaticamente se você tem assinatura ativa
- Se não tiver, será redirecionado para `/checkout`

## ⚠️ Problemas Comuns

### Erro: "Payment Link não configurado"
- Verifique se o `.env.local` tem `VITE_STRIPE_PAYMENT_LINK`
- Reinicie o servidor: `npm run dev`

### Erro: Redirecionamento não funciona
- Verifique se as URLs estão configuradas corretamente no Payment Link
- Certifique-se de usar `http://localhost:5173` (não `https`)

### Erro: Assinatura não é salva
- Verifique se o usuário está autenticado
- Verifique se o Firestore está configurado corretamente
- Verifique as regras de segurança do Firestore

### Erro: Ainda é redirecionado para /checkout
- Verifique se a assinatura foi salva no Firestore
- Verifique se o status é `"active"`
- Limpe o cache do navegador

## 📝 Notas Importantes

1. **Modo de Teste**: Os cartões de teste funcionam apenas no modo de teste do Stripe. Certifique-se de estar usando chaves de teste (`pk_test_...` e `sk_test_...`)

2. **Webhooks**: Em produção, configure webhooks do Stripe para atualizar automaticamente o status da assinatura quando houver mudanças (renovação, cancelamento, etc.)

3. **URLs de Produção**: Quando for para produção, atualize as URLs no Payment Link para usar seu domínio real (ex: `https://seudominio.com/checkout/success`)

## 🎯 Checklist de Teste

- [ ] Payment Link configurado no `.env.local`
- [ ] URLs de redirecionamento configuradas no Stripe
- [ ] Servidor rodando (`npm run dev`)
- [ ] Usuário autenticado
- [ ] Redirecionamento para Stripe funciona
- [ ] Pagamento com cartão de teste funciona
- [ ] Redirecionamento de sucesso funciona
- [ ] Assinatura salva no Firestore
- [ ] Acesso ao app após pagamento funciona
- [ ] Cancelamento funciona corretamente
