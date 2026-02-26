# Deploy na Vercel - Guia Completo

Este guia explica como fazer deploy do aplicativo na Vercel com o sistema de pagamento funcionando.

## ✅ O que funciona automaticamente

- ✅ O código já usa `window.location.origin` para URLs dinâmicas
- ✅ O `vercel.json` está configurado corretamente para SPA
- ✅ Todas as variáveis de ambiente são suportadas pela Vercel

## 📋 Passo a Passo para Deploy

### 1. Configurar Variáveis de Ambiente na Vercel

1. Acesse seu projeto na Vercel: https://vercel.com/dashboard
2. Vá em **Settings** > **Environment Variables**
3. Adicione todas as variáveis:

**Firebase:**
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
```

**Stripe:**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRICE_ID=price_...
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
```

4. Selecione os ambientes: **Production**, **Preview**, **Development**
5. Clique em **Save**

### 2. Configurar Payment Link do Stripe para Produção

**IMPORTANTE**: Você precisa atualizar as URLs do Payment Link para usar seu domínio da Vercel.

1. Acesse: https://dashboard.stripe.com/payment-links
2. Clique no seu Payment Link
3. Clique em **Editar** ou **Edit**
4. Configure as URLs de redirecionamento:
   - **URL de sucesso**: `https://seu-dominio.vercel.app/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - **URL de cancelamento**: `https://seu-dominio.vercel.app/checkout/cancel`
5. **Salve** as alterações

**Nota**: Se você tiver um domínio customizado, use esse domínio em vez de `.vercel.app`.

### 3. Fazer Deploy

#### Opção 1: Deploy Automático (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. A Vercel fará deploy automaticamente a cada push
3. Certifique-se de que as variáveis de ambiente estão configuradas

#### Opção 2: Deploy Manual

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### 4. Verificar se Funcionou

Após o deploy:

1. Acesse seu site na Vercel
2. Teste o fluxo de checkout:
   - Faça login
   - Acesse `/checkout`
   - Clique em "Assinar Agora"
   - Deve redirecionar para o Stripe
   - Após pagamento, deve voltar para `/checkout/success`
   - Deve redirecionar para a página inicial

## ⚠️ Checklist de Produção

Antes de ir para produção, verifique:

- [ ] Todas as variáveis de ambiente configuradas na Vercel
- [ ] Payment Link configurado com URLs de produção
- [ ] Domínio customizado configurado (se aplicável)
- [ ] Regras do Firestore publicadas
- [ ] Chaves do Stripe são de **produção** (`pk_live_...`)
- [ ] Payment Link é de **produção** (não teste)
- [ ] Testado o fluxo completo de pagamento

## 🔧 Configurações Adicionais

### Domínio Customizado

Se você tiver um domínio customizado:

1. Configure o domínio na Vercel
2. Atualize as URLs do Payment Link para usar seu domínio
3. Atualize as configurações do Firebase Auth (se necessário)

### Firebase Auth - Domínios Autorizados

1. Acesse: https://console.firebase.google.com
2. Vá em **Authentication** > **Settings** > **Authorized domains**
3. Adicione seu domínio da Vercel (ex: `seu-app.vercel.app`)
4. Se tiver domínio customizado, adicione também

## 🐛 Solução de Problemas

### Erro: "Payment Link não configurado"
- Verifique se `VITE_STRIPE_PAYMENT_LINK` está nas variáveis de ambiente da Vercel
- Certifique-se de que está no ambiente correto (Production)

### Erro: Redirecionamento não funciona
- Verifique se as URLs no Payment Link estão corretas
- Use `https://` (não `http://`)
- Certifique-se de que o domínio está correto

### Erro: Firebase não conecta
- Verifique se todas as variáveis do Firebase estão configuradas
- Verifique se o domínio está autorizado no Firebase Auth

### Erro: CORS no Firebase Functions
- Se estiver usando Firebase Functions, certifique-se de que está deployado
- Verifique se a região está correta

## 📝 Notas Importantes

1. **Variáveis de Ambiente**: A Vercel injeta as variáveis durante o build. Certifique-se de que todas estão configuradas.

2. **URLs Dinâmicas**: O código usa `window.location.origin`, então funciona automaticamente em qualquer domínio.

3. **Payment Link**: Você pode ter Payment Links diferentes para desenvolvimento e produção, ou usar o mesmo com URLs diferentes.

4. **HTTPS**: A Vercel fornece HTTPS automaticamente, então não há problemas de segurança.

5. **Build**: O build do Vite é otimizado automaticamente pela Vercel.

## 🚀 Após o Deploy

Após fazer deploy:

1. Teste o fluxo completo de pagamento
2. Verifique se os redirecionamentos funcionam
3. Teste em diferentes dispositivos
4. Monitore os logs da Vercel para erros

## 📚 Recursos

- [Documentação da Vercel](https://vercel.com/docs)
- [Variáveis de Ambiente na Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deploy de SPAs na Vercel](https://vercel.com/docs/concepts/deployments/static-deployments)
