import { Request, Response } from "express";
import { createBookSchema, updateBookSchema } from "../validations/book.validation";
import { createBook, getAllBooks, getBookById, updateBook, deleteBook } from "../services/book.service";
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const fetchAllBooks = async (req: Request, res: Response) => {
    try {
        const books = await prisma.book.findMany({
            include: {
                owner: {
                    select: { name: true, phoneNumber: true }
                }
            }
        });
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const fetchBookById = async (req: Request, res: Response) => {
    try {
        const book = await prisma.book.findUnique({
            where: { id: req.params.id },
            include: {
                owner: {
                    select: { name: true, phoneNumber: true }
                }
            }
        });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const addNewBook = async (req: Request, res: Response) => {
    try {
        // Cek membership aktif dan belum expired
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                membershipActive: true,
                membershipExpiresAt: true
            }
        });
        const now = new Date();
        if (!user?.membershipActive || !user.membershipExpiresAt || user.membershipExpiresAt < now) {
            return res.status(403).json({ success: false, message: 'Membership tidak aktif atau sudah expired' });
        }
        req.body.ownerId = userId; // pastikan ownerId ada di body
        req.body.price = Number(req.body.price);
        req.body.accessible = req.body.accessible === 'true' || req.body.accessible === true;
        await createBookSchema.validateAsync(req.body);
        const imgPath = req.file ? req.file.path : null;
        const book = await createBook({ ...req.body, img: imgPath });
        res.status(201).json({ success: true, data: book });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const modifyBook = async (req: Request, res: Response) => {
    try {
        await updateBookSchema.validateAsync(req.body);
        const imgPath = req.file ? req.file.path : null;
        const book = await updateBook(req.params.id, req.body.img ? { ...req.body, img: imgPath } : req.body);
        res.status(200).json({ success: true, data: book });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const removeBook = async (req: Request, res: Response) => {
    try {
        // Ambil data book dulu
        const book = await getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        // Hapus file image jika ada
        if (book.img) {
            const filePath = path.resolve(book.img);
            fs.unlink(filePath, (err) => {
                if (err) {
                    // Log error, tapi tetap lanjut hapus book
                    console.error('Failed to delete image:', err);
                }
            });
        }
        await deleteBook(req.params.id);
        res.status(200).json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};