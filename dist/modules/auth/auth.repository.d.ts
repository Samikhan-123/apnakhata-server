import { RegisterInput } from './auth.validation.js';
export declare class AuthRepository {
    findByEmail(email: string): Promise<{
        password: string | null;
        name: string | null;
        email: string;
        baseCurrency: string;
        id: string;
        googleId: string | null;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        resetToken: string | null;
        resetExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        name: string | null;
        email: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        createdAt: Date;
    } | null>;
    create(data: RegisterInput & {
        passwordHash: string;
        verificationToken?: string;
        verificationExpiry?: Date;
        role?: string;
    }): Promise<{
        password: string | null;
        name: string | null;
        email: string;
        baseCurrency: string;
        id: string;
        googleId: string | null;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        resetToken: string | null;
        resetExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        password: string | null;
        name: string | null;
        email: string;
        baseCurrency: string;
        id: string;
        googleId: string | null;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        resetToken: string | null;
        resetExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByResetToken(token: string): Promise<{
        password: string | null;
        name: string | null;
        email: string;
        baseCurrency: string;
        id: string;
        googleId: string | null;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        verificationToken: string | null;
        verificationExpiry: Date | null;
        resetToken: string | null;
        resetExpiry: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
declare const _default: AuthRepository;
export default _default;
