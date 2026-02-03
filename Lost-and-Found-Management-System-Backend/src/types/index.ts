export interface IUser{
  _id:string;
  email:string;
  name:string;
  role:'user' | 'admin';
  phoneNumber?:string;
  isActive:boolean;
  createdAt:Date;
  updatedAt:Date;
}

export interface IItem{
  _id : string;
  title:string;
  description:string;
  category:string;
  status:'lost'|'found';
  postedBy:string;
  claimedBy?:string;
  itemStatus:'open'|'claimed'|'resolved';
  images:string[];
  createdAt:Date;
  updatedAt:Date;
  expiryDate:Date;
}

export interface IClaim{
  _id:string;
  itemId:string;
  claimedBy:string;
  status:'pending'|'approved'|'rejected';
  proof:string;
  approvedBy:string;
  comments?:string;
  createdAt:Date;
  resolvedAt?:Date;
}