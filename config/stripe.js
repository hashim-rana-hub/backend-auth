import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// quick sanity check, delete after
stripe.products.list().then(console.log);

export default stripe;
