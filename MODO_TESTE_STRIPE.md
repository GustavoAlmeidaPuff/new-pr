# Como Usar Modo Teste do Stripe

## 🔄 Diferença entre Modo Teste e Produção

### Modo Teste (`pk_test_...`)
- ✅ Pagamentos são **falsos** (não cobra de verdade)
- ✅ Use cartões de teste
- ✅ Ideal para desenvolvimento e testes
- ✅ Não afeta dados reais

### Modo Produção (`pk_live_...`)
- ⚠️ Pagamentos são **reais** (cobra de verdade)
- ❌ Cartões de teste não funcionam
- ⚠️ Use apenas em produção
- ⚠️ Afeta dados e cobranças reais

## 🧪 Como Alternar para Modo Teste

### Passo 1: Obter Chaves de Teste

1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie a **Publishable key** (começa com `pk_test_...`)
3. Copie a **Secret key** (começa com `sk_test_...`) - se precisar para backend

### Passo 2: Criar Produto e Price de Teste

1. Acesse: https://dashboard.stripe.com/test/products
2. Crie um produto de teste (ex: "Mensalidade New Pr - Teste")
3. Crie um Price de teste (R$ 5,00/mês)
4. Copie o **Price ID** (começa com `price_...`)

### Passo 3: Criar Payment Link de Teste

1. Acesse: https://dashboard.stripe.com/test/payment-links
2. Crie um novo Payment Link
3. Configure as URLs:
   - Sucesso: `http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - Cancelamento: `http://localhost:5173/checkout/cancel`
4. Copie o link gerado

### Passo 4: Atualizar `.env.local`

Substitua as chaves no arquivo `.env.local`:

```env
# Modo TESTE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ID=price_... (do produto de teste)
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/test/... (link de teste)
```

### Passo 5: Reiniciar o Servidor

```bash
npm run dev
```

## 🎯 Cartões de Teste

No modo teste, use estes cartões:

### Cartões de Sucesso
- `4242 4242 4242 4242` - Sucesso imediato
- `5555 5555 5555 4444` - Mastercard
- `4000 0025 0000 3155` - Requer autenticação 3D Secure

### Cartões de Falha
- `4000 0000 0000 0002` - Cartão recusado
- `4000 0000 0000 9995` - Fundos insuficientes
- `4000 0025 0000 3155` - Requer autenticação (falha se não autenticar)

### Outros Dados de Teste
- **Data**: Qualquer data futura (ex: `12/34`)
- **CVC**: Qualquer 3 dígitos (ex: `123`)
- **CEP**: Qualquer CEP válido (ex: `12345-678`)

## 🔄 Voltar para Produção

Quando quiser voltar para produção:

1. Acesse: https://dashboard.stripe.com/apikeys
2. Use as chaves de produção (`pk_live_...`)
3. Use o Payment Link de produção
4. Atualize o `.env.local`

## ⚠️ Importante

- **Nunca** misture chaves de teste com produção
- **Sempre** teste primeiro no modo teste
- **Só** use produção quando estiver pronto para cobrar de verdade
- Os Payment Links de teste e produção são **diferentes**

## 📝 Checklist

- [ ] Obter chaves de teste do Stripe
- [ ] Criar produto e price de teste
- [ ] Criar Payment Link de teste
- [ ] Atualizar `.env.local` com chaves de teste
- [ ] Reiniciar servidor
- [ ] Testar com cartão de teste
- [ ] Verificar se funciona sem cobrar de verdade
