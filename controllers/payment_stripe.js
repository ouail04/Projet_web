require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaiementStripe {
    static async paiementStripe(amount, currency = 'eur') {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount, // Montant en centimes (ex: 1000 = 10,00 €)
                currency: currency,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
    
            return {
                success: true,
                clientSecret: paymentIntent.client_secret
            };
        } catch (error) {
            console.error("Erreur Stripe:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = PaiementStripe;