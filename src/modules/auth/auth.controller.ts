import { Request, Response, NextFunction } from 'express';
import authService from './auth.service.js';
import { 
  registerSchema, 
  loginSchema, 
  otpSchema, 
  emailSchema, 
  resetPasswordSchema 
} from './auth.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export class AuthController {
  /**
   * Register a new user 
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { user, token } = await authService.register(validatedData);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(201).json({
        success: true,
        message: 'Account created! Please check your email for the verification code.',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { user, token } = await authService.login(validatedData);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        message: 'Welcome back!',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google OAuth Login
   */
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        throw new AppError('ID Token is required', 400);
      }
      const { user, token } = await authService.googleLogin(idToken);

      res.cookie('token', token, COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        message: 'Google login successful!',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    res.clearCookie('token', {
      ...COOKIE_OPTIONS,
      maxAge: 0
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  /**
   * Verify email via OTP
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = otpSchema.parse(req.body);
      const result = await authService.verifyOTP(validatedData);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend verification OTP
   */
  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = emailSchema.parse(req.body);
      const result = await authService.resendOTP(email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset link
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = emailSchema.parse(req.body);
      const result = await authService.forgotPassword(email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await authService.resetPassword(validatedData);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getMe(req: any, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
