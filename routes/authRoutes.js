import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../contollers/authController.js";
import {
  createPost,
  editPost,
  getAllPosts,
  deletePost,
} from "../contollers/postController.js";
import { protectedApi } from "../middlewares/auth.js";

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

router.post("/create-post", protectedApi, createPost);
router.get("/posts", protectedApi, getAllPosts);
router.put("/edit-post/:id", protectedApi, editPost);
router.delete("/delete-post/:id", protectedApi, deletePost);

export default router;
