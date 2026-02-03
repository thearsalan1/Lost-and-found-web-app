import express, { Request, Response } from 'express';
import { authenticateToken, authroizeRole } from '../middlewares/auth'; 
import { adminDashboard } from '../controllers/adminController';
import Claim from '../models/Claim';
import { approveClaim, rejectClaim } from '../controllers/claimController';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

const router = express.Router();

// All admin routes require auth first
router.use(authenticateToken as express.RequestHandler);

// Then admin role ONLY
router.use(authroizeRole(['admin']) as express.RequestHandler);

router.get('/dashboard',adminDashboard);

router.get('/claim',async(req:AuthRequest,res:Response)=>{
  const claims = await Claim.find({ status: 'pending' })
    .populate('itemId', 'title status')
    .populate('claimedBy', 'name email')
    .lean();
  res.json({ success: true, data: claims });
})

router.put('/claims/:id/approve', approveClaim);
router.put('/claims/:id/reject', rejectClaim);
export default router;
