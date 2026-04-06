import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { signupSchema, loginSchema, verifySchema } from '../Schemas/authSchema';
import { requestOtp, requestOtpForNewUser, verifyOtpAndLogin } from '../services/otpService';
import mongoose from 'mongoose';

export const signup = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'Email already registered' }
      });
    }

    const user = new User({
      email:       validatedData.email,
      name:        validatedData.name,
      phoneNumber: validatedData.phoneNumber,
      role:        'user',
      isActive:    true  // ← explicit, don't rely on schema default inside transaction
    });

    await user.save({ session });

    // ← use requestOtpForNewUser, passes user directly — no DB query
    await requestOtpForNewUser(user, user.email);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: {
        message: 'Account created. A login code has been sent to your email.',
        user: {
          email: user.email,
          name:  user.name,
          role:  user.role
        }
      }
    });

  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.errors }
      });
    }

    if (error.code === 'EAUTH' || error.code === 'ECONNECTION' || error.code === 'EMESSAGE') {
      return res.status(503).json({
        success: false,
        error: { code: 'EMAIL_FAILED', message: 'Failed to send login code. Please try again.' }
      });
    }

    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error' }
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = loginSchema.parse(req.body);

    await requestOtp(email); // silent if email not found

    return res.status(200).json({
      success: true,
      data: {
        message: 'If that email is registered, a login code has been sent'
      }
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to send login code' }
    });
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp } = verifySchema.parse(req.body);

    const result = await verifyOtpAndLogin(email, otp);

    if (result === 'expired') {
      return res.status(401).json({
        success: false,
        error: { code: 'OTP_EXPIRED', message: 'Code has expired, please request a new one' }
      });
    }

    if (result === 'max_attempts') {
      return res.status(429).json({
        success: false,
        error: { code: 'MAX_ATTEMPTS', message: 'Too many failed attempts, please request a new code' }
      });
    }

    if (result === 'invalid') {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Invalid or expired code' }
      });
    }

    const token = generateToken({
      userId: result._id.toString(),
      email:  result.email,
      role:   result.role
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id:    result._id,
          name:  result.name,
          email: result.email,
          role:  result.role
        }
      }
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
        }
      });
    }
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Verification failed' }
    });
  }
};