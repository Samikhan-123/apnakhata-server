import prisma from '../../config/prisma.js';
export class AuthRepository {
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }
    // find by id 
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                isVerified: true,
                role: true,
                createdAt: true,
            }
        });
    }
    // create user 
    async create(data) {
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.passwordHash,
                baseCurrency: data.baseCurrency || 'PKR',
                verificationToken: data.verificationToken,
                verificationExpiry: data.verificationExpiry,
                role: data.role || 'USER',
            }
        });
    }
    // update user 
    async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }
    // find by reset token 
    async findByResetToken(token) {
        return await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetExpiry: { gt: new Date() }
            }
        });
    }
}
export default new AuthRepository();
//# sourceMappingURL=auth.repository.js.map