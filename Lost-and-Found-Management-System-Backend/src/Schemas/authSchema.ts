import z from "zod";

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional()
}).refine((data) => /[a-z]/.test(data.password), {
  message: 'Password must contain at least one letter',
  path: ['password']
}).refine((data) => /[0-9]/.test(data.password), {
  message: 'Password must contain at least one number',
  path: ['password']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1)
});

// Add to existing authSchemas.ts
export const createItemSchema = z.object({
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
  status: z.enum(['lost', 'found']),
  images: z.array(z.string().url().optional()).max(5).default([])
});
