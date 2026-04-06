import prisma from '../../config/prisma.js';
export class AdminService {
    /**
     * Get system-wide statistics
     */
    async getSystemStats() {
        const [totalUsers, totalEntries, totalAmount] = await Promise.all([
            prisma.user.count(),
            prisma.ledgerEntry.count(),
            prisma.ledgerEntry.aggregate({
                _sum: { amount: true }
            })
        ]);
        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsersLast30Days = await prisma.user.count({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        });
        // Get User Trends (Last 6 Months)
        const userTrends = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: monthDate,
                        lt: nextMonthDate
                    }
                }
            });
            userTrends.push({
                month: monthDate.toLocaleString('default', { month: 'short' }),
                count
            });
        }
        return {
            totalUsers,
            totalEntries,
            totalVolume: Number(totalAmount._sum.amount || 0),
            newUsersLast30Days,
            userTrends
        };
    }
    /**
     * Get all users with basic info
     */
    async getAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: {
                    select: {
                        ledgerEntries: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    /**
     * Update user role or verification status
     */
    async updateUser(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }
}
export default new AdminService();
//# sourceMappingURL=admin.service.js.map