import { Request, Response } from 'express';
import Item from '../models/Item';
import Claim from '../models/Claim';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export const adminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalItems,
      lostItems,
      foundItems,
      pendingClaims,
      approvedClaims,
      resolvedItems,
      totalUsers,
      recentItems,
      recentClaims
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ status: 'lost' }),
      Item.countDocuments({ status: 'found' }),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'approved' }),
      Item.countDocuments({ itemStatus: 'resolved' }),
      User.countDocuments({ isActive: true }),
      Item.find()
        .populate('postedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Claim.find()
        .populate('itemId', 'title')
        .populate('claimedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Category stats
    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalItems,
          lostItems,
          foundItems,
          pendingClaims,
          approvedClaims,
          resolvedItems,
          totalUsers
        },
        recentItems,
        recentClaims,
        categoryStats,
        message: 'Admin dashboard data loaded'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DASHBOARD_ERROR', message: 'Failed to load dashboard' }
    });
  }
};
