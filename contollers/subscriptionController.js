import stripe from "../config/stripe.js";
import User from "../models/User.js";

// Add it here, at the top of the file, before any function definitions
const PLAN_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
};

// console.log(
//   "CLIENT_URL:",
//   process.env.CLIENT_URL,
//   "STRIPE_PRICE_MONTHLY:",
//   process.env.STRIPE_PRICE_MONTHLY,
// );

const createSubscriptionCheckout = async (req, res) => {
  try {
    console.log(
      "Req body in createSubscriptionCheckout:",
      req.body,
      " req.user:",
      req.user,
    );
    const { plan } = req.body;
    if (!PLAN_PRICES[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const user = await User.findById(req.user.id);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: PLAN_PRICES[plan], quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    res.status(500).json({ message: "Failed to create subscription session" });
  }
};

export { createSubscriptionCheckout };
