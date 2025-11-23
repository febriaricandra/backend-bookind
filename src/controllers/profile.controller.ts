import { Request, Response, NextFunction } from 'express';
import * as profileService from '../services/profile.service';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const profile = await profileService.getProfile(userId);
        res.json({ success: true, data: profile });
    } catch (err) {
        next(err);
    }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user?.id;
        console.log('Updating profile for userId:', req.user);
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const data = req.body;
        const profile = await profileService.updateProfile(userId, data);
        res.json({ success: true, data: profile });
    } catch (err) {
        next(err);
    }
}
