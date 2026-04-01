import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const createAdSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  tiktok_url: z.string().url('Invalid TikTok URL').includes('tiktok.com', { message: 'Must be a TikTok URL' }),
  target_followers: z
    .number()
    .int()
    .min(10, 'Minimum 10 followers')
    .max(10000, 'Maximum 10,000 followers'),
});

export const submitFollowSchema = z.object({
  ad_id: z.string().uuid('Invalid ad ID'),
  screenshot_url: z.string().url('Invalid screenshot URL'),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const verificationActionSchema = z.object({
  follow_id: z.string().uuid('Invalid follow ID'),
  action: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type CreateAdInput = z.infer<typeof createAdSchema>;
export type SubmitFollowInput = z.infer<typeof submitFollowSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type VerificationActionInput = z.infer<typeof verificationActionSchema>;
