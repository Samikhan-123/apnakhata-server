import prisma from '../../config/prisma.js';
import { RegisterInput } from './auth.validation.js';

export class AuthRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // find by id 
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        isActive: true,
        role: true,
        lastActive: true,
        createdAt: true,
      }
    });
  }

  // create user 
  async create(data: RegisterInput & { passwordHash: string, verificationToken?: string, verificationExpiry?: Date, role?: 'ADMIN' | 'USER' }) {
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
  async update(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  // find by reset token 
  async findByResetToken(token: string) {
    return await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() }
      }
    });
  }
}

export default new AuthRepository();
