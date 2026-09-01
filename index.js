import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import { createSubscriptionCheckout } from "./contollers/subscriptionController.js";
import { protectedApi } from "./middlewares/auth.js";

dotenv.config();

const app = express();
app.use("/api/payments", webhookRoutes);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", protectedApi, createSubscriptionCheckout);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Monitor connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
