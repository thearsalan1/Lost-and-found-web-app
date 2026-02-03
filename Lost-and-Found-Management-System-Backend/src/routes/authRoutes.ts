import { Router, Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "../Schemas/authSchema";
import { signup, login } from "../controllers/authController";

const router = Router();

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    signupSchema.parse(req.body);
    await signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    loginSchema.parse(req.body);
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;