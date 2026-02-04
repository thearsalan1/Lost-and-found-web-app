import express, { Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middlewares/auth";
import { createItem, deleteItem, getItem, getItemById, updateitem } from "../controllers/itemsController";
import { createItemSchema } from "../Schemas/authSchema";
import { submitClaim } from "../controllers/claimController";
import { upload } from "../middlewares/multer";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "user" | "admin";
  };
}

const router = express.Router();

// Public: Get all items (with filter)
router.get("/", getItem);

// Public: Get single item
router.get("/:id", getItemById);

// Protected: Auth middleware
router.use(authenticateToken as express.RequestHandler);

// Create item (user only)
router.post("/",upload.single("image"), (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    createItemSchema.parse(req.body);
    createItem(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/:id/claim", submitClaim);
router.put("/:id", updateitem);
router.delete("/:id", deleteItem);

export default router;