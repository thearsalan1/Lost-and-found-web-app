import mongoose, { Document, Schema } from "mongoose";

export interface IClaimDocument extends Document{
  itemId:mongoose.Types.ObjectId;
  claimedBy:mongoose.Types.ObjectId;
  status:'pending' | 'approved' | 'rejected';
  proof:string;
  approvedBy?:mongoose.Types.ObjectId;
  comments?:string;
  resolvedAt?:Date;
}

const ClaimSchema:Schema = new Schema({
  itemId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Item',
    required:true,
    index:true
  },
  claimedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    index:true,
  },
  status:{
    type:String,
    enum:['pending','approved','rejected'],
    default:'pending',
  },
  proof:{
    type:String,
    required:[true, 'Proof required'],
    minlength:50,
    maxlength:500,
  },
  approvedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
  },
  comments:{
    type:String,
    maxlength:1000
  },
  resolvedAt:{
    type:Date
  },
},{
  timestamps:true
})

ClaimSchema.index({ itemId: 1, status: 1 });
ClaimSchema.index({ claimedBy: 1 });

export default mongoose.model<IClaimDocument>('Claim',ClaimSchema)