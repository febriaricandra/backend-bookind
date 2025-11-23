import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../index';
import { createError } from "../middlewares/errorHandler";

// Types
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'EMPLOYEE';
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export async function registerUser(data: RegisterData) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
    });

    if (existingUser) {
        throw createError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        }
    });

    return user;
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw createError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw createError('Invalid email or password', 401);
    }

    // Generate token
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const secret: Secret = process.env.JWT_SECRET as Secret;
    const signOptions: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN as any };

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        secret,
        signOptions
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
}