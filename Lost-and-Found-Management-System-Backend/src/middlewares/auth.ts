import { NextFunction, Request,Response } from "express"
import  jwt  from 'jsonwebtoken';
import User from "../models/User";

 export interface AuthRequest extends Request {
  user?:{
    id:string,
    email:string,
    role:'user'|'admin'
  };
}

export const authenticateToken = async(
  req:AuthRequest,
  res:Response,
  next:NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
      return res.status(401).json({
        success:false,
        error:{code:'NO_TOKEN',message:'Access token required'}
      })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET!)as any;
    const user = await User.findById(decoded.userId).select('-password')

    if(!user || !user.isActive){
      return res.status(401).json({
        success:false,
        error:{code:'INVALID_USER',message:"Invalid user"}
      });
    }

    req.user={
      id:user._id.toString(),
      email:user.email,
      role:user.role
    };
    next()
  } catch (error) {
    return res.status(401).json({
      success:false,
      error:{
        code:"INVALID_TOKEN",
        message:'Invalid or expired token'
      }
    })
  }
}

export const authroizeRole = (role:string[])=>{
  return (req:AuthRequest, res:Response, next:NextFunction)=>{
    if(!req.user || !role.includes(req.user.role)){
      return res.status(403).json({
        success:false,
        error:'FORBIDDEN',
        message:"Insufficient permissions"
      });
    }
    next();
  }
}