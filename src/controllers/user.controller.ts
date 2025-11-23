import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await userService.getUsers(Number(page), Number(limit));
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const data = req.body;
        const user = await userService.updateUser(id, data);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        await userService.deleteUser(id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
}

export async function activateMembership(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { type } = req.body;
        const user = await userService.activateMembership(id, type);
        res.json(user);
    } catch (err) {
        next(err);
    }
}
