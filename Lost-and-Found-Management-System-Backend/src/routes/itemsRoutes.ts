// src/routes/itemRoutes.ts - FIXED VERSION
import express, { Request, Response } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { createItem, deleteItem, getItem, getItemById, updateitem } from '../controllers/itemsController';
import { createItemSchema } from '../Schemas/authSchema';
import { submitClaim } from '../controllers/claimController';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

const router = express.Router();

// Public: Get all items (with filter)
router.get('/',getItem);

// Public: Get single item
router.get('/:id', getItemById);

// Protected: Auth middleware
router.use(authenticateToken as express.RequestHandler);

// Create item (user only)
router.post('/', (req: AuthRequest, res,next) => {
  try {
    createItemSchema.parse(req.body);
    createItem(req,res);
  } catch (error) {
    console.error(error);
    
  }
});

router.post("/:id/claim",submitClaim)

router.put('/:id', updateitem);
router.delete('/:id', deleteItem);

export default router;
