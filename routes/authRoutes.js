import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../contollers/authController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth API is running" });
});

// User registration route
router.post("/register", registerUser);
// User login route
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
