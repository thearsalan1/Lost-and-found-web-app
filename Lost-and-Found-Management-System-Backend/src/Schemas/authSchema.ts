// schemas/authSchema.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
});

export const verifySchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must be numeric')
});

// Add to existing authSchemas.ts
export const createItemSchema = z.object({
  UserId:z.string(),
  title: z.string().min(3, 'Title too short').max(100, 'Title too long'),
  description: z.string().min(10, 'Description too short').max(1000),
  category: z.enum([
    'electronics', 
    'documents', 
    'clothing', 
    'jewelry', 
    'keys', 
    'wallet', 
    'bag', 
    'other'
  ]),
  status: z.enum(['lost', 'found']).default('lost'),
  images: z.array(z.string().url().optional()).max(5).default([]),
  phoneNo: z.string().length(10,'Phone number must be 10 digits'),
  reporterName:z.string().min(3)
});
