import { Request,Response } from "express";
import { AuthRequest } from '../middlewares/auth';
import Item from "../models/Item";
import Claim from "../models/Claim";
import mongoose from "mongoose";

interface ClaimRequest extends AuthRequest{
  body:{
    proof:string;
  }
}

export const submitClaim = async(req:ClaimRequest,res:Response)=>{
  try {
    const { id } = req.params;
    const itemId = Array.isArray(id) ? id[0] : id;
    const {proof} = req.body;

    const itemsObjectId = new mongoose.Types.ObjectId(itemId)

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid item ID format" }
      });
    }

    const item = await Item.findOne({_id:itemsObjectId,itemStatus:'open'});
    if(!item){
      return res.status(400).json({
        success:false,
        error:{code:"INVALID_ITEM",message:"Item not open for claims"}
      })
    }

    if(item.postedBy.toString()===req.user!.id){
      return res.status(400).json({
        success:false,
        error:{code:"OWN_ITEM",message:"Can not claim own item"}
      })
    }

    const claim = new Claim({
      itemId:itemsObjectId,
      claimedBy:new mongoose.Types.ObjectId(req.user!.id),
      proof,
      status:'pending'
    });

    await claim.save();

    res.status(201).json({
      success:true,
      data:{
        claimId:claim._id,
        message:"Cliam submitted successfully. Waiting for admin approval."
      }
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      error:{code:"SERVER_ERROR",message:"Failed to submit claim"}
    })
  }
}

export const approveClaim = async(req:AuthRequest,res:Response)=>{
  try {
    const { id } = req.params;
const claimId = Array.isArray(id) ? id[0] : id;

    const {comments} = req.body;

    const claimObjectId = new mongoose.Types.ObjectId(claimId)
    const claim = await Claim.findById(claimObjectId);

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid claim ID format" }
      });
    }

    if(!claim || claim.status!=='pending'){
      return res.status(400).json({
        success:false,
        error:{code:"INVLALID_CLAIM",message:"Cannot approve this claim"}
      })
    }

    claim.status='approved';
    claim.approvedBy=new mongoose.Types.ObjectId(req.user!.id);
    claim.comments=comments;
    claim.resolvedAt=new Date();
    await claim.save();

    await Item.findByIdAndUpdate(claim.itemId,{claimedBy:claim.claimedBy,itemStatus:'resolved'})

    res.json({
      success: true,
      message: 'Claim approved successfully',
      data: { claimId: claim._id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'APPROVE_ERROR', message: 'Failed to approve claim' }
    });
  }
}

export const rejectClaim = async (req:AuthRequest,res:Response)=>{
  try {
    const { id } = req.params;
const claimId = Array.isArray(id) ? id[0] : id;

    const {comments}= req.body;  
    
     const claimObjectId = new mongoose.Types.ObjectId(claimId);
    const claim = await Claim.findById(claimObjectId);

    if (!mongoose.Types.ObjectId.isValid(claimId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_ID", message: "Invalid claim ID format" }
      });
    }

    if(!claim || claim.status !=='pending'){
      return res.status(400).json({
         success: false,
        error: { code: 'INVALID_CLAIM', message: 'Cannot reject this claim' }
      })
    }

    claim.status= 'rejected';
    claim.approvedBy=new mongoose.Types.ObjectId(req.user!.id);
    claim.comments=comments;
    claim.resolvedAt=new Date();
    await claim.save();

    res.status(200).json({
      success:true,
      data:{
        claimId:claim._id
      },
      message:"Claim rejected"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'REJECT_ERROR', message: 'Failed to reject claim' }
    });
  }
}

export const getMyClaims = async (req:AuthRequest,res:Response)=>{
  try {
     const claims = await Claim.find({ 
      claimedBy: req.user!.id
    })
    .populate("itemId","title status category")
    .populate("approvedBy","name email")
    .sort({createdAt:-1})
    .lean();

    res.json({
      success:true,
      data:claims
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'MY_CLAIMS_ERROR', message: 'Failed to fetch claims' }
    });
  }
}