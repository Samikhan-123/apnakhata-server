import 'dotenv/config';
export declare class MailService {
    sendWelcomeEmail(email: string, name: string, otp: string): Promise<void>;
    sendVerificationOTP(email: string, otp: string): Promise<void>;
    sendPasswordResetOTP(email: string, otp: string): Promise<void>;
}
declare const _default: MailService;
export default _default;
