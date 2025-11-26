const Stripe = require('stripe');
const { stripe } = require('./env');

if (!stripe?.secretKey) {
  throw new Error('Stripe secret key is not configured.');
}

const stripeClient = new Stripe(stripe.secretKey, {
  apiVersion: '2024-06-20',
});

module.exports = {
  stripeClient,
};

