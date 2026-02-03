import { Request,Response } from "express";
import User from "../models/User";
import {generateToken} from '../utils/jwt'
import { signupSchema, loginSchema } from "../Schemas/authSchema"

export const signup = async (req:Request,res:Response)=>{
  try {
    // Zod validation
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await User.findOne({email:validatedData.email});
    if(existingUser){
      return res.status(409).json({
        success:false,
        error:{code:'USER_EXISTS',message:'Email already registered'}
      });
    }
    
    const user = new User({
      email:validatedData.email,
      password:validatedData.password,
      name:validatedData.name,
      phoneNumber:validatedData.phoneNumber,
      role:'user'
    })

    await user.save();

    const token = generateToken({
      userId:user._id.toString(),
      email:user.email,
      role:user.role
    });

    res.status(201).json({
      success:true,
      data:{
        token,
        user:{
          email:user.email,
          name:user.name,
          role:user.role
        }
      }
    });
  } catch (error:any) {
    if(error.name==='ZodError'){
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
        }
      })
    }
    res.status(500).json({
      success:false,
      error:{code:"SERVER_ERROR",message:"Server error"}
    })
  }
}

export const login = async (req:Request,res:Response)=>{
  try {
    // zod validation
    const validatedData= loginSchema.parse(req.body);

    // Finding user

    const user= await User.findOne({email:validatedData.email});

    if(!user){
      return res.status(401).json({
        success:false,
        error:{code:'INVALID_CREDENTIALS',message:'Invalid credentials'}
      });
    }

    const isPasswordValid = await user.comparePassword(validatedData.password);
    if(!isPasswordValid){
      return res.status(401).json({
        success:false,
        error:{code:'INVALID_CREDENTIALS',message:'Invalid credentials'}
      })
    }

    const token = generateToken({
      userId:user._id.toString(),
      email:user.email,
      role:user.role
    })

    res.json({
      success:true,
      data:{
        token,
        user:{
          id:user._id,
          email:user.email,
          name:user.name,
          role:user.role
        }
      }
    });
  } catch (error:any) {
    if(error.name === 'ZodError'){
      return res.status(400).json({
        success:false,
        error:{
          code:"VALIDATION_ERROR",
          message:"validation error",
          details:error.errors
        }
      })
    }
    res.status(500).json({
      success:false,
      error:{
        code:"Server error",
        message:"Internal server error"
      }
    })
  }
}

