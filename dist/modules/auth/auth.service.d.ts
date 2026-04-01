import { RegisterInput, LoginInput, OTPInput, ResetPasswordInput } from './auth.validation.js';
export declare class AuthService {
    /**
     * Register a new user and send verification OTP
     */
    register(data: RegisterInput): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            isVerified: boolean;
            role: any;
        };
        token: string;
    }>;
    /**
     * Authenticate a user
     */
    login(data: LoginInput): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            isVerified: boolean;
            role: any;
        };
        token: string;
    }>;
    /**
     * Verify OTP for email verification
     */
    verifyOTP(data: OTPInput): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            isVerified: boolean;
            role: any;
        };
        token: string;
    }>;
    /**
     * Resend verification OTP
     */
    resendOTP(email: string): Promise<{
        message: string;
    }>;
    /**
     * Initiate password reset with OTP
     */
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    /**
     * Reset password using OTP
     */
    resetPassword(data: ResetPasswordInput): Promise<{
        message: string;
    }>;
    /**
     * Handle Google OAuth Login
     */
    googleLogin(googleToken: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            isVerified: boolean;
            role: import("@prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
}
declare const _default: AuthService;
export default _default;
