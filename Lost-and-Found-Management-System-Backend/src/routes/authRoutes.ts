import express from "express";
import { signupSchema, loginSchema } from "../Schemas/authSchema";
import { signup, login } from "../controllers/authController";

const router = express.Router();

// Post /api/auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    signupSchema.parse(req.body);
    await signup(req, res);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
