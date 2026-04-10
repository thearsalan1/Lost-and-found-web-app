import crypto from 'crypto';
import User, { IUserDocument } from '../models/User';
import { LoginTemplate } from '../template/EmailTemplate';
import { sendLoginOtp } from '../utils/resend';

function generateOtp(): number {
  return crypto.randomInt(100_000, 999_999);
}

async function sendOtpToUser(user: IUserDocument, email: string): Promise<void> {
  const otp = generateOtp();
  await user.setOtp(String(otp));
  await sendLoginOtp(email, 'Your Back2u login code', LoginTemplate(otp));
}

export async function requestOtp(email: string): Promise<void> {
  const user = await User.findOne({ email, isActive: true })
    .select('+otp.hash +otp.expiresAt +otp.attempts');

  if (!user) return;
  await sendOtpToUser(user, email);
}

export async function requestOtpForNewUser(user: IUserDocument, email: string): Promise<void> {
  await sendOtpToUser(user, email);
}

export async function verifyOtpAndLogin(
  email: string,
  plainOtp: string
): Promise<IUserDocument | 'invalid' | 'expired' | 'max_attempts'> {
  const user = await User.findOne({ email, isActive: true })
    .select('+otp.hash +otp.expiresAt +otp.attempts');

  if (!user) return 'invalid';

  const result = await user.verifyOtp(plainOtp);
  if (result !== 'valid') return result;

  return user;
}