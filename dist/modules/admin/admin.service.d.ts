export declare class AdminService {
    /**
     * Get system-wide statistics
     */
    getSystemStats(): Promise<{
        totalUsers: number;
        totalEntries: number;
        totalVolume: number;
        newUsersLast30Days: number;
    }>;
    /**
     * Get all users with basic info
     */
    getAllUsers(): Promise<{
        name: string | null;
        email: string;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        isVerified: boolean;
        createdAt: Date;
        _count: {
            ledgerEntries: number;
        };
    }[]>;
    /**
     * Update user role or verification status
     */
    updateUser(id: string, data: {
        role?: 'ADMIN' | 'USER';
        isVerified?: boolean;
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
}
declare const _default: AdminService;
export default _default;
