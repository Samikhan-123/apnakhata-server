import 'dotenv/config';
export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare const sendEmail: (options: SendEmailOptions) => Promise<{
    success: boolean;
    data: import("resend").CreateEmailResponseSuccess;
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
}>;
