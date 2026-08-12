import express from "express";
import { loginUser, registerUser } from "../contollers/authController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Auth API is running" });
});

// User registration route
router.post("/register", registerUser);
// User login route
router.post("/login", loginUser);

export default router;
