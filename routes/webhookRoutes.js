// routes/webhookRoutes.js
import stripe from "../config/stripe.js";
import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Received event:", event.type);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          if (session.mode === "subscription") {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription,
            );

            await User.findByIdAndUpdate(session.metadata.userId, {
              stripeCustomerId: session.customer,
              "subscription.status": subscription.status,
              "subscription.plan": session.metadata.plan,
              "subscription.stripeSubscriptionId": subscription.id,
              "subscription.currentPeriodEnd": new Date(
                subscription.current_period_end * 1000,
              ),
            });

            console.log(
              `✅ Subscription activated for user ${session.metadata.userId}`,
            );
          }
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription,
            );

            await User.findOneAndUpdate(
              { "subscription.stripeSubscriptionId": subscription.id },
              {
                "subscription.status": "active",
                "subscription.currentPeriodEnd": new Date(
                  subscription.current_period_end * 1000,
                ),
              },
            );

            console.log(
              `✅ Renewal succeeded for subscription ${subscription.id}`,
            );
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;

          await User.findOneAndUpdate(
            { "subscription.stripeSubscriptionId": invoice.subscription },
            { "subscription.status": "past_due" },
          );

          console.log(
            `⚠️ Payment failed for subscription ${invoice.subscription}`,
          );
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;

          await User.findOneAndUpdate(
            { "subscription.stripeSubscriptionId": subscription.id },
            {
              "subscription.status": subscription.status,
              "subscription.currentPeriodEnd": new Date(
                subscription.current_period_end * 1000,
              ),
            },
          );
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;

          await User.findOneAndUpdate(
            { "subscription.stripeSubscriptionId": subscription.id },
            {
              "subscription.status": "canceled",
              "subscription.plan": "free",
            },
          );

          console.log(`❌ Subscription canceled: ${subscription.id}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error("Error processing webhook event:", err);
      // Still return 200 so Stripe doesn't endlessly retry on a DB hiccup you've already logged
      // (only return non-200 for actual signature/verification failures, handled above)
    }

    res.status(200).json({ received: true });
  },
);

export default router;
