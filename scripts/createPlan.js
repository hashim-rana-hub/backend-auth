// scripts/createPlans.js
import stripe from "../config/stripe.js";
import dotenv from "dotenv";
dotenv.config();

async function createPlans() {
  const product = await stripe.products.create({ name: "Pro Plan" });

  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: "usd",
    recurring: { interval: "month" },
  });

  console.log("Product ID:", product.id);
  console.log("Price ID:", monthly.id);
}

createPlans().catch(console.error);
// quick check
stripe.prices.list({ limit: 5 }).then((r) => console.log(r.data));
