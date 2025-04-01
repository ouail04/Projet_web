require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.static('public')); // Sert les fichiers statiques
app.use(express.json()); // Pour traiter les JSON

// Route pour récupérer une intention de paiement
app.post('/create-payment-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // Montant en centimes (ici 10,00 €)
      currency: 'eur', // Devise
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send("ERROR : ".error.message);
  }
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
