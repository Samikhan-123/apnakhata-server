import prisma from '../config/prisma.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { AppError } from '../middlewares/error.middleware.js';
export class AuthService {
    async register(data) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }
        const hashedPassword = await hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        const token = generateToken(user.id);
        return { user, token };
    }
    async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user || !user.password) {
            throw new AppError('Invalid email or password', 401);
        }
        const isPasswordValid = await comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }
        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
}
export default new AuthService();
//# sourceMappingURL=auth.service.js.map