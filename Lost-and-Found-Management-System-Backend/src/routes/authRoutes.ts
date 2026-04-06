import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, verifyLogin } from '../controllers/authController';

const router = Router();


router.post('/signup', signup);
router.post('/login', login);
router.post('/verify',  verifyLogin);

export default router;