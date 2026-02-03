import mongoose, { Document, Schema } from "mongoose";

export interface IItemDocument extends Document{
  title:string;
  description:string;
  category:string;
  status:'lost' | 'found';
  postedBy:mongoose.Types.ObjectId;
  claimedBy:mongoose.Types.ObjectId;
  itemStatus:'open'|'claimed'|'resolved';
  images:string[];
  expiryDate:Date;
}

const ItemSchema:Schema = new Schema({
  title:{
    type:String,
    required:true,
    trim:true,
  },
  description:{
    type:String,
    required:true,
  },
  category:{
    type:String,
    required:true,
    enum:['electronics','documents','clothing','jewellery','keys','wallet','bag','other']
  },
  status:{
    type:String,
    required:true,
    enum:['lost','found']
  },
  postedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    index:true
  },
  claimedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User', 
  },
  itemStatus:{
    type:String,
    enum:['open','claimed','resolved'],
    default:'open'
  },
  images:[{
    type:String,
    default:[],
  }],
  expiryDate:{
    type:Date,
    default:()=>new Date(Date.now()+ 30 * 24 * 60 * 60 * 1000)
  }
},{
  timestamps:true
})

// Indexes for performance
ItemSchema.index({ status: 1, itemStatus: 1 });
ItemSchema.index({ postedBy: 1 });
ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ expiryDate: 1 });

export default mongoose.model<IItemDocument>('Item',ItemSchema)