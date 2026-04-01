import authService from './auth.service.js';
import { registerSchema, loginSchema, otpSchema, emailSchema, resetPasswordSchema } from './auth.validation.js';
import { AppError } from '../../middlewares/error.middleware.js';
export class AuthController {
    /**
     * Register a new user
     */
    async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);
            const { user, token } = await authService.register(validatedData);
            res.status(201).json({
                success: true,
                message: 'Account created! Please check your email for the verification code.',
                user,
                token
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Authenticate a user
     */
    async login(req, res, next) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const { user, token } = await authService.login(validatedData);
            res.status(200).json({
                success: true,
                message: 'Welcome back!',
                user,
                token
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Google OAuth Login
     */
    async googleLogin(req, res, next) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                throw new AppError('ID Token is required', 400);
            }
            const { user, token } = await authService.googleLogin(idToken);
            res.status(200).json({
                success: true,
                message: 'Google login successful!',
                user,
                token
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify email via OTP
     */
    async verifyEmail(req, res, next) {
        try {
            const validatedData = otpSchema.parse(req.body);
            const result = await authService.verifyOTP(validatedData);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Resend verification OTP
     */
    async resendOTP(req, res, next) {
        try {
            const { email } = emailSchema.parse(req.body);
            const result = await authService.resendOTP(email);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Request password reset link
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = emailSchema.parse(req.body);
            const result = await authService.forgotPassword(email);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reset password using token
     */
    async resetPassword(req, res, next) {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const result = await authService.resetPassword(validatedData);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get current authenticated user profile
     */
    async getMe(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                user: req.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export default new AuthController();
//# sourceMappingURL=auth.controller.js.map