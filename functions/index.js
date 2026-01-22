const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

/**
 * Cria uma sessão de checkout do Stripe (Callable Function)
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Usuário não autenticado"
    );
  }

  const { priceId, successUrl, cancelUrl, customerEmail, origin } = data;

  if (!priceId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "priceId é obrigatório"
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      customer_email: customerEmail || context.auth.token.email,
      client_reference_id: context.auth.uid,
      metadata: {
        userId: context.auth.uid,
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Erro ao criar sessão de checkout",
      error.message
    );
  }
});

/**
 * Cria uma sessão de checkout do Stripe (HTTP Function com CORS)
 * Alternativa caso a callable function não funcione
 */
exports.createCheckoutSessionHttp = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    // Verifica se é POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    // Verifica autenticação via token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const { priceId, successUrl, cancelUrl, customerEmail, origin } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: "priceId é obrigatório" });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/checkout/cancel`,
        customer_email: customerEmail || decodedToken.email,
        client_reference_id: decodedToken.uid,
        metadata: {
          userId: decodedToken.uid,
        },
      });

      return res.status(200).json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
