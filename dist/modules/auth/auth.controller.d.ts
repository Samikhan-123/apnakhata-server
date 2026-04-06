import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    /**
     * Register a new user
     */
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Authenticate user
     */
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Google OAuth Login
     */
    googleLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify email via OTP
     */
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Resend verification OTP
     */
    resendOTP(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Request password reset link
     */
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Reset password using token
     */
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get current authenticated user profile
     */
    getMe(req: any, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
