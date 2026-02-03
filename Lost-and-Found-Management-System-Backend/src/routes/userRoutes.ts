import  express  from 'express';
import { authenticateToken } from '../middlewares/auth';
import { getMyClaims } from '../controllers/claimController';

const router = express.Router();


router.use(authenticateToken as express.RequestHandler);
router.get("/my-claims",getMyClaims);

export default router;