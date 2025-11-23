import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProfile(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phoneNumber: true,
            profileImg: true,
            membershipActive: true,
            membershipType: true,
            membershipExpiresAt: true,
            createdAt: true,
        }
    });
}

export async function updateProfile(userId: string, data: Partial<{ name: string; address: string; phoneNumber: string; profileImg: string; }>) {
    return await prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phoneNumber: true,
            profileImg: true,
            membershipActive: true,
            membershipType: true,
            membershipExpiresAt: true,
            createdAt: true,
        }
    });
}
