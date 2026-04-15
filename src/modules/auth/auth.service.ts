import prisma from '../../config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterInput, LoginInput, OTPInput, ResetPasswordInput } from './auth.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';
import authRepository from './auth.repository.js';
import { generateToken } from '../../utils/auth.js';
import settingsService from '../admin/settings.service.js';
import mailService from './mail.service.js';
import axios from 'axios';
import { getLocationFromIp, parseUserAgent } from '../../utils/location.util.js';

const googleClient = new OAuth2Client(process.env.APNAKHATA_GOOGLE_LOGIN_CLIENT_ID);

export class AuthService {
  /**
   * Register a new user and send verification OTP
   */
  async register(data: RegisterInput, ip?: string, userAgent?: string) {
    // Check if registration is enabled globally
    const isRegEnabled = await settingsService.isRegistrationEnabled();
    if (!isRegEnabled && data.email !== process.env.ADMIN_EMAIL) {
      throw new AppError('Public registration is currently disabled by the administrator.', 403);
    }

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
    await mailService.sendWelcomeEmail(user.email, user.name || 'User', otp, data.clientTimestamp);

    // Update Tracking Info (Registration)
    if (ip && userAgent) {
       this.updateUserTracking(user.id, ip, userAgent).catch(e => {});
    }

    const token = generateToken(user.id);
    return { 
      user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: (user as any).role, createdAt: user.createdAt }, 
      token 
    };
  }

  /**
   * Authenticate a user
   */
  async login(data: LoginInput & { ip?: string, userAgent?: string }) {
    const user = await authRepository.findByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password || ''))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const token = generateToken(user.id);
    
    // Update Tracking Info
    if (data.ip && data.userAgent) {
      this.updateUserTracking(user.id, data.ip, data.userAgent).catch(e => {});
    }

    // Audit Login if Admin/Moderator
    if (user.role === 'ADMIN' || (user as any).role === 'MODERATOR') {
      import('../admin/audit.service.js').then(m => {
        m.default.log(user.id, 'STAFF_LOGIN', undefined, { ip: data.email }); 
      }).catch(err => { /* Audit log failed silently in production */ });
    }

    return { 
      user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: (user as any).role, createdAt: user.createdAt }, 
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
      user: { id: user.id, email: user.email, name: user.name, isVerified: true, role: (user as any).role, createdAt: user.createdAt },
      token 
    };
  }

  /**
   * Resend verification OTP
   */
  async resendOTP(email: string, clientTimestamp?: string) {
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

    await mailService.sendVerificationOTP(user.email, otp, clientTimestamp);

    return { message: 'New verification code sent' };
  }

  /**
   * Initiate password reset with OTP
   */
  async forgotPassword(email: string, clientTimestamp?: string) {
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

    await mailService.sendPasswordResetOTP(user.email, user.name || 'User', otp, clientTimestamp);

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
  async googleLogin(googleToken: string, ip?: string, userAgent?: string) {
    try {
      let payload;

      // Check if it's a JWT (idToken - 3 segments) or opaque (accessToken - typically ya29... format)
      if (googleToken.split('.').length === 3) {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleToken,
          audience: process.env.APNAKHATA_GOOGLE_LOGIN_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        // Fetch profile using accessToken
        try {
          const response = await axios.get(process.env.APNAKHATA_GOOGLE_LOGIN_USERINFO_URL || 'https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleToken}` }
          });
          payload = response.data;
        } catch (axiosError: any) {
          throw new AppError(`Google verification failed: ${axiosError.response?.data?.error_description || axiosError.message}`, 401);
          throw new AppError(`Google verification failed: ${axiosError.response?.data?.error_description || axiosError.message}`, 401);
        }
      }

      if (!payload || (!payload.email && !payload.email_verified)) {
        throw new AppError('Invalid Google token: Email not provided or verified', 400);
      }

      const { email, name, sub: googleId, picture: image } = payload;

      // 1. Check if user already exists
      let user = await authRepository.findByEmail(email);

      if (user) {
        // Rule: Existing standard users cannot login with Google if they didn't sign up with it
        if (!user.googleId) {
          throw new AppError('This email is registered with a password. Please login using your email and password.', 403);
        }

        if (!user.isActive) {
          throw new AppError('Your account has been deactivated. Please contact support.', 403);
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
        // Check if registration is enabled globally
        const isRegEnabled = await settingsService.isRegistrationEnabled();
        if (!isRegEnabled && email !== process.env.ADMIN_EMAIL) {
          throw new AppError('Public registration is currently disabled by the administrator.', 403);
        }

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

        // The Hybrid Category model allows access to shared global categories automatically.
      }

      const token = generateToken(user.id);

      // Update Tracking Info
      if (ip && userAgent) {
        this.updateUserTracking(user.id, ip, userAgent).catch(e => {});
      }

      // Audit Login if Admin/Moderator
      if (user.role === 'ADMIN' || (user as any).role === 'MODERATOR') {
        import('../admin/audit.service.js').then(m => {
          m.default.log(user!.id, 'STAFF_LOGIN', undefined, { provider: 'google', email: user!.email });
        }).catch(err => { /* Audit log failed silently in production */ });
      }

      return { 
        user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified, role: user.role, createdAt: user.createdAt }, 
        token 
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Google authentication failed', 401, error);
    }
  }

  /**
   * Request self-deletion (30 days grace period)
   */
  async requestSelfDeletion(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletionScheduledAt: deletionDate,
        deletionRequestedBy: user.role
      }
    });

    // Audit self-deletion
    import('../admin/audit.service.js').then(m => {
      m.default.log(userId, 'USER_REQUESTED_DELETION', userId, { deletionDate });
    }).catch(err => { /* Audit log failed silently in production */ });

    return updatedUser;
  }

  /**
   * Helper to update user tracking information
   */
  private async updateUserTracking(userId: string, ip: string, userAgent: string) {
    const location = await getLocationFromIp(ip);
    const device = parseUserAgent(userAgent);

    const modelStr = device.model ? ` (${device.vendor ? `${device.vendor} ` : ''}${device.model})` : '';
    
    await authRepository.update(userId, {
      lastIp: ip,
      lastUserAgent: userAgent,
      lastLocation: location ? `${location.city}, ${location.country}` : 'Unknown',
      lastDevice: `${device.browser} on ${device.os}${modelStr}`,
      metadata: location || {}
    });
  }
}

export default new AuthService();
