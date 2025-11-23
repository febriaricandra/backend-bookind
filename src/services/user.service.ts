import { prisma } from "../index";
import { createError } from "../middlewares/errorHandler";

//get users with pagination
export async function getUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
        skip,
        take: limit,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
        where: {
            role: 'USER'
        }
    });
    const totalUsers = await prisma.user.count();
    return {
        users,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
    };
}

//get user by id
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            password: false,
            membershipType: true,
            membershipActive: true,
            membershipExpiresAt: true,
            address: true,
            phoneNumber: true,
            createdAt: true,
        }
    });

    if (!user) {
        throw createError('User not found', 404);
    }

    return user;
}

//update user by id
export async function updateUser(id: string, data: Partial<{
    name: string;
    email: string;
    password: string;
}>) {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });
}

//delete user by id
export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: { id },
    });
}

//activate membership for user
export async function activateMembership(id: string, type: '1bulan' | '3bulan' | '6bulan') {
    let months = 1;
    if (type === '3bulan') months = 3;
    if (type === '6bulan') months = 6;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + months);
    return await prisma.user.update({
        where: { id },
        data: {
            membershipActive: true,
            membershipType: type,
            membershipExpiresAt: expiresAt,
        },
        select: {
            id: true,
            name: true,
            email: true,
            membershipActive: true,
            membershipType: true,
            membershipExpiresAt: true,
        }
    });
}