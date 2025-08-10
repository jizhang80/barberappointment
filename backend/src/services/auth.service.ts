import bcrypt from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import { generateTokens, JwtPayload } from '../utils/jwt.utils';
import { redis } from '../config/redis';

const prisma = new PrismaClient();

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'BARBER';
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<{ user: Omit<User, 'password'>, tokens: { accessToken: string, refreshToken: string } }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'CUSTOMER',
      },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, {
      EX: 7 * 24 * 60 * 60, // 7 days
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async login(data: LoginData): Promise<{ user: Omit<User, 'password'>, tokens: { accessToken: string, refreshToken: string } }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, {
      EX: 7 * 24 * 60 * 60, // 7 days
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(userId: string): Promise<{ accessToken: string, refreshToken: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    await redis.set(`refresh_token:${user.id}`, tokens.refreshToken, {
      EX: 7 * 24 * 60 * 60, // 7 days
    });

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`);
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}