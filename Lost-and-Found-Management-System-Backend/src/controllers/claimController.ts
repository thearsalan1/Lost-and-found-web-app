import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Item from "../models/Item";
import Claim from "../models/Claim";
import mongoose from "mongoose";
import { sendEmailClaim } from "../services/otpService";
import User from "../models/User";

interface ClaimRequest extends AuthRequest {
  body: {
    proof: string;
  };
}

export const submitClaim = async (req: ClaimRequest, res: Response) => {
  try {
    const { id } = req.params;
    const itemId = Array.isArray(id) ? id[0] : id;
    const { proof } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid item ID format" },
      });
    }

    const itemsObjectId = new mongoose.Types.ObjectId(itemId);

    const item = await Item.findById(itemsObjectId);

    const claims = await Claim.find({ itemId, claimedBy: req.user?.id });
    console.log(claims);
    if (claims.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "CAN'T_CLAIM_TWICE",
          message: "Can not claim same item twice",
        },
      });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: "ITEM_NOT_FOUND", message: "Item not found" },
      });
    }

    if (item.itemStatus !== "open") {
      return res.status(400).json({
        success: false,
        error: { code: "ITEM_NOT_OPEN", message: "Item not open for claims" },
      });
    }

    if (item.postedBy.toString() === req.user!.id) {
      return res.status(400).json({
        success: false,
        error: { code: "OWN_ITEM", message: "Cannot claim own item" },
      });
    }

    if (!proof || !proof.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_PROOF", message: "Proof is required" },
      });
    }

    // Create and save the claim
    const claim = new Claim({
      itemId: itemsObjectId,
      claimedBy: new mongoose.Types.ObjectId(req.user!.id),
      proof,
      status: "pending",
    });

    await claim.save();

    res.status(201).json({
      success: true,
      data: {
        claimId: claim._id,
        message: "Claim submitted successfully. Waiting for admin approval.",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to submit claim",
        details: error instanceof Error ? error.message : String(error),
      },
    });
  }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const claimId = Array.isArray(id) ? id[0] : id;

    const { comments } = req.body;

    const claimObjectId = new mongoose.Types.ObjectId(claimId);
    const claim = await Claim.findById(claimObjectId);
    const user = await User.findById(req.user?.id);
    const item = await Item.findById(claim?.itemId);

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid claim ID format" },
      });
    }

    if (!claim || claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: { code: "INVLALID_CLAIM", message: "Cannot approve this claim" },
      });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: "ITEM_NOT_FOUND", message: "Item not found" },
      });
    }

    claim.status = "approved";
    claim.approvedBy = new mongoose.Types.ObjectId(req.user!.id);
    claim.comments = comments;
    claim.resolvedAt = new Date();
    await claim.save();

    await Item.findByIdAndUpdate(claim.itemId, {
      claimedBy: claim.claimedBy,
      itemStatus: "resolved",
    });

    if (user) {
      sendEmailClaim(
        user.name,
        item.title,
        "approved",
        "Your proof is valid your are thr verified owner of item",
        user._id.toString(),
      );
    }

    res.json({
      success: true,
      message: "Claim approved successfully",
      data: { claimId: claim._id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "APPROVE_ERROR", message: "Failed to approve claim" },
    });
  }
};

export const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const claimId = Array.isArray(id) ? id[0] : id;

    const { comments } = req.body;

    const claimObjectId = new mongoose.Types.ObjectId(claimId);
    const claim = await Claim.findById(claimObjectId);
    const user = await User.findById(req.user?.id);
    const item = await Item.findById(claim?.itemId);

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid claim ID format" },
      });
    }

    if (!claim || claim.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CLAIM", message: "Cannot reject this claim" },
      });
    }

    claim.status = "rejected";
    claim.approvedBy = new mongoose.Types.ObjectId(req.user!.id);
    claim.comments = comments;
    claim.resolvedAt = new Date();
    await claim.save();

    if (user && item) {
      sendEmailClaim(
        user.name,
        item.title,
        "rejected",
        "Sorry we found that your proof is not valid with the item",
        user._id.toString(),
      );
    }

    res.status(200).json({
      success: true,
      data: {
        claimId: claim._id,
      },
      message: "Claim rejected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "REJECT_ERROR", message: "Failed to reject claim" },
    });
  }
};

export const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      });
    }

    const claims = await Claim.find({ claimedBy: req.user.id })
      .populate({
        path: "itemId",
        select: "title status category phoneNo reporterName UserId images",
      })
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: claims });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: { code: "MY_CLAIMS_ERROR", message: "Failed to fetch claims" },
    });
  }
};
