import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterInput, LoginInput, OTPInput, ResetPasswordInput } from './auth.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';
import authRepository from './auth.repository.js';
import { generateToken } from '../../utils/auth.js';
import mailService from './mail.service.js';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.CLIENT_ID);

export class AuthService {
  /**
   * Register a new user and send verification OTP
   */
  async register(data: RegisterInput) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('A user with this email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    const role = data.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER';

    const user = await authRepository.create({
      ...data,
      passwordHash,
      verificationToken: otp,
      verificationExpiry: otpExpiry,
      role
    });

    // Send Welcome Email with OTP
    await mailService.sendWelcomeEmail(user.email, user.name || 'User', otp);

    const token = generateToken(user.id);
    return { 
      user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: (user as any).role }, 
      token 
    };
  }

  /**
   * Authenticate a user
   */
  async login(data: LoginInput) {
    const user = await authRepository.findByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password || ''))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user.id);
    
    return { 
      user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: (user as any).role }, 
      token 
    };
  }

  /**
   * Verify OTP for email verification
   */
  async verifyOTP(data: OTPInput) {
    const user = await authRepository.findByEmail(data.email);

    if (!user || user.verificationToken !== data.otp) {
      throw new AppError('Invalid verification code', 400);
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      throw new AppError('Verification code has expired', 400);
    }

    await authRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationExpiry: null
    });

    const updatedUser = await authRepository.findById(user.id);
    const token = generateToken(user.id);

    return { 
      message: 'Email verified successfully',
      user: { id: user.id, email: user.email, name: user.name, isVerified: true, role: (user as any).role },
      token 
    };
  }

  /**
   * Resend verification OTP
   */
  async resendOTP(email: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60000);

    await authRepository.update(user.id, {
      verificationToken: otp,
      verificationExpiry: otpExpiry
    });

    await mailService.sendVerificationOTP(user.email, otp);

    return { message: 'New verification code sent' };
  }

  /**
   * Initiate password reset with OTP
   */
  async forgotPassword(email: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists for security, just return success
      return { message: 'If an account exists, a reset code has been sent' };
    }

    // Generate 6-digit numeric OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    await authRepository.update(user.id, {
      resetToken: otp,
      resetExpiry
    });

    await mailService.sendPasswordResetOTP(user.email, otp);

    return { message: 'Password reset code sent to your email' };
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(data: ResetPasswordInput) {
    const user = await authRepository.findByEmail(data.email);

    if (!user || user.resetToken !== data.otp) {
      throw new AppError('Invalid or expired reset code', 400);
    }

    if (user.resetExpiry && user.resetExpiry < new Date()) {
      throw new AppError('Reset code has expired', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await authRepository.update(user.id, {
      password: passwordHash,
      resetToken: null,
      resetExpiry: null
    });

    return { message: 'Password reset successfully. You can now log in.' };
  }

  /**
   * Handle Google OAuth Login
   */
  async googleLogin(googleToken: string) {
    try {
      let payload;

      // Check if it's a JWT (idToken) or opaque (accessToken)
      if (googleToken.includes('.')) {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleToken,
          audience: process.env.CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        // Fetch profile using accessToken
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${googleToken}` }
        });
        payload = response.data;
      }

      if (!payload || !payload.email) {
        throw new AppError('Invalid Google token', 400);
      }

      const { email, name, sub: googleId, picture: image } = payload;

      // 1. Check if user already exists
      let user = await authRepository.findByEmail(email);

      if (user) {
        // Rule: Existing standard users cannot login with Google if they didn't sign up with it
        if (!user.googleId) {
          throw new AppError('This email is registered with a password. Please login using your email and password.', 403);
        }
        
        // Update Google ID if it changed or was empty for some reason
        if (user.googleId !== googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId }
          });
        }
      } else {
        // 2. Create new Google user
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            googleId,
            image,
            isVerified: true, // Auto-verify Google users no need to send emails
            role: email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
            baseCurrency: 'PKR', // Default
          }
        });

        // Initialize default categories for new Google users
        const systemCategories = await prisma.category.findMany({ where: { isSystem: true } });
        if (systemCategories.length > 0) {
          await prisma.category.createMany({
            data: systemCategories.map((cat: { name: string; icon: string | null }) => ({
              name: cat.name,
              icon: cat.icon,
              userId: user!.id,
              isSystem: false
            }))
          });
        }
      }

      const token = generateToken(user.id);
      return { 
        user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: user.role }, 
        token 
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Google authentication failed', 401);
    }
  }
}

export default new AuthService();
