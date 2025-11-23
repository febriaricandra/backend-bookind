import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createBook(data: any) {
    return await prisma.book.create({ data });
}

export async function getAllBooks() {
    return await prisma.book.findMany();
}

export async function getBookById(id: string) {
    return await prisma.book.findUnique({ where: { id } });
}

export async function updateBook(id: string, data: any) {
    return await prisma.book.update({ where: { id }, data });
}

export async function deleteBook(id: string) {
    return await prisma.book.delete({ where: { id } });
}
