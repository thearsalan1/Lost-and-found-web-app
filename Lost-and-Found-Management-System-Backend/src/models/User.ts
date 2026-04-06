import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  email: string;
  name: string;
  role: 'user' | 'admin';
  phoneNumber?: string;
  isActive: boolean;
  otp?: {
    hash: string;
    expiresAt: Date;
    attempts: number;
  };
  setOtp(plainOtp: string): Promise<void>;
  verifyOtp(plainOtp: string): Promise<'valid' | 'invalid' | 'expired' | 'max_attempts'>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: {
    hash: { type: String, select: false },
    expiresAt: { type: Date, select: false },
    attempts: { type: Number, select: false, default: 0 }
  }
}, {
  timestamps: true
});

UserSchema.methods.setOtp = async function (plainOtp: string) {
  const salt = await bcrypt.genSalt(10);
  this.otp = {
    hash: await bcrypt.hash(plainOtp, salt),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    attempts: 0
  };
  await this.save();
};

UserSchema.methods.verifyOtp = async function (plainOtp: string) {
  if (!this.otp?.hash) return 'invalid';

  if (new Date() > this.otp.expiresAt) {
    this.otp = undefined;
    await this.save();
    return 'expired';
  }

  if (this.otp.attempts >= 3) {
    this.otp = undefined;
    await this.save();
    return 'max_attempts';
  }

  this.otp.attempts += 1;
  const valid = await bcrypt.compare(plainOtp, this.otp.hash);

  if (valid) {
    this.otp = undefined;
    await this.save();
    return 'valid';
  }

  await this.save();
  return 'invalid';
};

export default mongoose.model<IUserDocument>('User', UserSchema);